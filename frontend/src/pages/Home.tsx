import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BadgeCheck, ArrowRight, Shield, Award, Star, Compass, MapPin, ShoppingBag, Eye } from 'lucide-react';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';
import { getCategoryLogo, getCategoryCover } from '../utils/fallback';

export const Home: React.FC = () => {
  const { addToCart } = useAuth();
  const [founderShop, setFounderShop] = useState<any>(null);
  const [trendingShops, setTrendingShops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch shops
        const shopsRes = await api.get('/shops');
        const shops = shopsRes.data;
        
        const founder = shops.find((s: any) => s.is_founder);
        setFounderShop(founder);

        const trending = shops.filter((s: any) => !s.is_founder).slice(0, 3);
        setTrendingShops(trending);

        // Fetch trending products
        const productsRes = await api.get('/products');
        setProducts(productsRes.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-luxury-black">
          <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-luxury-purpleGlow opacity-20 blur-[100px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-luxury-gold opacity-10 blur-[120px]" />
        </div>

        <motion.div 
          className="relative z-10 max-w-5xl mx-auto text-center space-y-8"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-luxury-gold border-opacity-35 bg-luxury-purpleMid bg-opacity-20 text-xs font-semibold text-luxury-gold uppercase tracking-widest">
            <Award className="w-3.5 h-3.5 mr-1" />
            Palanpur's Exclusive Fashion Network
          </motion.div>

          <motion.h1 
            variants={itemVariants} 
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-serif leading-tight"
          >
            Discover Palanpur's <br />
            <span className="text-gold-gradient">Premium Fashion Boutiques</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants} 
            className="max-w-2xl mx-auto text-sm sm:text-lg text-gray-400 font-light leading-relaxed"
          >
            A high-end digital runway connecting elite buyers with verified premium clothing designers, traditional craft outlets, and custom tailoring boutiques.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/marketplace" className="btn-gold-metallic text-sm font-semibold tracking-wider uppercase px-8 py-3.5 w-full sm:w-auto">
              Explore Marketplace
            </Link>
            <Link to="/register-shop" className="btn-gold-outline text-sm font-semibold tracking-wider uppercase px-8 py-3.5 w-full sm:w-auto">
              Register Shop
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. FEATURED FOUNDER SHOP */}
      {founderShop && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-luxury-border border-opacity-40 bg-luxury-purpleDeep bg-opacity-30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-xs text-luxury-gold font-bold tracking-[0.25em] uppercase mb-2">FOUNDER PREMIER SHOWCASE</h2>
              <h3 className="text-3xl font-bold font-serif text-white">The Flagship Boutique</h3>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="glass-panel p-6 sm:p-10 rounded-2xl border border-luxury-gold border-opacity-30 relative overflow-hidden shadow-goldGlowStrong"
            >
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center filter brightness-[0.2] transition-transform duration-1000 ease-out hover:scale-105"
                style={{ backgroundImage: `url(${founderShop.cover_url || getCategoryCover(founderShop.category)})` }}
              />

              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  <img 
                    src={founderShop.logo_url || getCategoryLogo(founderShop.category)} 
                    alt={founderShop.name}
                    onError={(e) => {
                      e.currentTarget.src = getCategoryLogo(founderShop.category);
                    }}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border-2 border-luxury-gold shadow-goldGlow shrink-0"
                  />
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h4 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide font-serif">{founderShop.name}</h4>
                      <div className="flex items-center space-x-1 bg-luxury-gold bg-opacity-10 border border-luxury-gold px-2 py-0.5 rounded text-[10px] font-bold text-luxury-gold uppercase tracking-wider">
                        <BadgeCheck className="w-3.5 h-3.5 fill-luxury-gold text-black" />
                        <span>FOUNDER</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 max-w-xl font-light leading-relaxed">{founderShop.description}</p>
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-300">
                      <span className="flex items-center"><MapPin className="w-4 h-4 text-luxury-gold mr-1" /> {founderShop.city}</span>
                      <span className="px-2.5 py-1 bg-luxury-purpleLight rounded-full text-[10px] uppercase font-bold text-luxury-gold">{founderShop.category}</span>
                      <span className="text-luxury-gold font-semibold">{founderShop.follower_count || 0} Followers</span>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-auto shrink-0 flex justify-center">
                  <Link 
                    to={`/shops/${founderShop.id}`} 
                    className="btn-gold-metallic flex items-center justify-center w-full lg:w-auto px-8 py-4 font-bold uppercase tracking-wider text-xs"
                  >
                    Enter Boutique
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* 3. TRENDING PRODUCTS / COUTURE COLLECTIONS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
          <div className="text-center sm:text-left mb-6 sm:mb-0">
            <h2 className="text-xs text-luxury-gold font-bold tracking-[0.25em] uppercase mb-2">TRENDING COUTURE</h2>
            <h3 className="text-3xl font-bold font-serif">Curated Product Catalog</h3>
          </div>
          <Link to="/marketplace?tab=products" className="text-xs font-bold text-luxury-gold flex items-center hover:underline uppercase tracking-wider">
            View All Products
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="glass-panel h-80 rounded-xl shimmer"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-luxury-border border-opacity-20">
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
          </div>
        )}
      </section>

      {/* 4. TRENDING STORES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-luxury-border border-opacity-40 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
          <div className="text-center sm:text-left mb-6 sm:mb-0">
            <h2 className="text-xs text-luxury-gold font-bold tracking-[0.25em] uppercase mb-2">TOP CURATED STORES</h2>
            <h3 className="text-3xl font-bold font-serif">Trending Boutiques</h3>
          </div>
          <Link to="/marketplace" className="text-xs font-bold text-luxury-gold flex items-center hover:underline uppercase tracking-wider">
            View All Stores
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel h-80 rounded-xl shimmer"></div>
            ))}
          </div>
        ) : trendingShops.length === 0 ? (
          <div className="glass-panel py-12 text-center text-gray-500 rounded-xl">
            No active boutiques available at this moment. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingShops.map((shop) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-panel glass-panel-hover rounded-xl overflow-hidden flex flex-col h-full border border-luxury-border border-opacity-40"
              >
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src={shop.cover_url || getCategoryCover(shop.category)} 
                    alt={shop.name}
                    onError={(e) => {
                      e.currentTarget.src = getCategoryCover(shop.category);
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 bg-luxury-black bg-opacity-70 border border-luxury-gold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold text-luxury-gold">
                    {shop.category}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={shop.logo_url || getCategoryLogo(shop.category)} 
                      alt={shop.name}
                      onError={(e) => {
                        e.currentTarget.src = getCategoryLogo(shop.category);
                      }}
                      className="w-12 h-12 rounded-lg object-cover border border-luxury-border shadow"
                    />
                    <div>
                      <div className="flex items-center space-x-1">
                        <h4 className="font-serif font-bold text-lg text-white truncate max-w-[170px]">{shop.name}</h4>
                        {shop.is_verified && <BadgeCheck className="w-4 h-4 fill-luxury-gold text-black shrink-0" />}
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{shop.city}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-2 h-8">{shop.description}</p>

                  <div className="border-t border-luxury-border border-opacity-30 pt-4 mt-auto flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">{shop.follower_count || 0} Followers</span>
                    <Link to={`/shops/${shop.id}`} className="text-xs font-bold text-luxury-gold flex items-center hover:underline">
                      Enter Store
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 5. LUXURY CATEGORIES GRID */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-luxury-border border-opacity-40 bg-luxury-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs text-luxury-gold font-bold tracking-[0.25em] uppercase mb-2">CURATED COLLECTIONS</h2>
            <h3 className="text-3xl font-bold font-serif">Explore By Categories</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: 'Menswear', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&h=300&q=80' },
              { name: 'Womenswear', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&h=300&q=80' },
              { name: 'Kids Wear', img: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=400&h=300&q=80' },
              { name: 'Ethnic Wear', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&h=300&q=80' },
            ].map((cat) => (
              <Link
                key={cat.name}
                to={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                className="relative group h-48 rounded-xl overflow-hidden border border-luxury-border"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center filter brightness-[0.45] transition-transform duration-700 ease-out group-hover:scale-110"
                  style={{ backgroundImage: `url(${cat.img})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-85" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <h4 className="font-serif font-bold text-base tracking-wide text-white uppercase group-hover:text-luxury-gold transition-colors">{cat.name}</h4>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-1">Discover items</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-luxury-border border-opacity-40 bg-luxury-purpleDeep bg-opacity-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs text-luxury-gold font-bold tracking-[0.25em] uppercase mb-2">REVIEWS & ENDORSEMENTS</h2>
            <h3 className="text-3xl font-bold font-serif">Customer Experiences</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Mayur G.",
                role: "Fashion Enthusiast",
                quote: "The quality of stores curated on Brotherhood is outstanding. Finding premium menswear in Palanpur has never been this seamless. Visually, the experience is incredibly elite.",
                stars: 5,
              },
              {
                name: "Hitesh K.",
                role: "Shop Owner (Couture Palanpur)",
                quote: "Registering my boutique took minutes. Having the verified badge has helped me build immediate trust. Highly recommended for local business scaling.",
                stars: 5,
              },
              {
                name: "Pooja R.",
                role: "Luxury Client",
                quote: "Absolutely love the layout! I followed my favorite ethnic stores to get immediate updates. The lightbox photos show designs clearly. A true startup masterpiece.",
                stars: 5,
              }
            ].map((t, idx) => (
              <div key={idx} className="glass-panel p-6 sm:p-8 rounded-xl flex flex-col space-y-4">
                <div className="flex items-center text-luxury-gold space-x-1">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-luxury-gold text-black" />
                  ))}
                </div>
                <p className="text-xs text-gray-400 italic leading-relaxed">"{t.quote}"</p>
                <div className="pt-2 border-t border-luxury-border border-opacity-30">
                  <h5 className="font-semibold text-xs text-white tracking-wider">{t.name}</h5>
                  <p className="text-[10px] text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TRUST VALUES / SYSTEM VALUES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-luxury-border border-opacity-40 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-luxury-gold bg-opacity-10 border border-luxury-gold flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-luxury-gold" />
            </div>
            <h4 className="font-serif font-bold text-lg text-white">Verified Boutiques Only</h4>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              Every shop is manually vetted and approved by our founders to maintain high standards of service.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-luxury-purpleMid bg-opacity-30 border border-luxury-purpleLight flex items-center justify-center mb-2">
              <Compass className="w-5 h-5 text-luxury-gold" />
            </div>
            <h4 className="font-serif font-bold text-lg text-white">Seamless Discovery</h4>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              Follow your favorite boutiques, browse their high-resolution catalogs, and receive instant notifications.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-luxury-gold bg-opacity-10 border border-luxury-gold flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-luxury-gold" />
            </div>
            <h4 className="font-serif font-bold text-lg text-white">Ashish Gauswami Initiative</h4>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              An ecosystem supported by our leading flagship boutique in Palanpur to elevate community retail.
            </p>
          </div>
        </div>
      </section>

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
