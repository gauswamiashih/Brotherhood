import { Request, Response } from 'express';
import { db } from '../config/db';
import { z } from 'zod';

const wishlistSchema = z.object({
  productId: z.string().min(1),
});

// ─── GET WISHLIST ──────────────────────────────────────────────────────────────
export const getWishlist = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = await db.query(
      `SELECT w.id, w.created_at, p.id as product_id, p.name, p.price, p.image_url, p.category, p.description, s.name as shop_name, s.id as shop_id
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       JOIN shops s ON p.shop_id = s.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json(result.rows);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve wishlist' });
  }
};

// ─── TOGGLE WISHLIST ITEM ──────────────────────────────────────────────────────
export const toggleWishlist = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { productId } = wishlistSchema.parse(req.body);
    // Check if already in wishlist
    const existing = await db.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );
    if (existing.rows.length > 0) {
      await db.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [req.user.id, productId]);
      return res.status(200).json({ action: 'removed', message: 'Removed from wishlist' });
    } else {
      // Verify product exists
      const prodCheck = await db.query('SELECT id FROM products WHERE id = $1', [productId]);
      if (prodCheck.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      await db.query('INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)', [req.user.id, productId]);
      return res.status(201).json({ action: 'added', message: 'Added to wishlist' });
    }
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    return res.status(500).json({ error: 'Failed to update wishlist' });
  }
};

// ─── GET WISHLIST STATUS FOR PRODUCT ──────────────────────────────────────────
export const getWishlistStatus = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { productId } = req.params;
  try {
    const result = await db.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );
    return res.status(200).json({ inWishlist: result.rows.length > 0 });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to check wishlist status' });
  }
};
