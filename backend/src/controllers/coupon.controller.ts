import { Request, Response } from 'express';
import { db } from '../config/db';
import { z } from 'zod';

// ─── COUPON SCHEMAS ────────────────────────────────────────────────────────────
const createCouponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters').max(20).toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive('Discount value must be positive'),
  minOrderValue: z.number().nonnegative().default(0),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
});

// ─── GET ALL COUPONS FOR SHOP ──────────────────────────────────────────────────
export const getShopCoupons = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const shopRes = await db.query('SELECT id FROM shops WHERE owner_id = $1', [req.user.id]);
    if (shopRes.rows.length === 0) return res.status(404).json({ error: 'No shop found' });
    const shopId = shopRes.rows[0].id;
    const result = await db.query('SELECT * FROM coupons WHERE shop_id = $1 ORDER BY created_at DESC', [shopId]);
    return res.status(200).json(result.rows);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve coupons' });
  }
};

// ─── CREATE COUPON ─────────────────────────────────────────────────────────────
export const createCoupon = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const data = createCouponSchema.parse(req.body);
    const shopRes = await db.query('SELECT id FROM shops WHERE owner_id = $1', [req.user.id]);
    if (shopRes.rows.length === 0) return res.status(404).json({ error: 'No shop found' });
    const shopId = shopRes.rows[0].id;

    // Check for duplicate code in this shop
    const dupCheck = await db.query('SELECT id FROM coupons WHERE shop_id = $1 AND code = $2', [shopId, data.code]);
    if (dupCheck.rows.length > 0) return res.status(409).json({ error: 'Coupon code already exists for this shop.' });

    const result = await db.query(
      `INSERT INTO coupons (shop_id, code, discount_type, discount_value, min_order_value, max_uses, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [shopId, data.code, data.discountType, data.discountValue, data.minOrderValue, data.maxUses || null, data.expiresAt || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Coupon creation error:', err);
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    return res.status(500).json({ error: 'Failed to create coupon' });
  }
};

// ─── DELETE COUPON ─────────────────────────────────────────────────────────────
export const deleteCoupon = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  try {
    const shopRes = await db.query('SELECT id FROM shops WHERE owner_id = $1', [req.user.id]);
    if (shopRes.rows.length === 0) return res.status(403).json({ error: 'No shop found' });
    const shopId = shopRes.rows[0].id;
    const result = await db.query('DELETE FROM coupons WHERE id = $1 AND shop_id = $2 RETURNING *', [id, shopId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Coupon not found' });
    return res.status(200).json({ message: 'Coupon deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete coupon' });
  }
};

// ─── VALIDATE COUPON (Customer applies coupon at checkout) ────────────────────
export const validateCoupon = async (req: Request, res: Response) => {
  const { code, shopId, orderTotal } = req.body;
  if (!code || !shopId || orderTotal === undefined) {
    return res.status(400).json({ error: 'code, shopId, and orderTotal are required' });
  }
  try {
    const result = await db.query(
      `SELECT * FROM coupons WHERE shop_id = $1 AND code = $2`,
      [shopId, String(code).toUpperCase()]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invalid coupon code.' });

    const coupon = result.rows[0];

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired.' });
    }
    // Check max uses
    if (coupon.max_uses !== null && coupon.use_count >= coupon.max_uses) {
      return res.status(400).json({ error: 'Coupon has reached its usage limit.' });
    }
    // Check min order
    if (Number(orderTotal) < Number(coupon.min_order_value)) {
      return res.status(400).json({ error: `Minimum order value of ₹${coupon.min_order_value} required.` });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((Number(orderTotal) * Number(coupon.discount_value)) / 100);
    } else {
      discountAmount = Number(coupon.discount_value);
    }
    discountAmount = Math.min(discountAmount, Number(orderTotal));

    return res.status(200).json({
      valid: true,
      coupon,
      discountAmount,
      finalTotal: Number(orderTotal) - discountAmount,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to validate coupon' });
  }
};
