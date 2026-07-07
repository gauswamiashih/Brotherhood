import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingBag, Star, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ProductQuickViewModalProps {
  product: any;
  onClose: () => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, isAuthenticated } = useAuth();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Variant selections
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [availableStock, setAvailableStock] = useState<number>(product.stock);

  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ avg_rating: '0.0', review_count: 0 });
  const [eligible, setEligible] = useState<boolean>(false);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  
  // Submit review form states
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number | null>(null);
  const [formComment, setFormComment] = useState<string>('');
  const [reviewError, setReviewError] = useState<string>('');

  // Extract unique sizes and colors
  const sizes = Array.from(new Set((product.variants || []).map((v: any) => v.size))) as string[];
  const colors = Array.from(new Set((product.variants || []).map((v: any) => v.color))) as string[];

  // Fetch reviews & eligibility
  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${product.id}`);
      setReviews(res.data.reviews || []);
      setStats(res.data.stats || { avg_rating: '0.0', review_count: 0 });
      setEligible(res.data.eligibleToReview || false);
    } catch (err) {
      console.error('Failed to load product reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
    
    // Set default size and color if variants are present
    if (sizes.length > 0) {
      setSelectedSize(sizes[0]);
    }
    if (colors.length > 0) {
      setSelectedColor(colors[0]);
    }
  }, [product.id]);

  // Update variant specific stock limit
  useEffect(() => {
    if (selectedSize && selectedColor && product.variants) {
      const variant = product.variants.find(
        (v: any) => v.size === selectedSize && v.color === selectedColor
      );
      if (variant) {
        setAvailableStock(variant.stock);
      } else {
        setAvailableStock(0);
      }
    } else {
      setAvailableStock(product.stock);
    }
  }, [selectedSize, selectedColor, product.variants, product.stock]);

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && (!selectedSize || !selectedColor)) {
      alert('Please configure your couture size and color choice first.');
      return;
    }
    
    if (availableStock <= 0) {
      alert('Selected variant is currently out of stock.');
      return;
    }

    addToCart({
      ...product,
      selectedSize,
      selectedColor
    });
    
    alert(`Added "${product.name}" (${selectedSize} / ${selectedColor}) to cart!`);
    onClose();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim()) {
      setReviewError('Review comment cannot be empty.');
      return;
    }

    setReviewLoading(true);
    setReviewError('');
    try {
      await api.post('/reviews', {
        shopId: product.shop_id,
        productId: product.id,
        rating: formRating,
        comment: formComment
      });
      setFormComment('');
      setFormRating(5);
      fetchReviews(); // Refresh review logs list
    } catch (err: any) {
      setReviewError(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="glass-panel max-w-3xl w-full rounded-2xl overflow-hidden border border-luxury-border shadow-goldGlow flex flex-col md:flex-row relative max-h-[90vh] bg-[#090214]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-luxury-black bg-opacity-80 border border-luxury-border flex items-center justify-center text-gray-400 hover:text-white z-10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product image section */}
        <div className="w-full md:w-1/2 relative bg-black flex items-center justify-center min-h-[300px]">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover max-h-[450px]"
          />
          {availableStock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <span className="border border-red-500 text-red-500 bg-red-500 bg-opacity-15 font-bold uppercase tracking-widest px-4 py-2 text-xs rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content details section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[90vh] md:max-h-[500px]">
          <div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-[10px] bg-luxury-purpleLight px-2.5 py-0.5 rounded text-luxury-gold uppercase font-bold tracking-wider border border-luxury-gold border-opacity-20">
                {product.category}
              </span>
              {/* Star rating summary */}
              <div className="flex items-center space-x-1 text-xs">
                <Star className="w-3.5 h-3.5 fill-luxury-gold text-luxury-gold" />
                <span className="text-white font-bold">{stats.avg_rating}</span>
                <span className="text-gray-500">({stats.review_count})</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white font-serif mt-2 tracking-wide">{product.name}</h3>
            <div className="text-xl font-bold text-luxury-gold mt-1">
              ₹{Number(product.price).toLocaleString()}
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-luxury-border border-opacity-35 mt-6 mb-4 text-xs font-semibold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2.5 mr-6 border-b-2 transition-colors ${
                activeTab === 'details' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'reviews' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              Reviews ({stats.review_count})
            </button>
          </div>

          {/* TAB 1: PRODUCT DETAILS & CONFIGURATION */}
          {activeTab === 'details' && (
            <div className="flex-grow flex flex-col space-y-4">
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                {product.description || 'No detailed specifications loaded for this item.'}
              </p>

              {/* Variants selectors if variants are present */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-luxury-border border-opacity-20">
                  {/* Sizes */}
                  {sizes.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 uppercase font-semibold">Select Size</label>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded transition-colors uppercase ${
                              selectedSize === size
                                ? 'bg-luxury-gold text-black border border-luxury-gold'
                                : 'bg-luxury-purpleDeep text-gray-400 border border-luxury-border border-opacity-35 hover:text-white'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colors */}
                  {colors.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 uppercase font-semibold">Select Color</label>
                      <div className="flex flex-wrap gap-2">
                        {colors.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded transition-colors uppercase ${
                              selectedColor === color
                                ? 'bg-luxury-gold text-black border border-luxury-gold'
                                : 'bg-luxury-purpleDeep text-gray-400 border border-luxury-border border-opacity-35 hover:text-white'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic stock indicator */}
                  <div className="text-[10px] text-gray-400 italic">
                    {availableStock > 0 ? (
                      <span>In Stock: <strong className="text-luxury-gold font-bold">{availableStock}</strong> pieces available</span>
                    ) : (
                      <span className="text-red-400 font-bold">Out of stock for this variant combination</span>
                    )}
                  </div>
                </div>
              )}

              {/* Add to cart trigger */}
              <div className="pt-4 border-t border-luxury-border border-opacity-20 mt-auto">
                <button 
                  onClick={handleAddToCart}
                  disabled={availableStock <= 0}
                  className="btn-gold-metallic w-full py-3.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Shopping Cart
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VERIFIED REVIEWS & FEEDBACK */}
          {activeTab === 'reviews' && (
            <div className="flex-grow flex flex-col space-y-4">
              
              {/* Write review form if eligible */}
              {eligible && isAuthenticated && (
                <form onSubmit={handleReviewSubmit} className="bg-luxury-purpleDeep bg-opacity-30 border border-luxury-border border-opacity-30 p-4 rounded-xl space-y-3">
                  <div className="text-[11px] font-bold text-luxury-gold uppercase tracking-wider">Leave a Verified Review</div>
                  
                  {reviewError && (
                    <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-35 p-2 rounded text-[10px] text-red-400">
                      {reviewError}
                    </div>
                  )}

                  {/* Interactive Star rating */}
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        onMouseEnter={() => setFormHoverRating(star)}
                        onMouseLeave={() => setFormHoverRating(null)}
                        className="p-0.5 text-luxury-gold hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={`w-5 h-5 ${
                            (formHoverRating !== null ? star <= formHoverRating : star <= formRating)
                              ? 'fill-luxury-gold' 
                              : 'text-gray-600'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>

                  {/* Comments input */}
                  <textarea
                    placeholder="Tell us about the fabric quality, fitting, and boutique tailors craftsmanship..."
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    rows={2}
                    className="luxury-input text-xs resize-none"
                    required
                  />

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="btn-gold-metallic py-2 px-4 text-[10px] font-bold uppercase tracking-wider"
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {/* Review list */}
              <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                {reviews.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-xs flex flex-col items-center gap-1">
                    <AlertCircle className="w-5 h-5 text-gray-600" />
                    <span>No verified client reviews listed yet.</span>
                  </div>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="border-b border-luxury-border border-opacity-20 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-luxury-purpleDeep border border-luxury-border border-opacity-40 flex items-center justify-center text-[10px] text-luxury-gold font-bold overflow-hidden">
                            {r.reviewer_avatar ? (
                              <img src={r.reviewer_avatar} alt={r.reviewer_name} className="w-full h-full object-cover" />
                            ) : (
                              r.reviewer_name.substring(0, 1).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{r.reviewer_name}</div>
                            <div className="text-[8px] text-gray-500">
                              {new Date(r.created_at).toLocaleDateString(undefined, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center space-x-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3 h-3 ${star <= r.rating ? 'fill-luxury-gold text-luxury-gold' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 font-light mt-2 leading-relaxed">
                        {r.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
};
