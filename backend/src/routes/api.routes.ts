import { Router, Request, Response } from 'express';
import { googleLogin } from '../controllers/auth.controller';
import { 
  registerShop, 
  getShops, 
  getShopById, 
  updateShop, 
  addGalleryImages, 
  deleteGalleryImage, 
  togglePinGalleryImage,
  getMyShop,
  getCategories
} from '../controllers/shop.controller';
import { 
  toggleFollow, 
  getFollowStatus, 
  getShopFollowers 
} from '../controllers/follow.controller';
import { 
  getAllShops, 
  updateShopStatus, 
  toggleVerifyShop, 
  toggleFounderShop, 
  deleteShop, 
  getAdminAnalytics,
  getAllUsers,
  updateUserStatus,
  toggleVerifyUser
} from '../controllers/admin.controller';
import { 
  getProducts, 
  createProduct, 
  deleteProduct 
} from '../controllers/product.controller';
import { 
  createOrder, 
  getCustomerOrders, 
  getShopOrders, 
  updateOrderStatus 
} from '../controllers/order.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { db } from '../config/db';

const router = Router();

// PUBLIC ROUTES
router.post('/auth/google', googleLogin);
router.get('/categories', getCategories);
router.get('/shops', getShops);
router.get('/shops/:id', getShopById);
router.get('/shops/:id/follow-status', getFollowStatus);
router.get('/products', getProducts); // Browse products across all shops

// AUTHENTICATED USER ROUTES
router.post('/shops', authenticateToken, registerShop);
router.get('/shops/my/profile', authenticateToken, getMyShop);
router.put('/shops/:id', authenticateToken, updateShop);
router.post('/shops/:id/gallery', authenticateToken, addGalleryImages);
router.delete('/shops/:id/gallery/:imageId', authenticateToken, deleteGalleryImage);
router.put('/shops/:id/gallery/:imageId/pin', authenticateToken, togglePinGalleryImage);
router.post('/shops/:id/follow', authenticateToken, toggleFollow);
router.get('/shops/:id/followers', authenticateToken, getShopFollowers);

// Products Owner endpoints
router.post('/products', authenticateToken, createProduct);
router.delete('/products/:id', authenticateToken, deleteProduct);

// Orders Endpoints
router.post('/orders', authenticateToken, createOrder);
router.get('/orders/my', authenticateToken, getCustomerOrders);
router.get('/orders/shop', authenticateToken, getShopOrders);
router.put('/orders/:id/status', authenticateToken, updateOrderStatus);

// Notification routes
router.get('/notifications', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY current_timestamp DESC LIMIT 30',
      [req.user?.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

router.put('/notifications/:id/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user?.id]
    );
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// FOUNDER ADMIN PROTECTED ROUTES
router.get('/admin/shops', authenticateToken, requireAdmin, getAllShops);
router.put('/admin/shops/:id/status', authenticateToken, requireAdmin, updateShopStatus);
router.put('/admin/shops/:id/verify', authenticateToken, requireAdmin, toggleVerifyShop);
router.put('/admin/shops/:id/founder', authenticateToken, requireAdmin, toggleFounderShop);
router.delete('/admin/shops/:id', authenticateToken, requireAdmin, deleteShop);
router.get('/admin/analytics', authenticateToken, requireAdmin, getAdminAnalytics);
router.get('/admin/users', authenticateToken, requireAdmin, getAllUsers);
router.put('/admin/users/:id/status', authenticateToken, requireAdmin, updateUserStatus);
router.put('/admin/users/:id/verify', authenticateToken, requireAdmin, toggleVerifyUser);

export default router;
