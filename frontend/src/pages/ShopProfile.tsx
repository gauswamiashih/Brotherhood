import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BadgeCheck, MapPin, Phone, Mail, Instagram, 
  Pin, Heart, ArrowLeft, X, ChevronLeft, ChevronRight,
  ShoppingBag, Eye
} from 'lucide-react';

export const ShopProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, addToCart } = useAuth();
  const navigate = useNavigate();

  const [shop, setShop] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Tab selection
  const [profileTab, setProfileTab] = useState<'gallery' | 'products'>('gallery');

  // Lightbox & Quick View states
  const [activeImageIdx, setActiveImageIdx] = useState<number | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  useEffect(() => {
    const fetchShopProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/shops/${id}`);
        setShop(res.data);
        setGallery(res.data.gallery || []);
        setFollowerCount(res.data.follower_count || 0);

        // Fetch products for this shop
        const productsRes = await api.get('/products', { params: { shopId: id } });
        setProducts(productsRes.data);

        // Fetch follow status if logged in
        if (isAuthenticated) {
          const followStatusRes = await api.get(`/shops/${id}/follow-status`);
          setFollowing(followStatusRes.data.following);
        }
      } catch (err: any) {
        console.error('Failed to load shop profile details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopProfile();
  }, [id, isAuthenticated]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      const res = await api.post(`/shops/${id}/follow`);
      setFollowing(res.data.following);
      setFollowerCount(res.data.followerCount);
    } catch (err: any) {
      console.error('Failed to follow/unfollow store:', err.response?.data?.error);
    }
  };

  const openLightbox = (idx: number) => {
    setActiveImageIdx(idx);
  };

  const closeLightbox = () => {
    setActiveImageIdx(null);
  };

  const showPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIdx !== null && activeImageIdx > 0) {
      setActiveImageIdx(activeImageIdx - 1);
    }
  };

  const showNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIdx !== null && activeImageIdx < gallery.length - 1) {
      setActiveImageIdx(activeImageIdx + 1);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen">
        <div className="h-64 glass-panel shimmer rounded-xl mb-12"></div>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-8 bg-luxury-purpleLight bg-opacity-35 rounded w-1/3 shimmer"></div>
          <div className="h-4 bg-luxury-purpleLight bg-opacity-35 rounded w-full shimmer"></div>
          <div className="h-4 bg-luxury-purpleLight bg-opacity-35 rounded w-2/3 shimmer"></div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="text-2xl font-bold text-white">Boutique Not Found</h2>
        <p className="text-gray-400">The shop profile you are trying to view does not exist or has been removed.</p>
        <Link to="/marketplace" className="btn-gold-metallic inline-flex items-center text-xs uppercase font-bold tracking-wider px-6 py-3">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  const pinnedImages = gallery.filter((img) => img.is_pinned);

  const getIndexInGallery = (imgId: string) => {
    return gallery.findIndex((img) => img.id === imgId);
  };

  return (
    <div className="min-h-screen bg-luxury-black pb-20 relative">
      
      {/* 1. COVER PHOTO BANNER */}
      <div className="h-64 sm:h-96 w-full relative overflow-hidden border-b border-luxury-border border-opacity-40">
        <img 
          src={shop.cover_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=400&q=80'} 
          alt={shop.name}
          className="w-full h-full object-cover filter brightness-[0.4]"
        />
        <Link 
          to="/marketplace" 
          className="absolute top-6 left-6 sm:left-10 px-4 py-2.5 rounded-full bg-luxury-black bg-opacity-70 border border-luxury-border border-opacity-30 text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center hover:text-white transition-all z-20 shadow-md"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Link>
      </div>

      {/* 2. PROFILE LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 sm:-mt-32 z-10">
        <div className="glass-panel p-6 sm:p-10 rounded-2xl border border-luxury-border shadow-glass flex flex-col md:flex-row gap-8 items-start">
          
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-luxury-gold bg-luxury-black overflow-hidden shadow-goldGlowStrong shrink-0 self-center md:self-start">
            <img 
              src={shop.logo_url || 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=300&h=300&q=80'} 
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-grow space-y-6 w-full text-center md:text-left">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-wide text-white">{shop.name}</h1>
                  {shop.is_verified && (
                    <BadgeCheck className="w-6 h-6 fill-luxury-gold text-black shrink-0" />
                  )}
                </div>
                <p className="text-xs uppercase tracking-wider text-luxury-gold font-bold">{shop.category}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={handleFollowToggle}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center ${
                    following 
                      ? 'bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                      : 'bg-luxury-gold text-black border border-luxury-gold hover:brightness-110 shadow-goldGlow'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-1.5 ${following ? 'fill-current' : ''}`} />
                  {following ? 'Following' : 'Follow Store'}
                </button>
                {shop.instagram_url && (
                  <a 
                    href={shop.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-luxury-border flex items-center justify-center text-gray-300 hover:text-luxury-gold hover:border-luxury-gold transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-8 border-t border-b border-luxury-border border-opacity-35 py-4 text-sm tracking-wide">
              <div>
                <span className="font-bold text-white text-lg">{gallery.length}</span>
                <span className="text-gray-400 text-xs ml-1">Images</span>
              </div>
              <div>
                <span className="font-bold text-white text-lg">{products.length}</span>
                <span className="text-gray-400 text-xs ml-1">Products</span>
              </div>
              <div>
                <span className="font-bold text-white text-lg">{followerCount}</span>
                <span className="text-gray-400 text-xs ml-1">Followers</span>
              </div>
              {shop.is_founder && (
                <div className="bg-luxury-gold bg-opacity-10 border border-luxury-gold border-opacity-30 rounded px-2.5 py-0.5 text-[9px] uppercase font-bold text-luxury-gold">
                  Founder Flagship
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">About Boutique</h3>
              <p className="text-sm font-light text-gray-300 leading-relaxed max-w-2xl">{shop.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-luxury-border border-opacity-35 text-xs text-gray-400">
              <div className="flex items-center justify-center md:justify-start">
                <MapPin className="w-4 h-4 text-luxury-gold mr-2 shrink-0" />
                <span>{shop.city}, Gujarat</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <Phone className="w-4 h-4 text-luxury-gold mr-2 shrink-0" />
                <a href={`tel:${shop.phone}`} className="hover:text-white transition-colors">{shop.phone}</a>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <Mail className="w-4 h-4 text-luxury-gold mr-2 shrink-0" />
                <a href={`mailto:${shop.email}`} className="hover:text-white transition-colors truncate max-w-[200px]">{shop.email}</a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. TABS SELECTOR (Gallery vs Catalog) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex justify-center">
        <div className="bg-luxury-purpleDeep bg-opacity-30 p-1 rounded-full border border-luxury-border border-opacity-30 flex space-x-1">
          <button
            onClick={() => setProfileTab('gallery')}
            className={`px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              profileTab === 'gallery' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Lookbook Gallery
          </button>
          <button
            onClick={() => setProfileTab('products')}
            className={`px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              profileTab === 'products' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Product Catalog ({products.length})
          </button>
        </div>
      </div>

      {/* TAB 1: LOOKBOOK GALLERY */}
      {profileTab === 'gallery' && (
        <>
          {/* Pinned Gallery (Top 3 Pinned Images) */}
          {pinnedImages.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
              <div className="flex items-center space-x-2 mb-6">
                <Pin className="w-4 h-4 text-luxury-gold fill-luxury-gold" />
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-luxury-gold">Pinned Collection</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {pinnedImages.map((img) => (
                  <div 
                    key={img.id}
                    onClick={() => openLightbox(getIndexInGallery(img.id))}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden border border-luxury-gold border-opacity-30 group cursor-pointer shadow-goldGlow hover:shadow-goldGlowStrong transition-all duration-300"
                  >
                    <img 
                      src={img.image_url} 
                      alt="Pinned collection item"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs uppercase tracking-wider font-semibold bg-luxury-black bg-opacity-80 px-4 py-2 rounded-full border border-luxury-gold">View Close-up</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-luxury-black bg-opacity-85 border border-luxury-gold px-2.5 py-1 rounded text-[9px] uppercase font-bold text-luxury-gold flex items-center space-x-1">
                      <Pin className="w-3 h-3 fill-luxury-gold" />
                      <span>Pinned</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Main lookbook grid */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="border-b border-luxury-border border-opacity-40 pb-4 mb-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Boutique Portfolio</h2>
            </div>

            {gallery.length === 0 ? (
              <div className="glass-panel py-16 text-center text-gray-500 rounded-xl max-w-xl mx-auto">
                This boutique has not uploaded any gallery images yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {gallery.map((img) => (
                  <div 
                    key={img.id}
                    onClick={() => openLightbox(getIndexInGallery(img.id))}
                    className="relative aspect-square rounded-lg overflow-hidden border border-luxury-border border-opacity-35 group cursor-pointer hover:border-luxury-gold transition-colors duration-300"
                  >
                    <img 
                      src={img.image_url} 
                      alt="Gallery lookbook item"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] uppercase tracking-wider font-semibold bg-luxury-black bg-opacity-85 px-3.5 py-1.5 rounded-full border border-luxury-gold">Expand</span>
                    </div>
                    {img.is_pinned && (
                      <div className="absolute top-2 right-2 bg-luxury-black bg-opacity-70 border border-luxury-gold p-1 rounded-full text-luxury-gold">
                        <Pin className="w-3 h-3 fill-luxury-gold" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* TAB 2: PRODUCT CATALOG */}
      {profileTab === 'products' && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="border-b border-luxury-border border-opacity-40 pb-4 mb-8">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Available Couture Items</h2>
          </div>

          {products.length === 0 ? (
            <div className="glass-panel py-16 text-center text-gray-500 rounded-xl max-w-xl mx-auto">
              This boutique has not listed any catalog products yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="glass-panel glass-panel-hover rounded-xl overflow-hidden border border-luxury-border border-opacity-45 flex flex-col h-full"
                >
                  <div className="aspect-[4/5] overflow-hidden relative group">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setQuickViewProduct(product)}
                        className="p-2 bg-luxury-black border border-luxury-gold rounded-full text-luxury-gold hover:text-white"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          addToCart(product);
                          alert(`Added "${product.name}" to cart!`);
                        }}
                        className="p-2 bg-luxury-gold rounded-full text-black hover:bg-white"
                        title="Add to cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm text-white truncate">{product.name}</h3>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-luxury-border border-opacity-20 mt-auto">
                      <span className="text-sm font-bold text-luxury-gold">₹{Number(product.price).toLocaleString()}</span>
                      <button
                        onClick={() => {
                          addToCart(product);
                          alert(`Added "${product.name}" to cart!`);
                        }}
                        className="text-[9px] font-bold uppercase tracking-wider text-gray-300 hover:text-luxury-gold transition-colors flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeImageIdx !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-95 backdrop-blur flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="absolute top-4 right-4 flex items-center space-x-3 z-50">
              <button 
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-luxury-purpleDeep bg-opacity-60 border border-luxury-border flex items-center justify-center text-gray-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeImageIdx > 0 && (
              <button 
                onClick={showPrevImage}
                className="absolute left-4 w-12 h-12 rounded-full bg-luxury-purpleDeep bg-opacity-60 border border-luxury-border flex items-center justify-center text-gray-300 hover:text-white transition-colors z-50 hover:scale-105"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl max-h-[80vh] overflow-hidden rounded-xl border border-luxury-border"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={gallery[activeImageIdx].image_url} 
                alt="Enlarged lookbook items"
                className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
              {gallery[activeImageIdx].is_pinned && (
                <div className="absolute bottom-4 left-4 bg-luxury-black bg-opacity-80 border border-luxury-gold px-3 py-1.5 rounded-lg text-xs font-bold text-luxury-gold flex items-center space-x-1.5">
                  <Pin className="w-4 h-4 fill-luxury-gold" />
                  <span>Pinned Collection</span>
                </div>
              )}
            </motion.div>

            {activeImageIdx < gallery.length - 1 && (
              <button 
                onClick={showNextImage}
                className="absolute right-4 w-12 h-12 rounded-full bg-luxury-purpleDeep bg-opacity-60 border border-luxury-border flex items-center justify-center text-gray-300 hover:text-white transition-colors z-50 hover:scale-105"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold tracking-widest text-gray-400 bg-luxury-purpleDeep bg-opacity-60 px-4 py-2 border border-luxury-border rounded-full">
              {activeImageIdx + 1} / {gallery.length}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK VIEW PRODUCT DIALOG */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-panel max-w-2xl w-full rounded-2xl overflow-hidden border border-luxury-border shadow-glass flex flex-col md:flex-row relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-luxury-black bg-opacity-80 border border-luxury-border flex items-center justify-center text-gray-400 hover:text-white z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-full md:w-1/2 aspect-square">
                <img 
                  src={quickViewProduct.image_url} 
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 md:p-8 flex flex-col flex-grow space-y-4">
                <div>
                  <span className="text-[10px] bg-luxury-purpleLight px-2 py-0.5 rounded text-luxury-gold uppercase font-bold tracking-wider">
                    {quickViewProduct.category}
                  </span>
                  <h3 className="text-2xl font-bold text-white font-serif mt-2">{quickViewProduct.name}</h3>
                </div>

                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  {quickViewProduct.description}
                </p>

                <div className="text-2xl font-extrabold text-luxury-gold">
                  ₹{Number(quickViewProduct.price).toLocaleString()}
                </div>

                <div className="pt-4 border-t border-luxury-border border-opacity-30 mt-auto">
                  <button 
                    onClick={() => {
                      addToCart(quickViewProduct);
                      alert(`Added "${quickViewProduct.name}" to cart!`);
                      setQuickViewProduct(null);
                    }}
                    className="btn-gold-metallic w-full py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Shopping Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
