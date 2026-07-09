import { Request, Response } from 'express';
import { db } from '../config/db';
import { z } from 'zod';

const variantSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
});

const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  price: z.number().positive('Price must be greater than zero'),
  stock: z.number().int().nonnegative('Stock cannot be negative').default(10),
  imageUrl: z.string().url('Invalid image URL').or(z.string().length(0)).optional(),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  variants: z.array(variantSchema).optional(),
});

// Helper to check if shop belongs to owner
const checkProductOwnership = async (userId: string, productId: string, userRole: string): Promise<boolean> => {
  if (userRole === 'admin') return true;
  const prodRes = await db.query('SELECT shop_id FROM products WHERE id = $1', [productId]);
  if (prodRes.rows.length === 0) return false;
  const shopId = prodRes.rows[0].shop_id;
  const shopRes = await db.query('SELECT owner_id FROM shops WHERE id = $1', [shopId]);
  if (shopRes.rows.length === 0) return false;
  return shopRes.rows[0].owner_id === userId;
};

// Get All Products
export const getProducts = async (req: Request, res: Response) => {
  const { search, category, shopId } = req.query;

  try {
    let queryText = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (shopId) {
      queryText += ` AND shop_id = $${paramIndex}`;
      params.push(shopId);
      paramIndex++;
    }

    if (category && category !== 'All') {
      queryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await db.query(queryText, params);
    const products = result.rows;

    // Fetch and attach variants for all products in one query
    if (products.length > 0) {
      const productIds = products.map((p: any) => p.id);
      const varRes = await db.query('SELECT * FROM product_variants WHERE product_id = ANY($1::uuid[])', [productIds]);
      const variantsByProductId = varRes.rows.reduce((acc: any, variant: any) => {
        if (!acc[variant.product_id]) {
          acc[variant.product_id] = [];
        }
        acc[variant.product_id].push(variant);
        return acc;
      }, {});

      for (const product of products) {
        product.variants = variantsByProductId[product.id] || [];
      }
    }

    return res.status(200).json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to retrieve products' });
  }
};

// Create Product
export const createProduct = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const parsedData = createProductSchema.parse(req.body);
    const userId = req.user.id;

    // Get shop_id for this owner
    const shopRes = await db.query('SELECT id FROM shops WHERE owner_id = $1', [userId]);
    if (shopRes.rows.length === 0) {
      return res.status(403).json({ error: 'You must register a shop before adding products.' });
    }
    const shopId = shopRes.rows[0].id;

    // Start database transaction
    await db.query('BEGIN');

    const result = await db.query(
      `INSERT INTO products (shop_id, name, price, stock, image_url, category, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        shopId,
        parsedData.name,
        parsedData.price,
        parsedData.stock,
        parsedData.imageUrl || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80',
        parsedData.category,
        parsedData.description || null,
      ]
    );
    const product = result.rows[0];

    // Insert variants if present
    if (parsedData.variants && parsedData.variants.length > 0) {
      for (const variant of parsedData.variants) {
        await db.query(
          'INSERT INTO product_variants (product_id, size, color, stock) VALUES ($1, $2, $3, $4)',
          [product.id, variant.size, variant.color, variant.stock]
        );
      }
    }

    await db.query('COMMIT');

    // Fetch fresh variants for the created product to return
    const varRes = await db.query('SELECT * FROM product_variants WHERE product_id = $1', [product.id]);
    product.variants = varRes.rows;

    return res.status(201).json(product);
  } catch (error: any) {
    await db.query('ROLLBACK');
    console.error('Error creating product:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return res.status(500).json({ error: 'Failed to create product' });
  }
};

// Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  try {
    const isOwner = await checkProductOwnership(req.user.id, id, req.user.role);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied: You do not own this product' });
    }

    const deleteRes = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Update Product
export const updateProduct = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;

  try {
    const isOwner = await checkProductOwnership(req.user.id, id, req.user.role);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied: You do not own this product' });
    }

    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      price: z.number().positive().optional(),
      stock: z.number().int().nonnegative().optional(),
      imageUrl: z.string().url().or(z.string().length(0)).optional(),
      category: z.string().min(1).optional(),
      description: z.string().optional(),
    });

    const parsed = updateSchema.parse(req.body);
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (parsed.name !== undefined)        { updates.push(`name = $${idx++}`); values.push(parsed.name); }
    if (parsed.price !== undefined)       { updates.push(`price = $${idx++}`); values.push(parsed.price); }
    if (parsed.stock !== undefined)       { updates.push(`stock = $${idx++}`); values.push(parsed.stock); }
    if (parsed.imageUrl !== undefined)    { updates.push(`image_url = $${idx++}`); values.push(parsed.imageUrl); }
    if (parsed.category !== undefined)    { updates.push(`category = $${idx++}`); values.push(parsed.category); }
    if (parsed.description !== undefined) { updates.push(`description = $${idx++}`); values.push(parsed.description); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    values.push(id);
    const result = await db.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const product = result.rows[0];
    const varRes = await db.query('SELECT * FROM product_variants WHERE product_id = $1', [product.id]);
    product.variants = varRes.rows;

    return res.status(200).json(product);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
};

