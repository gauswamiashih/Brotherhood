import { Request, Response } from 'express';
import { db } from '../config/db';

// 1. Toggle Follow/Unfollow
export const toggleFollow = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id: shopId } = req.params;
  const userId = req.user.id;

  try {
    // Check if shop exists
    const shopRes = await db.query('SELECT id, owner_id, name FROM shops WHERE id = $1', [shopId]);
    if (shopRes.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = shopRes.rows[0];

    // Users cannot follow their own shops
    if (shop.owner_id === userId) {
      return res.status(400).json({ error: 'You cannot follow your own shop' });
    }

    // Check if already following
    const followCheck = await db.query(
      'SELECT id FROM followers WHERE user_id = $1 AND shop_id = $2',
      [userId, shopId]
    );

    let following = false;

    if (followCheck.rows.length > 0) {
      // Unfollow
      await db.query('DELETE FROM followers WHERE user_id = $1 AND shop_id = $2', [userId, shopId]);
      following = false;

      // Log activity
      await db.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [userId, 'unfollow_shop', `Unfollowed shop: ${shop.name}`]
      );
    } else {
      // Follow
      await db.query('INSERT INTO followers (user_id, shop_id) VALUES ($1, $2)', [userId, shopId]);
      following = true;

      // Send a notification to the owner if they want notifications
      // 1. Find shop owner's user id
      const ownerId = shop.owner_id;
      // 2. Check settings
      const settingsCheck = await db.query('SELECT allow_notifications FROM shop_settings WHERE shop_id = $1', [shopId]);
      const allowNotifications = settingsCheck.rows.length > 0 ? settingsCheck.rows[0].allow_notifications : true;

      if (allowNotifications) {
        await db.query(
          'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
          [ownerId, 'New Follower!', `${req.user.name} is now following your shop: ${shop.name}`]
        );
      }

      // Log activity
      await db.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [userId, 'follow_shop', `Followed shop: ${shop.name}`]
      );
    }

    // Count new follower total
    const countRes = await db.query('SELECT COUNT(*)::int FROM followers WHERE shop_id = $1', [shopId]);
    const followerCount = countRes.rows[0].count;

    return res.status(200).json({
      following,
      followerCount,
    });
  } catch (error: any) {
    console.error('Error toggling follow status:', error);
    return res.status(500).json({ error: 'Failed to process follow command' });
  }
};

// 2. Get Follow Status for Logged In User
export const getFollowStatus = async (req: Request, res: Response) => {
  const { id: shopId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(200).json({ following: false });
  }

  try {
    const followCheck = await db.query(
      'SELECT id FROM followers WHERE user_id = $1 AND shop_id = $2',
      [userId, shopId]
    );

    return res.status(200).json({
      following: followCheck.rows.length > 0,
    });
  } catch (error: any) {
    console.error('Error fetching follow status:', error);
    return res.status(500).json({ error: 'Failed to fetch follow status' });
  }
};

// 3. Get Followers List for Dashboard Analytics
export const getShopFollowers = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id: shopId } = req.params;

  try {
    // Authenticated user must be the shop owner or an admin
    const shopRes = await db.query('SELECT owner_id FROM shops WHERE id = $1', [shopId]);
    if (shopRes.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const isOwner = shopRes.rows[0].owner_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.avatar_url, f.created_at as followed_at
       FROM followers f
       JOIN users u ON f.user_id = u.id
       WHERE f.shop_id = $1
       ORDER BY f.created_at DESC`,
      [shopId]
    );

    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error fetching shop followers:', error);
    return res.status(500).json({ error: 'Failed to retrieve followers list' });
  }
};
