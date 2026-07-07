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
  updateOrderStatus,
  payOrderSimulate
} from '../controllers/order.controller';
import { getShopCoupons, createCoupon, deleteCoupon, validateCoupon } from '../controllers/coupon.controller';
import { getWishlist, toggleWishlist, getWishlistStatus } from '../controllers/wishlist.controller';
import { updateProduct } from '../controllers/product.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { db } from '../config/db';
import { upload, handleUpload } from '../controllers/media.controller';
import { createReview, getProductReviews, getShopReviews } from '../controllers/review.controller';
import { sendMessage, getChatHistory, getConversations, markAsRead } from '../controllers/message.controller';
import aiRoutes from './ai.routes';

const router = Router();
router.use(aiRoutes);

// Media Upload
router.post('/media/upload', authenticateToken, upload.single('image'), handleUpload);

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
router.put('/products/:id', authenticateToken, updateProduct);
router.delete('/products/:id', authenticateToken, deleteProduct);

// Coupon endpoints
router.get('/coupons', authenticateToken, getShopCoupons);
router.post('/coupons', authenticateToken, createCoupon);
router.delete('/coupons/:id', authenticateToken, deleteCoupon);
router.post('/coupons/validate', validateCoupon);

// Wishlist endpoints
router.get('/wishlist', authenticateToken, getWishlist);
router.post('/wishlist', authenticateToken, toggleWishlist);
router.get('/wishlist/:productId/status', authenticateToken, getWishlistStatus);

// Orders Endpoints
router.post('/orders', authenticateToken, createOrder);
router.get('/orders/my', authenticateToken, getCustomerOrders);
router.get('/orders/shop', authenticateToken, getShopOrders);
router.put('/orders/:id/status', authenticateToken, updateOrderStatus);
router.post('/orders/:id/pay', authenticateToken, payOrderSimulate);

// Reviews Routes
router.post('/reviews', authenticateToken, createReview);
router.get('/reviews/product/:productId', getProductReviews);
router.get('/reviews/shop/:shopId', getShopReviews);

// Messages Routes
router.post('/messages', authenticateToken, sendMessage);
router.get('/messages/conversations', authenticateToken, getConversations);
router.get('/messages/history/:otherUserId', authenticateToken, getChatHistory);
router.put('/messages/read/:otherUserId', authenticateToken, markAsRead);

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
