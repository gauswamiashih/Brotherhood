import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, Search, SlidersHorizontal, ArrowUpRight, ShoppingBag, Eye, MapPin, Compass, Store, X } from 'lucide-react';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';

export const Marketplace: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useAuth();
  
  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Read query parameters
  const searchTerm = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || 'All';
  const sortFilter = searchParams.get('sort') || 'default';
  const currentTab = searchParams.get('tab') || 'boutiques'; // 'boutiques' or 'products'

  // Modals / Quick View states
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [quickViewShop, setQuickViewShop] = useState<any>(null);

  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data);
      } catch (err) {
        console.warn('Failed to load categories');
      }
    };
    fetchFiltersData();
  }, []);

  useEffect(() => {
    const fetchMarketplaceData = async () => {
      setLoading(true);
      try {
        if (currentTab === 'boutiques') {
          const res = await api.get('/shops', {
            params: {
              search: searchTerm,
              category: categoryFilter,
              sort: sortFilter,
            },
          });
          setShops(res.data);
        } else {
          // Fetch products
          const res = await api.get('/products', {
            params: {
              search: searchTerm,
              category: categoryFilter,
            },
          });
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Failed to load marketplace details');
      } finally {
        setLoading(false);
      }
    };
    fetchMarketplaceData();
  }, [searchTerm, categoryFilter, sortFilter, currentTab]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleCategorySelect = (categoryName: string) => {
    if (categoryName === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryName);
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'default') {
      searchParams.delete('sort');
    } else {
      searchParams.set('sort', value);
    }
    setSearchParams(searchParams);
  };

  const handleTabChange = (tab: 'boutiques' | 'products') => {
    searchParams.set('tab', tab);
    // Clear search and category filters on tab switch for better UX
    searchParams.delete('search');
    searchParams.delete('category');
    searchParams.delete('sort');
    setSearchParams(searchParams);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60 } },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Page Header */}
      <div className="text-center mb-8 space-y-3">
        <h1 className="text-4xl font-extrabold font-serif tracking-wide text-white">THE PREMIUM MARKETPLACE</h1>
        <p className="text-xs text-luxury-gold uppercase tracking-[0.25em] font-bold">Palanpur's Luxury Fashion Network</p>
      </div>

      {/* Tabs Switch */}
      <div className="flex justify-center mb-8">
        <div className="bg-luxury-purpleDeep bg-opacity-40 p-1.5 rounded-full border border-luxury-border border-opacity-35 flex space-x-1 shadow-inner">
          <button
            onClick={() => handleTabChange('boutiques')}
            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              currentTab === 'boutiques' 
                ? 'bg-luxury-gold text-black shadow-goldGlow' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            Boutique Outlets
          </button>
          <button
            onClick={() => handleTabChange('products')}
            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              currentTab === 'products' 
                ? 'bg-luxury-gold text-black shadow-goldGlow' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Product Catalog
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel p-6 rounded-xl border border-luxury-border border-opacity-40 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-glass">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder={currentTab === 'boutiques' ? "Search stores, owners or descriptions..." : "Search kurtas, blazers, silk wear..."}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-luxury-black bg-opacity-60 border border-luxury-border border-opacity-35 rounded-full pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-luxury-gold transition-all duration-300 text-white placeholder-gray-400"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        </div>

        {/* Sort (Only visible for boutiques) */}
        {currentTab === 'boutiques' && (
          <div className="flex w-full md:w-auto gap-4 items-center justify-end">
            <div className="relative w-full md:w-52">
              <select
                value={sortFilter}
                onChange={handleSortChange}
                className="w-full bg-luxury-black bg-opacity-60 border border-luxury-border border-opacity-35 rounded-full px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-luxury-gold transition-all appearance-none cursor-pointer"
              >
                <option value="default">Founder First (Default)</option>
                <option value="popular">Most Followed (Popular)</option>
                <option value="newest">Recently Registered</option>
              </select>
              <SlidersHorizontal className="absolute right-4 top-3.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-6 scrollbar-hide mb-8">
        <button
          onClick={() => handleCategorySelect('All')}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all border ${
            categoryFilter === 'All'
              ? 'bg-luxury-gold text-black border-luxury-gold shadow-goldGlow'
              : 'bg-luxury-purpleDeep bg-opacity-40 text-gray-300 border-luxury-border border-opacity-40 hover:border-luxury-gold hover:text-white'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.name)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all border ${
              categoryFilter === cat.name
                ? 'bg-luxury-gold text-black border-luxury-gold shadow-goldGlow'
                : 'bg-luxury-purpleDeep bg-opacity-40 text-gray-300 border-luxury-border border-opacity-40 hover:border-luxury-gold hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Dynamic Grid Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="glass-panel h-80 rounded-xl shimmer"></div>
          ))}
        </div>
      ) : currentTab === 'boutiques' ? (
        // BOUTIQUES TAB CONTENT
        shops.length === 0 ? (
          <div className="glass-panel rounded-xl py-20 text-center text-gray-500 max-w-xl mx-auto border border-luxury-border">
            <Compass className="w-12 h-12 text-luxury-gold mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-2">No Premium Boutiques Found</h3>
            <p className="text-xs text-gray-400 font-light max-w-xs mx-auto">
              We couldn't find any boutiques matching your search terms. Check other categories or clear search filters.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {shops.map((shop) => {
                const isFounder = shop.is_founder;
                return (
                  <motion.div
                    key={shop.id}
                    variants={cardVariants}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`glass-panel rounded-2xl overflow-hidden flex flex-col h-full border transition-all duration-300 relative ${
                      isFounder 
                        ? 'border-luxury-gold border-opacity-45 shadow-goldGlow' 
                        : 'border-luxury-border border-opacity-40 hover:border-luxury-gold hover:border-opacity-35'
                    }`}
                  >
                    {isFounder && (
                      <div className="absolute top-4 left-4 z-20 bg-luxury-gold text-black font-bold uppercase tracking-wider text-[9px] px-2.5 py-1 rounded shadow-md">
                        Founder flagship
                      </div>
                    )}

                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={shop.cover_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&h=300&q=80'}
                        alt={shop.name}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute top-4 right-4 bg-luxury-black bg-opacity-70 border border-luxury-gold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold text-luxury-gold">
                        {shop.category}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow space-y-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={shop.logo_url || 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=150&h=150&q=80'}
                          alt={shop.name}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-luxury-border shadow shrink-0"
                          loading="lazy"
                        />
                        <div className="overflow-hidden">
                          <div className="flex items-center space-x-1">
                            <h4 className="font-serif font-bold text-lg text-white truncate pr-2">{shop.name}</h4>
                            {shop.is_verified && (
                              <BadgeCheck className="w-4 h-4 fill-luxury-gold text-black shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center">
                            <MapPin className="w-3.5 h-3.5 text-luxury-gold mr-0.5" />
                            {shop.city}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-3 h-12">
                        {shop.description}
                      </p>

                      <div className="border-t border-luxury-border border-opacity-35 pt-4 mt-auto flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">
                          {shop.follower_count || 0} Followers
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setQuickViewShop(shop)}
                            className="p-2 border border-luxury-border rounded-full hover:border-luxury-gold text-gray-400 hover:text-white transition-colors"
                            title="Quick View Info"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/shops/${shop.id}`}
                            className="btn-gold-outline text-[10px] font-bold uppercase tracking-wider px-4 py-2 flex items-center"
                          >
                            <span>Visit boutique</span>
                            <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )
      ) : (
        // PRODUCTS TAB CONTENT
        products.length === 0 ? (
          <div className="glass-panel rounded-xl py-20 text-center text-gray-500 max-w-xl mx-auto border border-luxury-border">
            <Compass className="w-12 h-12 text-luxury-gold mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-2">No Couture Products Found</h3>
            <p className="text-xs text-gray-400 font-light max-w-xs mx-auto">
              We couldn't find any products matching your search criteria. Try modifying your category selection.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-panel glass-panel-hover rounded-xl overflow-hidden flex flex-col h-full border border-luxury-border border-opacity-40"
                >
                  <div className="aspect-[4/5] overflow-hidden relative group">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setQuickViewProduct(product)}
                        className="p-2.5 rounded-full bg-luxury-black bg-opacity-80 border border-luxury-gold text-luxury-gold hover:text-white transition-colors"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          addToCart(product);
                          alert(`Added "${product.name}" to cart!`);
                        }}
                        className="p-2.5 rounded-full bg-luxury-gold text-black hover:bg-white transition-colors"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-luxury-purpleLight px-2 py-0.5 rounded text-[8px] font-bold text-luxury-gold uppercase tracking-wider">
                      {product.category}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h4 className="font-semibold text-sm text-white truncate">{product.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-luxury-border border-opacity-20 mt-auto">
                      <span className="text-sm font-bold text-luxury-gold">₹{Number(product.price).toLocaleString()}</span>
                      <button 
                        onClick={() => {
                          addToCart(product);
                          alert(`Added "${product.name}" to cart!`);
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider text-white hover:text-luxury-gold transition-colors flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )
      )}

      {/* QUICK VIEW SHOP MODAL */}
      <AnimatePresence>
        {quickViewShop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setQuickViewShop(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-panel max-w-lg w-full rounded-2xl overflow-hidden border border-luxury-border shadow-glass relative p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setQuickViewShop(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-luxury-black bg-opacity-80 border border-luxury-border flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <img 
                  src={quickViewShop.logo_url} 
                  alt={quickViewShop.name} 
                  className="w-20 h-20 rounded-xl border border-luxury-gold object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold font-serif text-white flex items-center justify-center gap-1">
                    {quickViewShop.name}
                    {quickViewShop.is_verified && <BadgeCheck className="w-5 h-5 fill-luxury-gold text-black" />}
                  </h3>
                  <p className="text-[10px] text-luxury-gold uppercase tracking-widest font-bold mt-1">{quickViewShop.category}</p>
                </div>

                <p className="text-xs text-gray-400 font-light leading-relaxed max-w-sm">
                  {quickViewShop.description}
                </p>

                <div className="w-full border-t border-b border-luxury-border border-opacity-30 py-3 flex justify-around text-xs text-gray-400 mt-4">
                  <span>Location: <strong>{quickViewShop.city}</strong></span>
                  <span>Followers: <strong>{quickViewShop.follower_count || 0}</strong></span>
                </div>

                <div className="pt-6 w-full flex gap-3">
                  <button
                    onClick={() => setQuickViewShop(null)}
                    className="btn-gold-outline w-1/2 text-xs uppercase font-bold tracking-wider py-3"
                  >
                    Close
                  </button>
                  <Link
                    to={`/shops/${quickViewShop.id}`}
                    className="btn-gold-metallic w-1/2 text-xs uppercase font-bold tracking-wider py-3 flex items-center justify-center"
                  >
                    View Full Profile
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK VIEW PRODUCT MODAL */}
      <AnimatePresence>
        {quickViewProduct && (
          <ProductQuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
};
