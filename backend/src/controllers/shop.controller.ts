import { Request, Response } from 'express';
import { db } from '../config/db';
import { z } from 'zod';
import { queueEmail } from '../services/email/email.service';

// Zod schemas for input validation
const registerShopSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  city: z.string().default('Palanpur'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  instagramUrl: z.string().url('Invalid Instagram URL').or(z.string().length(0)).optional(),
  logoUrl: z.string().url('Invalid logo URL').or(z.string().length(0)).optional(),
  coverUrl: z.string().url('Invalid cover URL').or(z.string().length(0)).optional(),
  galleryUrls: z.array(z.string().url()).optional(),
});

const updateShopSchema = z.object({
  name: z.string().min(2).optional(),
  ownerName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  city: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  instagramUrl: z.string().url().or(z.string().length(0)).optional(),
  logoUrl: z.string().url().or(z.string().length(0)).optional(),
  coverUrl: z.string().url().or(z.string().length(0)).optional(),
});

// Helper: Check if current user owns the shop
const verifyShopOwnership = async (userId: string, shopId: string, role: string): Promise<boolean> => {
  if (role === 'admin') return true;
  const shopRes = await db.query('SELECT owner_id FROM shops WHERE id = $1', [shopId]);
  if (shopRes.rows.length === 0) return false;
  return shopRes.rows[0].owner_id === userId;
};

// 1. Get Categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT * FROM shop_categories ORDER BY name ASC');
    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to retrieve categories' });
  }
};

// 2. Register Shop
export const registerShop = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const parsedData = registerShopSchema.parse(req.body);
    const userId = req.user.id;

    // Check if user already owns a shop
    const existingShop = await db.query('SELECT id FROM shops WHERE owner_id = $1', [userId]);
    if (existingShop.rows.length > 0) {
      return res.status(400).json({ error: 'You have already registered a shop' });
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Insert shop
      const shopResult = await client.query(
        `INSERT INTO shops (
          owner_id, name, owner_name, phone, email, city, category, 
          description, instagram_url, logo_url, cover_url, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending') RETURNING *`,
        [
          userId,
          parsedData.name,
          parsedData.ownerName,
          parsedData.phone,
          parsedData.email,
          parsedData.city,
          parsedData.category,
          parsedData.description || null,
          parsedData.instagramUrl || null,
          parsedData.logoUrl || null,
          parsedData.coverUrl || null,
        ]
      );

      const shop = shopResult.rows[0];

      // Update user role to 'owner'
      await client.query("UPDATE users SET role = 'owner' WHERE id = $1", [userId]);

      // Initialize default shop settings
      await client.query(
        'INSERT INTO shop_settings (shop_id, allow_notifications, theme_settings) VALUES ($1, $2, $3)',
        [shop.id, true, JSON.stringify({ theme: 'dark' })]
      );

      // Insert initial gallery images if provided
      if (parsedData.galleryUrls && parsedData.galleryUrls.length > 0) {
        for (const url of parsedData.galleryUrls) {
          await client.query(
            'INSERT INTO shop_gallery (shop_id, image_url, is_pinned) VALUES ($1, $2, $3)',
            [shop.id, url, false]
          );
        }
      }

      // Log activity
      await client.query(
        'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [userId, 'register_shop', `Registered shop: ${shop.name} (Pending Approval)`]
      );

      await client.query('COMMIT');

      // Queue email alerts
      await queueEmail(parsedData.email, parsedData.ownerName, 'shop_registration', {
        ownerName: parsedData.ownerName,
        shopName: parsedData.name,
        phone: parsedData.phone,
        city: parsedData.city,
        category: parsedData.category
      });

      await queueEmail('gauswamiashish760@gmail.com', 'Founder Admin', 'new_vendor', {
        shopName: parsedData.name,
        ownerName: parsedData.ownerName,
        ownerEmail: parsedData.email,
        category: parsedData.category
      });

      return res.status(201).json({
        message: 'Shop registered successfully. Awaiting admin approval.',
        shop,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error registering shop:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return res.status(500).json({ error: 'Failed to register shop', details: error.message });
  }
};

// 3. Get Approved Shops (Marketplace listing with search/filter/sort)
export const getShops = async (req: Request, res: Response) => {
  const { search, category, sort } = req.query;

  try {
    let queryText = `
      SELECT s.*, 
             COUNT(f.id)::int as follower_count
      FROM shops s
      LEFT JOIN followers f ON s.id = f.shop_id
      WHERE s.status = 'approved'
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      queryText += ` AND (s.name ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category && category !== 'All') {
      queryText += ` AND s.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    queryText += ` GROUP BY s.id`;

    // Sorting rule: is_founder DESC always first, then apply selected sort logic
    if (sort === 'popular') {
      queryText += ` ORDER BY s.is_founder DESC, follower_count DESC, s.created_at DESC`;
    } else if (sort === 'newest') {
      queryText += ` ORDER BY s.is_founder DESC, s.created_at DESC`;
    } else {
      // Default: Founder first, then alphabetical/newest
      queryText += ` ORDER BY s.is_founder DESC, s.name ASC`;
    }

    const result = await db.query(queryText, params);
    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error fetching shops:', error);
    return res.status(500).json({ error: 'Failed to retrieve shops' });
  }
};

// 4. Get Shop By ID (Includes gallery and followers)
export const getShopById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Get shop profile
    const shopResult = await db.query(
      `SELECT s.*, 
              COUNT(f.id)::int as follower_count
       FROM shops s
       LEFT JOIN followers f ON s.id = f.shop_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );

    if (shopResult.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const shop = shopResult.rows[0];

    // Blocked shops should not be visible to public (only admin or the owner can view them)
    if (shop.status === 'blocked') {
      const isOwnerOrAdmin = req.user && (req.user.role === 'admin' || shop.owner_id === req.user.id);
      if (!isOwnerOrAdmin) {
        return res.status(403).json({ error: 'This shop has been suspended by administration.' });
      }
    }

    // Get gallery
    const galleryResult = await db.query(
      'SELECT * FROM shop_gallery WHERE shop_id = $1 ORDER BY is_pinned DESC, created_at DESC',
      [id]
    );

    return res.status(200).json({
      ...shop,
      gallery: galleryResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching shop profile:', error);
    return res.status(500).json({ error: 'Failed to retrieve shop details' });
  }
};

// 5. Update Shop Profile Details
export const updateShop = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  try {
    const isOwner = await verifyShopOwnership(req.user.id, id, req.user.role);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied: You do not own this shop' });
    }

    const parsedData = updateShopSchema.parse(req.body);

    // Build update query dynamically
    const fields: string[] = [];
    const values: any[] = [];
    let valIndex = 1;

    Object.entries(parsedData).forEach(([key, value]) => {
      if (value !== undefined) {
        // Map camelCase fields to snake_case table columns
        const dbColumn = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbColumn} = $${valIndex}`);
        values.push(value);
        valIndex++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    values.push(id);
    const queryText = `UPDATE shops SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${valIndex} RETURNING *`;
    const result = await db.query(queryText, values);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'update_shop', `Updated shop settings for: ${result.rows[0].name}`]
    );

    return res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating shop:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return res.status(500).json({ error: 'Failed to update shop details' });
  }
};

// 6. Add Images to Gallery
export const addGalleryImages = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { urls } = req.body; // Array of image URLs

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'urls array is required and cannot be empty' });
  }

  try {
    const isOwner = await verifyShopOwnership(req.user.id, id, req.user.role);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const results = [];
    for (const url of urls) {
      const inserted = await db.query(
        'INSERT INTO shop_gallery (shop_id, image_url, is_pinned) VALUES ($1, $2, false) RETURNING *',
        [id, url]
      );
      results.push(inserted.rows[0]);
    }

    return res.status(201).json(results);
  } catch (error: any) {
    console.error('Error adding gallery images:', error);
    return res.status(500).json({ error: 'Failed to add gallery images' });
  }
};

// 7. Delete Gallery Image
export const deleteGalleryImage = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id, imageId } = req.params;

  try {
    const isOwner = await verifyShopOwnership(req.user.id, id, req.user.role);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deleteRes = await db.query(
      'DELETE FROM shop_gallery WHERE id = $1 AND shop_id = $2 RETURNING *',
      [imageId, id]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found in gallery' });
    }

    return res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting gallery image:', error);
    return res.status(500).json({ error: 'Failed to delete gallery image' });
  }
};

// 8. Toggle Pinned Image (Max 3)
export const togglePinGalleryImage = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id, imageId } = req.params;

  try {
    const isOwner = await verifyShopOwnership(req.user.id, id, req.user.role);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check current state of the image
    const imgRes = await db.query('SELECT is_pinned FROM shop_gallery WHERE id = $1 AND shop_id = $2', [imageId, id]);
    if (imgRes.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found in gallery' });
    }

    const willPin = !imgRes.rows[0].is_pinned;

    if (willPin) {
      // Check count of currently pinned images
      const pinnedRes = await db.query('SELECT COUNT(*) FROM shop_gallery WHERE shop_id = $1 AND is_pinned = true', [id]);
      const pinnedCount = parseInt(pinnedRes.rows[0].count, 10);
      if (pinnedCount >= 3) {
        return res.status(400).json({ error: 'You can pin a maximum of 3 gallery images' });
      }
    }

    const updateRes = await db.query(
      'UPDATE shop_gallery SET is_pinned = $1 WHERE id = $2 AND shop_id = $3 RETURNING *',
      [willPin, imageId, id]
    );

    return res.status(200).json(updateRes.rows[0]);
  } catch (error: any) {
    console.error('Error pinning gallery image:', error);
    return res.status(500).json({ error: 'Failed to toggle pin state', details: error.message });
  }
};

// 9. Get Logged in User's own shop details
export const getMyShop = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const shopResult = await db.query('SELECT * FROM shops WHERE owner_id = $1', [req.user.id]);
    if (shopResult.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const shop = shopResult.rows[0];
    const galleryResult = await db.query(
      'SELECT * FROM shop_gallery WHERE shop_id = $1 ORDER BY is_pinned DESC, created_at DESC',
      [shop.id]
    );

    return res.status(200).json({
      ...shop,
      gallery: galleryResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching own shop profile:', error);
    return res.status(500).json({ error: 'Failed to retrieve shop' });
  }
};
