import { Request, Response } from 'express';
import { db } from '../config/db';
import { z } from 'zod';

const createOrderSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID'),
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Invalid email'),
  customerPhone: z.string().min(10, 'Invalid phone number'),
  customerAddress: z.string().min(5, 'Address is too short'),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().int().positive(),
  })).min(1, 'Order must contain at least 1 item'),
  totalPrice: z.number().positive(),
});

// Create Order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const parsedData = createOrderSchema.parse(req.body);
    const userId = req.user ? req.user.id : null; // Support optional anonymous, but typically logged in

    const result = await db.query(
      `INSERT INTO orders (user_id, shop_id, customer_name, customer_email, customer_phone, customer_address, items, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') RETURNING *`,
      [
        userId,
        parsedData.shopId,
        parsedData.customerName,
        parsedData.customerEmail,
        parsedData.customerPhone,
        parsedData.customerAddress,
        JSON.stringify(parsedData.items),
        parsedData.totalPrice,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return res.status(500).json({ error: 'Failed to place order' });
  }
};

// Get Customer Orders
export const getCustomerOrders = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await db.query(
      `SELECT o.*, s.name as shop_name, s.logo_url as shop_logo
       FROM orders o
       JOIN shops s ON o.shop_id = s.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error fetching customer orders:', error);
    return res.status(500).json({ error: 'Failed to retrieve orders' });
  }
};

// Get Received Store Orders (For Owner Dashboard)
export const getShopOrders = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get shop owned by user
    const shopRes = await db.query('SELECT id FROM shops WHERE owner_id = $1', [req.user.id]);
    if (shopRes.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shopId = shopRes.rows[0].id;

    const result = await db.query(
      'SELECT * FROM orders WHERE shop_id = $1 ORDER BY created_at DESC',
      [shopId]
    );
    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error fetching shop orders:', error);
    return res.status(500).json({ error: 'Failed to retrieve received orders' });
  }
};

// Update Order Status
export const updateOrderStatus = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { status } = req.body; // 'confirmed', 'shipped', 'completed', 'cancelled'

  if (!status || !['pending', 'confirmed', 'shipped', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    // Check if user owns the shop that received this order
    const orderRes = await db.query('SELECT shop_id FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const shopId = orderRes.rows[0].shop_id;

    const shopRes = await db.query('SELECT owner_id FROM shops WHERE id = $1', [shopId]);
    const isOwner = shopRes.rows[0]?.owner_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions' });
    }

    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    return res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
};
