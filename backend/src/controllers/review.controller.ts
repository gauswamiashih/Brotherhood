import { Request, Response } from 'express';
import { db } from '../config/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'brotherhood_clothing_secret_key_2026';

export const createReview = async (req: Request, res: Response) => {
  const { shopId, productId, rating, comment } = req.body;
  const userId = req.user?.id;

  if (!productId || !shopId || !rating || !comment) {
    res.status(400).json({ error: 'Missing required review fields' });
    return;
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    return;
  }

  try {
    // Verified purchase check
    const ordersResult = await db.query(
      `SELECT items FROM orders WHERE user_id = $1 AND status IN ('completed', 'shipped', 'confirmed')`,
      [userId]
    );

    let hasPurchased = false;
    for (const order of ordersResult.rows) {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      if (Array.isArray(items) && items.some((item: any) => item.id === productId)) {
        hasPurchased = true;
        break;
      }
    }

    if (!hasPurchased) {
      res.status(400).json({ error: 'Only verified buyers who have purchased this product can leave reviews.' });
      return;
    }

    const insertResult = await db.query(
      `INSERT INTO reviews (user_id, shop_id, product_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, shopId, productId, numericRating, comment]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  const { productId } = req.params;

  try {
    const reviewsResult = await db.query(
      `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = $1 
       ORDER BY r.created_at DESC`,
      [productId]
    );

    const statsResult = await db.query(
      `SELECT AVG(rating)::numeric(2,1) as avg_rating, COUNT(*)::int as review_count 
       FROM reviews 
       WHERE product_id = $1`,
      [productId]
    );

    let eligibleToReview = false;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const ordersResult = await db.query(
          `SELECT items FROM orders WHERE user_id = $1 AND status IN ('completed', 'shipped', 'confirmed')`,
          [decoded.id]
        );
        for (const order of ordersResult.rows) {
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          if (Array.isArray(items) && items.some((item: any) => item.id === productId)) {
            eligibleToReview = true;
            break;
          }
        }

        // Also check if they already reviewed it (limit 1 review per user per product)
        const existingReviewResult = await db.query(
          `SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2`,
          [decoded.id, productId]
        );
        if (existingReviewResult.rows.length > 0) {
          eligibleToReview = false;
        }
      } catch (e) {
        // Token verification failed or SQL failed; keep eligibleToReview = false
      }
    }

    res.status(200).json({
      reviews: reviewsResult.rows,
      stats: statsResult.rows[0] || { avg_rating: '0.0', review_count: 0 },
      eligibleToReview
    });
  } catch (error: any) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
};

export const getShopReviews = async (req: Request, res: Response) => {
  const { shopId } = req.params;

  try {
    const reviewsResult = await db.query(
      `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.shop_id = $1 
       ORDER BY r.created_at DESC`,
      [shopId]
    );

    const statsResult = await db.query(
      `SELECT AVG(rating)::numeric(2,1) as avg_rating, COUNT(*)::int as review_count 
       FROM reviews 
       WHERE shop_id = $1`,
      [shopId]
    );

    res.status(200).json({
      reviews: reviewsResult.rows,
      stats: statsResult.rows[0] || { avg_rating: '0.0', review_count: 0 }
    });
  } catch (error: any) {
    console.error('Error fetching shop reviews:', error);
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
};
