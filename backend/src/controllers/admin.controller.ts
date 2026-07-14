import { Request, Response } from 'express';
import { db } from '../config/db';
import { queueEmail } from '../services/email/email.service';

// 1. Get All Shops (Admin Table View)
export const getAllShops = async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT s.*, 
              u.email as owner_email,
              u.name as owner_account_name,
              COUNT(f.id)::int as follower_count
       FROM shops s
       JOIN users u ON s.owner_id = u.id
       LEFT JOIN followers f ON s.id = f.shop_id
       GROUP BY s.id, u.email, u.name
       ORDER BY s.created_at DESC`
    );
    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Admin error fetching shops:', error);
    return res.status(500).json({ error: 'Failed to retrieve shops' });
  }
};

// 2. Update Shop Status (Approve, Reject, Block)
export const updateShopStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved', 'rejected', 'blocked', 'pending'

  if (!status || !['pending', 'approved', 'rejected', 'blocked'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Fetch old shop details for log
    const oldShopRes = await client.query('SELECT name, owner_id, status, owner_name, email FROM shops WHERE id = $1', [id]);
    if (oldShopRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = oldShopRes.rows[0];

    // Update status
    const updateRes = await client.query(
      'UPDATE shops SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    // If status is 'blocked', we could also optionally downgrade owner role,
    // but typically we keep them as owner so they can log in and see status or request appeal.
    // If status becomes approved, make sure role is 'owner'
    if (status === 'approved') {
      await client.query("UPDATE users SET role = 'owner' WHERE id = $1", [shop.owner_id]);
    }

    // Insert admin log
    await client.query(
      `INSERT INTO admin_logs (admin_id, action, target_id, target_type, details) 
       VALUES ($1, $2, $3, 'shop', $4)`,
      [
        req.user?.id,
        'update_shop_status',
        id,
        `Status updated from '${shop.status}' to '${status}' for shop: ${shop.name}`,
      ]
    );

    // Create user notification
    const notificationTitle = `Shop Status Updated: ${status.toUpperCase()}`;
    const notificationMsg = status === 'approved' 
      ? `Congratulations! Your shop "${shop.name}" has been approved and is now live on the marketplace.`
      : status === 'blocked'
      ? `Your shop "${shop.name}" has been suspended/blocked by the admin. Please contact support.`
      : `Your shop registration request for "${shop.name}" status has been set to ${status}.`;

    await client.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [shop.owner_id, notificationTitle, notificationMsg]
    );

    await client.query('COMMIT');

    // Queue email status alert
    await queueEmail(shop.email, shop.owner_name, 'shop_status', {
      ownerName: shop.owner_name,
      shopName: shop.name,
      status: status,
      reason: req.body.reason || 'Boutique details did not meet our brand standards.'
    });

    return res.status(200).json(updateRes.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating shop status:', error);
    return res.status(500).json({ error: 'Failed to update status', details: error.message });
  } finally {
    client.release();
  }
};

// 3. Toggle Shop Verification Badge
export const toggleVerifyShop = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const shopRes = await db.query('SELECT name, owner_id, is_verified FROM shops WHERE id = $1', [id]);
    if (shopRes.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = shopRes.rows[0];
    const newVerified = !shop.is_verified;

    await db.query('UPDATE shops SET is_verified = $1 WHERE id = $2', [newVerified, id]);

    // Admin Log
    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_id, target_type, details) 
       VALUES ($1, $2, $3, 'shop', $4)`,
      [
        req.user?.id,
        'toggle_shop_verification',
        id,
        `Set is_verified = ${newVerified} for shop: ${shop.name}`,
      ]
    );

    // Notify Owner
    const msg = newVerified 
      ? `Your shop "${shop.name}" has received a Verified Badge! A blue checkmark has been added to your profile.`
      : `Verification badge has been removed from your shop profile.`;

    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [shop.owner_id, 'Verification Badge Update', msg]
    );

    return res.status(200).json({ is_verified: newVerified });
  } catch (error: any) {
    console.error('Error toggling verification:', error);
    return res.status(500).json({ error: 'Failed to toggle verification' });
  }
};

// 4. Toggle Founder Shop Badge
export const toggleFounderShop = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const shopRes = await db.query('SELECT name, is_founder FROM shops WHERE id = $1', [id]);
    if (shopRes.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = shopRes.rows[0];
    const newFounder = !shop.is_founder;

    await db.query('UPDATE shops SET is_founder = $1 WHERE id = $2', [newFounder, id]);

    // Admin Log
    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_id, target_type, details) 
       VALUES ($1, $2, $3, 'shop', $4)`,
      [
        req.user?.id,
        'toggle_founder_badge',
        id,
        `Set is_founder = ${newFounder} for shop: ${shop.name}`,
      ]
    );

    return res.status(200).json({ is_founder: newFounder });
  } catch (error: any) {
    console.error('Error toggling founder badge:', error);
    return res.status(500).json({ error: 'Failed to toggle founder status' });
  }
};

// 5. Delete Shop Entirely
export const deleteShop = async (req: Request, res: Response) => {
  const { id } = req.params;

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const shopRes = await client.query('SELECT name, owner_id FROM shops WHERE id = $1', [id]);
    if (shopRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = shopRes.rows[0];

    // Delete shop (cascade deletes gallery, followers, settings)
    await client.query('DELETE FROM shops WHERE id = $1', [id]);

    // Downgrade user role back to 'customer'
    await client.query("UPDATE users SET role = 'customer' WHERE id = $1", [shop.owner_id]);

    // Insert Admin Log
    await client.query(
      `INSERT INTO admin_logs (admin_id, action, target_id, target_type, details) 
       VALUES ($1, 'delete_shop', $2, 'shop', $3)`,
      [req.user?.id, id, `Permanently deleted shop: ${shop.name}`]
    );

    await client.query('COMMIT');
    return res.status(200).json({ message: `Shop "${shop.name}" deleted successfully.` });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error deleting shop:', error);
    return res.status(500).json({ error: 'Failed to delete shop' });
  } finally {
    client.release();
  }
};

// 6. Get Admin Dashboard Analytics
export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    // Total users count
    const usersCountRes = await db.query('SELECT COUNT(*)::int FROM users');
    // Total shops count by status
    const shopsStatusRes = await db.query(
      `SELECT status, COUNT(*)::int as count 
       FROM shops 
       GROUP BY status`
    );
    // Total followers count
    const followersCountRes = await db.query('SELECT COUNT(*)::int FROM followers');

    // Recent activity logs (last 15)
    const activitiesRes = await db.query(
      `SELECT a.*, u.name as user_name, u.email as user_email
       FROM activity_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC
       LIMIT 15`
    );

    // Recent admin logs (last 15)
    const adminLogsRes = await db.query(
      `SELECT al.*, u.name as admin_name
       FROM admin_logs al
       LEFT JOIN users u ON al.admin_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 15`
    );

    const stats = {
      totalUsers: usersCountRes.rows[0].count,
      totalFollowers: followersCountRes.rows[0].count,
      totalShops: 0,
      statusCounts: {
        pending: 0,
        approved: 0,
        rejected: 0,
        blocked: 0,
      } as Record<string, number>,
    };

    shopsStatusRes.rows.forEach((row: any) => {
      stats.totalShops += row.count;
      stats.statusCounts[row.status] = row.count;
    });

    return res.status(200).json({
      stats,
      activities: activitiesRes.rows,
      adminLogs: adminLogsRes.rows,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

// 7. Get user accounts list (expanded with status and verified checks)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, avatar_url, role, status, is_verified, created_at FROM users ORDER BY created_at DESC'
    );
    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Admin error fetching users:', error);
    return res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

// 8. Update User Account Status (Block / Suspend / Reactivate)
export const updateUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'active', 'suspended', 'blocked'

  if (!status || !['active', 'suspended', 'blocked'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const userRes = await db.query('SELECT name, email, status FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userRes.rows[0];

    const result = await db.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Create Admin Audit Log
    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_id, target_type, details) 
       VALUES ($1, $2, $3, 'user', $4)`,
      [
        req.user?.id,
        'update_user_status',
        id,
        `Account status updated from '${user.status}' to '${status}' for user: ${user.name} (${user.email})`,
      ]
    );

    // Notify User
    const title = `Account Status Update`;
    const msg = status === 'active' 
      ? `Your account status has been reactivated. You have regained full access to your dashboard.`
      : `Your account has been set to: ${status.toUpperCase()} by the system administrator.`;

    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [id, title, msg]
    );

    // Queue account status email
    await queueEmail(user.email, user.name, 'account_status', {
      name: user.name,
      status: status
    });

    return res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ error: 'Failed to update user status' });
  }
};

// 9. Toggle User Verification
export const toggleVerifyUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const userRes = await db.query('SELECT name, email, is_verified FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userRes.rows[0];
    const newVerified = !user.is_verified;

    await db.query('UPDATE users SET is_verified = $1 WHERE id = $2', [newVerified, id]);

    // Admin Log
    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_id, target_type, details) 
       VALUES ($1, $2, $3, 'user', $4)`,
      [
        req.user?.id,
        'toggle_user_verification',
        id,
        `Verification state set to ${newVerified} for user: ${user.name} (${user.email})`,
      ]
    );

    // Notify user
    const title = `Verification Status Updated`;
    const msg = newVerified 
      ? `Your account has been officially verified by the administrator!`
      : `Your verified user badge has been revoked.`;

    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [id, title, msg]
    );

    return res.status(200).json({ is_verified: newVerified });
  } catch (error: any) {
    console.error('Error toggling user verification:', error);
    return res.status(500).json({ error: 'Failed to toggle user verification' });
  }
};
