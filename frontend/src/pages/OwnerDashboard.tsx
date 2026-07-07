import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, uploadImage } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, Users, Image as ImageIcon, Settings, 
  BadgeCheck, Clock, ShieldAlert, Pin, Trash2, 
  Plus, Edit, Eye, ToggleLeft, ToggleRight,
  ShoppingBag, CreditCard, BarChart3
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'products' | 'gallery' | 'orders' | 'followers' | 'settings'>('overview');
  
  // Data States
  const [shop, setShop] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form edit states
  const [profileForm, setProfileForm] = useState({
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    category: '',
    city: '',
    description: '',
    instagramUrl: '',
    logoUrl: '',
    coverUrl: ''
  });

  // Product Add Form States
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '10',
    category: 'All Wear',
    imageUrl: '',
    description: ''
  });
  const [productLoading, setProductLoading] = useState(false);

  // Variant States
  const [variants, setVariants] = useState<Array<{ size: string; color: string; stock: number }>>([]);
  const [newVariant, setNewVariant] = useState({
    size: 'M',
    color: 'Gold',
    stock: '5'
  });

  // Image Uploading States
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [productImageUploading, setProductImageUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUploading(true);
      setError('');
      try {
        const url = await uploadImage(e.target.files[0]);
        setProfileForm((prev) => ({ ...prev, logoUrl: url }));
      } catch (err: any) {
        setError('Failed to upload logo image');
      } finally {
        setLogoUploading(false);
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverUploading(true);
      setError('');
      try {
        const url = await uploadImage(e.target.files[0]);
        setProfileForm((prev) => ({ ...prev, coverUrl: url }));
      } catch (err: any) {
        setError('Failed to upload cover image');
      } finally {
        setCoverUploading(false);
      }
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductImageUploading(true);
      setError('');
      try {
        const url = await uploadImage(e.target.files[0]);
        setProductForm((prev) => ({ ...prev, imageUrl: url }));
      } catch (err: any) {
        setError('Failed to upload product image');
      } finally {
        setProductImageUploading(false);
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setGalleryUploading(true);
      setError('');
      try {
        const urls: string[] = [];
        for (let i = 0; i < e.target.files.length; i++) {
          const url = await uploadImage(e.target.files[i]);
          urls.push(url);
        }
        const currentString = newImageUrls.trim();
        const separator = currentString ? ',\n' : '';
        setNewImageUrls(currentString + separator + urls.join(',\n'));
      } catch (err: any) {
        setError('Failed to upload some lookbook images');
      } finally {
        setGalleryUploading(false);
      }
    }
  };

  const handleAddVariant = () => {
    if (!newVariant.size.trim() || !newVariant.color.trim()) return;
    setVariants((prev) => [
      ...prev,
      {
        size: newVariant.size.trim(),
        color: newVariant.color.trim(),
        stock: Number(newVariant.stock) || 0
      }
    ]);
    setNewVariant({ size: 'M', color: 'Gold', stock: '5' });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Gallery inputs
  const [newImageUrls, setNewImageUrls] = useState('');
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Settings
  const [allowNotifications, setAllowNotifications] = useState(true);

  // Order status changing loader
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/shops/my/profile');
      const shopData = res.data;
      setShop(shopData);
      setGallery(shopData.gallery || []);

      setProfileForm({
        name: shopData.name,
        ownerName: shopData.owner_name,
        phone: shopData.phone,
        email: shopData.email,
        category: shopData.category,
        city: shopData.city,
        description: shopData.description || '',
        instagramUrl: shopData.instagram_url || '',
        logoUrl: shopData.logo_url || '',
        coverUrl: shopData.cover_url || ''
      });

      // Fetch products for shop
      const prodsRes = await api.get('/products', { params: { shopId: shopData.id } });
      setProducts(prodsRes.data);

      // Fetch received store orders
      const ordersRes = await api.get('/orders/shop');
      setOrders(ordersRes.data);

      // Fetch personal purchases
      const purchasesRes = await api.get('/orders/my');
      setMyPurchases(purchasesRes.data);

      // Fetch followers
      const followersRes = await api.get(`/shops/${shopData.id}/followers`);
      setFollowers(followersRes.data);
    } catch (err: any) {
      console.error('Error fetching owner profile:', err.response?.data?.error);
      if (err.response?.status === 404) {
        navigate('/register-shop');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'owner' && user.role !== 'admin') {
      navigate('/customer-dashboard');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.put(`/shops/${shop.id}`, profileForm);
      setShop((prev: any) => ({ ...prev, ...res.data }));
      setSuccessMsg('Boutique profile updated successfully!');
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update shop details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        name: productForm.name,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        category: productForm.category,
        imageUrl: productForm.imageUrl,
        description: productForm.description,
        variants: variants
      };

      const res = await api.post('/products', payload);
      setProducts((prev) => [res.data, ...prev]);
      setProductForm({
        name: '',
        price: '',
        stock: '10',
        category: 'All Wear',
        imageUrl: '',
        description: ''
      });
      setVariants([]);
      setSuccessMsg('New product catalog item added successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create product listing');
    } finally {
      setProductLoading(false);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return;
    try {
      await api.delete(`/products/${prodId}`);
      setProducts((prev) => prev.filter(p => p.id !== prodId));
      setSuccessMsg('Product listing removed.');
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const handleAddImages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrls.trim()) return;

    setGalleryLoading(true);
    setError('');
    setSuccessMsg('');
    const urls = newImageUrls
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && (u.startsWith('http://') || u.startsWith('https://')));

    if (urls.length === 0) {
      setError('Please provide valid image URLs beginning with http:// or https://');
      setGalleryLoading(false);
      return;
    }

    try {
      const res = await api.post(`/shops/${shop.id}/gallery`, { urls });
      setGallery((prev) => [...res.data, ...prev]);
      setNewImageUrls('');
      setSuccessMsg(`Successfully added ${urls.length} images to lookbook!`);
    } catch (err: any) {
      setError('Failed to upload image links to your lookbook');
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleDeleteImage = async (imgId: string) => {
    if (!window.confirm('Are you sure you want to delete this lookbook image?')) return;
    try {
      await api.delete(`/shops/${shop.id}/gallery/${imgId}`);
      setGallery((prev) => prev.filter((img) => img.id !== imgId));
      setSuccessMsg('Image deleted successfully');
    } catch (err: any) {
      setError('Failed to delete lookbook image');
    }
  };

  const handleTogglePin = async (imgId: string) => {
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.put(`/shops/${shop.id}/gallery/${imgId}/pin`);
      setGallery((prev) => 
        prev.map((img) => img.id === imgId ? { ...img, is_pinned: res.data.is_pinned } : img)
      );
      setSuccessMsg(res.data.is_pinned ? 'Image pinned to top of profile!' : 'Image unpinned.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not update pin status.');
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => 
        prev.map(o => o.id === orderId ? { ...o, status: res.data.status } : o)
      );
      setSuccessMsg(`Order #${orderId.substring(0, 5)} updated to "${status.toUpperCase()}"`);
    } catch (err) {
      setError('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen">
        <div className="h-44 glass-panel shimmer rounded-xl mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel h-60 shimmer rounded-xl col-span-1"></div>
          <div className="glass-panel h-96 shimmer rounded-xl col-span-3"></div>
        </div>
      </div>
    );
  }

  if (shop && shop.status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <div className="glass-panel p-8 text-center space-y-6 rounded-2xl border border-luxury-border shadow-glass">
          <Clock className="w-16 h-16 text-luxury-gold mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold font-serif text-white">Boutique Verification Pending</h2>
          <p className="text-sm text-gray-400 font-light leading-relaxed max-w-md mx-auto">
            Your store registration for <strong>"{shop.name}"</strong> is currently pending review by Ashish Gauswami (Founder Admin). Once verified, you will have full access to your boutique dashboard.
          </p>
          <div className="pt-4">
            <button onClick={() => navigate('/')} className="btn-gold-metallic text-xs font-semibold px-6 py-3 uppercase tracking-wider">
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (shop && shop.status === 'blocked') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <div className="glass-panel p-8 text-center space-y-6 rounded-2xl border border-red-500 border-opacity-30 shadow-glass">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold font-serif text-white">Boutique Suspended</h2>
          <p className="text-sm text-gray-400 font-light leading-relaxed max-w-md mx-auto">
            Your boutique profile for <strong>"{shop.name}"</strong> has been suspended/blocked by the administrator due to violating marketplace guidelines. Please contact <strong>gauswamiashish760@gmail.com</strong> for appeals.
          </p>
          <div className="pt-4">
            <a href="mailto:gauswamiashish760@gmail.com" className="btn-gold-metallic text-xs font-semibold px-6 py-3 uppercase tracking-wider">
              Contact Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Sales calculations
  const totalSalesVolume = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.total_price), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 border-b border-luxury-border border-opacity-40 pb-6">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <Store className="w-8 h-8 text-luxury-gold shrink-0" />
          <div>
            <h1 className="text-3xl font-extrabold font-serif text-white tracking-wide flex items-center justify-center sm:justify-start gap-2">
              {shop.name}
              {shop.is_verified && <BadgeCheck className="w-5 h-5 fill-luxury-gold text-black" />}
            </h1>
            <p className="text-[10px] text-luxury-gold uppercase tracking-[0.2em] font-bold">Store Owner Control Center</p>
          </div>
        </div>
        
        <Link 
          to={`/shops/${shop.id}`}
          className="btn-gold-outline text-xs px-5 py-2.5 flex items-center space-x-1 font-semibold uppercase tracking-wider shrink-0"
        >
          <Eye className="w-4 h-4 mr-1.5" />
          <span>View Public Profile</span>
        </Link>
      </div>

      {/* Notifications banner */}
      {successMsg && (
        <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-35 rounded-xl p-4 text-xs text-green-400 mb-8 max-w-xl">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-35 rounded-xl p-4 text-xs text-red-400 mb-8 max-w-xl">
          {error}
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="glass-panel p-4 rounded-xl space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'overview' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-300 hover:bg-luxury-purpleMid hover:text-white'
              }`}
            >
              <Store className="w-4 h-4 mr-2.5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'profile' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-300 hover:bg-luxury-purpleMid hover:text-white'
              }`}
            >
              <Edit className="w-4 h-4 mr-2.5" />
              Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'products' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-300 hover:bg-luxury-purpleMid hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4 mr-2.5" />
              Products Catalog ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'gallery' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-300 hover:bg-luxury-purpleMid hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4 mr-2.5" />
              Lookbook Gallery
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'orders' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-300 hover:bg-luxury-purpleMid hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2.5" />
              Store Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'followers' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-300 hover:bg-luxury-purpleMid hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 mr-2.5" />
              Followers ({followers.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'settings' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-300 hover:bg-luxury-purpleMid hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 mr-2.5" />
              Settings
            </button>
          </div>
        </div>

        {/* Dynamic Display Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                {/* Stats Counters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="glass-panel p-6 rounded-xl border border-luxury-border flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Followers</p>
                      <h4 className="text-3xl font-extrabold text-white mt-1">{followers.length}</h4>
                    </div>
                    <Users className="w-10 h-10 text-luxury-gold opacity-30" />
                  </div>
                  <div className="glass-panel p-6 rounded-xl border border-luxury-border flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Sales (Completed)</p>
                      <h4 className="text-2xl font-extrabold text-luxury-gold mt-1">₹{totalSalesVolume.toLocaleString()}</h4>
                    </div>
                    <BarChart3 className="w-10 h-10 text-luxury-gold opacity-30" />
                  </div>
                  <div className="glass-panel p-6 rounded-xl border border-luxury-border flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Orders Received</p>
                      <h4 className="text-3xl font-extrabold text-white mt-1">{orders.length}</h4>
                    </div>
                    <CreditCard className="w-10 h-10 text-luxury-gold opacity-30" />
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="glass-panel p-6 rounded-xl border border-luxury-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">Sales Progress Milestone</h3>
                    <span className="text-[10px] bg-luxury-gold bg-opacity-10 text-luxury-gold font-bold px-2 py-0.5 rounded">₹1,00,000 Target</span>
                  </div>
                  <div className="h-3.5 bg-luxury-purpleDeep bg-opacity-40 rounded-full overflow-hidden border border-luxury-border border-opacity-35">
                    <div 
                      className="h-full bg-gold-metallic transition-all duration-1000"
                      style={{ width: `${Math.min(100, (totalSalesVolume / 100000) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Your boutique has completed ₹{totalSalesVolume.toLocaleString()} in checkout inquiries.
                  </p>
                </div>

                {/* Profile Card Summary */}
                <div className="glass-panel rounded-xl overflow-hidden border border-luxury-border">
                  <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${shop.cover_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=400&q=80'})` }}></div>
                  <div className="p-6 relative -mt-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                    <img 
                      src={shop.logo_url || 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=150&h=150&q=80'} 
                      alt={shop.name}
                      className="w-20 h-20 rounded-xl border-2 border-luxury-gold object-cover bg-luxury-black"
                    />
                    <div className="space-y-2 mt-2">
                      <h3 className="text-xl font-bold text-white">{shop.name}</h3>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">{shop.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: EDIT PROFILE */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="glass-panel p-6 sm:p-8 rounded-xl border border-luxury-border"
              >
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400">Shop Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="luxury-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400">Owner Name</label>
                      <input
                        type="text"
                        value={profileForm.ownerName}
                        onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                        className="luxury-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400">Phone</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="luxury-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400">Email (Read Only)</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        className="luxury-input opacity-70 cursor-not-allowed"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400">Category (Read Only)</label>
                      <input
                        type="text"
                        value={profileForm.category}
                        className="luxury-input opacity-70 cursor-not-allowed"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400">City</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="luxury-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400">Instagram Handle / URL</label>
                    <input
                      type="url"
                      value={profileForm.instagramUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, instagramUrl: e.target.value })}
                      className="luxury-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400">Description</label>
                    <textarea
                      value={profileForm.description}
                      onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                      rows={4}
                      className="luxury-input resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 block mb-1">Logo Image (Upload or enter URL)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="text-xs text-gray-400 block w-full file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-luxury-border file:bg-luxury-purpleDeep file:text-luxury-gold file:text-xs file:cursor-pointer"
                      />
                      {logoUploading && <p className="text-[10px] text-luxury-gold italic">Uploading logo...</p>}
                      <input
                        type="url"
                        value={profileForm.logoUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
                        placeholder="Or paste Logo URL here..."
                        className="luxury-input mt-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 block mb-1">Cover Banner (Upload or enter URL)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="text-xs text-gray-400 block w-full file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-luxury-border file:bg-luxury-purpleDeep file:text-luxury-gold file:text-xs file:cursor-pointer"
                      />
                      {coverUploading && <p className="text-[10px] text-luxury-gold italic">Uploading banner...</p>}
                      <input
                        type="url"
                        value={profileForm.coverUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, coverUrl: e.target.value })}
                        placeholder="Or paste Cover URL here..."
                        className="luxury-input mt-1"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold-metallic w-full py-3.5 text-xs font-bold uppercase tracking-wider"
                  >
                    {submitting ? 'Saving changes...' : 'Save Profile Changes'}
                  </button>

                </form>
              </motion.div>
            )}

            {/* TAB 3: PRODUCTS CATALOG */}
            {activeTab === 'products' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-8"
              >
                {/* Add product form */}
                <div className="glass-panel p-6 rounded-xl border border-luxury-border space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold flex items-center">
                    <Plus className="w-4 h-4 mr-1.5" /> List New Couture Item
                  </h3>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-semibold uppercase">Product Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Silk Bandhgala"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="luxury-input py-2 text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-semibold uppercase">Price (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 4500"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="luxury-input py-2 text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-semibold uppercase">Stock Limit</label>
                        <input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          className="luxury-input py-2 text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-semibold uppercase block mb-1">Item Image (Upload or enter URL)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProductImageUpload}
                          className="text-xs text-gray-400 block w-full file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-luxury-border file:bg-luxury-purpleDeep file:text-luxury-gold file:text-[10px] file:cursor-pointer"
                        />
                        {productImageUploading && <p className="text-[10px] text-luxury-gold italic">Uploading image...</p>}
                        <input
                          type="url"
                          placeholder="Or paste URL here..."
                          value={productForm.imageUrl}
                          onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                          className="luxury-input py-2 text-xs mt-1"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-semibold uppercase">Product Category</label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="luxury-input py-2 text-xs"
                        >
                          <option value="Menswear">Menswear</option>
                          <option value="Womenswear">Womenswear</option>
                          <option value="Kids Wear">Kids Wear</option>
                          <option value="Ethnic Wear">Ethnic Wear</option>
                          <option value="Footwear">Footwear</option>
                          <option value="Accessories">Accessories</option>
                          <option value="All Wear">All Wear</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-semibold uppercase">Short Description</label>
                      <textarea
                        placeholder="Fabric details, fits, tailors craftsmanship..."
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows={2}
                        className="luxury-input text-xs resize-none"
                      />
                    </div>

                    {/* VARIANTS CONFIGURATION SECTION */}
                    <div className="border-t border-luxury-border border-opacity-35 pt-4 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-luxury-gold uppercase tracking-wider">Product Variants (Optional)</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">Add sizes and colors for this couture item. Specifying variants helps customers pick their exact measurements.</p>
                      </div>

                      {/* Display current variants */}
                      {variants.length > 0 && (
                        <div className="flex flex-wrap gap-2 py-1.5">
                          {variants.map((v, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-luxury-gold border-opacity-40 bg-luxury-purpleDeep bg-opacity-20 text-[10.5px] text-gray-300 font-semibold"
                            >
                              <span>{v.size} / {v.color} ({v.stock} pcs)</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(index)}
                                className="text-red-400 hover:text-red-300 text-xs font-bold ml-1"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Add new variant controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-luxury-black bg-opacity-40 p-3 rounded-lg border border-luxury-border border-opacity-20">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 uppercase font-semibold">Size</label>
                          <select
                            value={newVariant.size}
                            onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                            className="luxury-input py-1.5 text-[11px] h-[34px]"
                          >
                            <option value="S">S (Small)</option>
                            <option value="M">M (Medium)</option>
                            <option value="L">L (Large)</option>
                            <option value="XL">XL (Extra Large)</option>
                            <option value="XXL">XXL (Double XL)</option>
                            <option value="Free Size">Free Size</option>
                            <option value="Custom">Custom</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 uppercase font-semibold">Color</label>
                          <input
                            type="text"
                            placeholder="e.g. Gold"
                            value={newVariant.color}
                            onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                            className="luxury-input py-1.5 text-[11px] h-[34px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 uppercase font-semibold">Variant Stock</label>
                          <input
                            type="number"
                            value={newVariant.stock}
                            onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                            className="luxury-input py-1.5 text-[11px] h-[34px]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          className="bg-luxury-purpleLight hover:bg-luxury-purpleMid border border-luxury-gold border-opacity-40 text-luxury-gold text-[10px] font-bold uppercase tracking-wider py-2 rounded transition-colors h-[34px]"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={productLoading || productImageUploading}
                      className="btn-gold-metallic px-6 py-2.5 text-xs font-bold uppercase tracking-wider mt-4"
                    >
                      {productLoading ? 'Listing Item...' : 'Add to Catalog'}
                    </button>
                  </form>
                </div>

                {/* Catalog listings list */}
                <div className="glass-panel rounded-xl border border-luxury-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-luxury-purpleDeep bg-opacity-40 border-b border-luxury-border border-opacity-45 text-luxury-gold uppercase tracking-wider font-bold">
                          <th className="p-4">Product details</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">No catalog products listed yet.</td>
                          </tr>
                        ) : (
                          products.map((p) => (
                            <tr key={p.id} className="border-b border-luxury-border border-opacity-25 hover:bg-luxury-purpleDeep hover:bg-opacity-10 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <img src={p.image_url} alt={p.name} className="w-9 h-11 object-cover rounded border border-luxury-border" />
                                  <div>
                                    <h4 className="font-semibold text-white">{p.name}</h4>
                                    <p className="text-[9px] text-gray-500 line-clamp-1 max-w-xs">{p.description}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-gray-300 font-medium">{p.category}</td>
                              <td className="p-4 text-luxury-gold font-bold">₹{Number(p.price).toLocaleString()}</td>
                              <td className="p-4 text-gray-400 font-semibold">{p.stock} pcs</td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 border border-red-500 border-opacity-20 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 4: GALLERY LOOKBOOK */}
            {activeTab === 'gallery' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-8"
              >
                <div className="glass-panel p-6 rounded-xl border border-luxury-border space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold flex items-center">
                    <Plus className="w-4 h-4 mr-1.5" /> Add Lookbook Images
                  </h3>
                  <form onSubmit={handleAddImages} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 block">Upload Gallery Files</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="text-xs text-gray-400 block w-full file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-luxury-border file:bg-luxury-purpleDeep file:text-luxury-gold file:text-xs file:cursor-pointer"
                      />
                      {galleryUploading && <p className="text-[10px] text-luxury-gold italic">Uploading files...</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 block">Or Paste Lookbook URLs</label>
                      <textarea
                        placeholder="Paste image links starting with https://. Paste multiple links separated by commas or newlines..."
                        value={newImageUrls}
                        onChange={(e) => setNewImageUrls(e.target.value)}
                        rows={3}
                        className="luxury-input resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={galleryLoading || galleryUploading}
                      className="btn-gold-metallic px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
                    >
                      {galleryLoading ? 'Adding...' : 'Add Images to Lookbook'}
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {gallery.map((img) => (
                    <div 
                      key={img.id}
                      className={`glass-panel rounded-xl overflow-hidden border flex flex-col relative ${
                        img.is_pinned ? 'border-luxury-gold' : 'border-luxury-border border-opacity-40'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden relative bg-black">
                        <img 
                          src={img.image_url} 
                          alt="Boutique lookbook look"
                          className="w-full h-full object-cover"
                        />
                        {img.is_pinned && (
                          <div className="absolute top-2 right-2 bg-luxury-black bg-opacity-90 border border-luxury-gold p-1.5 rounded-full text-luxury-gold shadow">
                            <Pin className="w-3.5 h-3.5 fill-luxury-gold" />
                          </div>
                        )}
                      </div>

                      <div className="p-3 mt-auto flex items-center justify-between border-t border-luxury-border border-opacity-35 bg-luxury-purpleDeep bg-opacity-25 text-xs">
                        <button
                          onClick={() => handleTogglePin(img.id)}
                          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full border transition-colors ${
                            img.is_pinned 
                              ? 'bg-luxury-gold bg-opacity-10 border-luxury-gold text-luxury-gold font-bold' 
                              : 'border-luxury-border text-gray-400 hover:text-white hover:border-white'
                          }`}
                        >
                          <Pin className="w-3 h-3" />
                          <span>{img.is_pinned ? 'Pinned' : 'Pin (Max 3)'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="p-1.5 rounded-full border border-red-500 border-opacity-20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </motion.div>
            )}

            {/* TAB 5: RECEIVED ORDERS */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-8"
              >
                {/* Orders received list */}
                <div className="glass-panel p-6 sm:p-8 rounded-xl border border-luxury-border">
                  <div className="border-b border-luxury-border border-opacity-35 pb-3 mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold">Transaction Invoices</h3>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 text-xs font-light">
                      No client orders received yet.
                    </div>
                  ) : (
                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                      {orders.map((o) => (
                        <div 
                          key={o.id}
                          className="p-5 rounded-xl border border-luxury-border border-opacity-40 bg-luxury-purpleDeep bg-opacity-20 flex flex-col space-y-4"
                        >
                          {/* Top: reference & status */}
                          <div className="flex flex-wrap items-center justify-between border-b border-luxury-border border-opacity-20 pb-3 gap-2">
                            <div>
                              <h4 className="font-bold text-xs text-white">Order Reference: #{o.id.substring(0, 8).toUpperCase()}</h4>
                              <p className="text-[10px] text-gray-500 mt-0.5">Date: {new Date(o.created_at).toLocaleString()}</p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                o.status === 'completed'
                                  ? 'bg-green-500 bg-opacity-10 text-green-400 border-green-500 border-opacity-20'
                                  : o.status === 'shipped'
                                  ? 'bg-blue-500 bg-opacity-10 text-blue-400 border-blue-500 border-opacity-20'
                                  : o.status === 'cancelled'
                                  ? 'bg-red-500 bg-opacity-10 text-red-400 border-red-500 border-opacity-20'
                                  : 'bg-yellow-500 bg-opacity-10 text-yellow-400 border-yellow-500 border-opacity-20'
                              }`}>
                                {o.status}
                              </span>
                            </div>
                          </div>

                          {/* Middle: customer coordinates & items */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2 border-r border-luxury-border border-opacity-20 pr-4">
                              <h5 className="font-bold text-[10px] uppercase text-luxury-gold tracking-wider">Shipping coordinates</h5>
                              <p className="text-gray-300">Name: <strong className="text-white">{o.customer_name}</strong></p>
                              <p className="text-gray-300">Phone: <strong className="text-white">{o.customer_phone}</strong></p>
                              <p className="text-gray-300">Email: <strong className="text-white">{o.customer_email}</strong></p>
                              <p className="text-gray-400 font-light mt-1">Address: {o.customer_address}</p>
                            </div>

                            <div className="space-y-2 pl-0 md:pl-4">
                              <h5 className="font-bold text-[10px] uppercase text-luxury-gold tracking-wider">Purchase items</h5>
                              <div className="space-y-1.5">
                                {(typeof o.items === 'string' ? JSON.parse(o.items) : o.items).map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center text-gray-300 gap-3">
                                    <div className="flex flex-col">
                                      <span>{item.name} <strong className="text-luxury-gold">x{item.quantity}</strong></span>
                                      {item.size && (
                                        <span className="text-[9px] text-gray-500 font-light mt-0.5">
                                          Variant: {item.size} / {item.color}
                                        </span>
                                      )}
                                    </div>
                                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="border-t border-luxury-border border-opacity-20 pt-2 flex justify-between text-white font-extrabold">
                                <span>Grand Total:</span>
                                <span className="text-luxury-gold">₹{Number(o.total_price).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Bottom: Fulfillment actions */}
                          <div className="border-t border-luxury-border border-opacity-20 pt-3 flex flex-wrap gap-2 justify-end">
                            {o.status === 'pending' && (
                              <button
                                onClick={() => handleOrderStatusChange(o.id, 'confirmed')}
                                disabled={updatingOrderId === o.id}
                                className="bg-luxury-gold text-black font-bold text-[10px] uppercase px-3 py-1.5 rounded"
                              >
                                Confirm Order
                              </button>
                            )}
                            {o.status === 'confirmed' && (
                              <button
                                onClick={() => handleOrderStatusChange(o.id, 'shipped')}
                                disabled={updatingOrderId === o.id}
                                className="bg-blue-500 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded"
                              >
                                Ship Order
                              </button>
                            )}
                            {o.status === 'shipped' && (
                              <button
                                onClick={() => handleOrderStatusChange(o.id, 'completed')}
                                disabled={updatingOrderId === o.id}
                                className="bg-green-500 text-black font-bold text-[10px] uppercase px-3 py-1.5 rounded"
                              >
                                Mark Completed
                              </button>
                            )}
                            {o.status !== 'completed' && o.status !== 'cancelled' && (
                              <button
                                onClick={() => handleOrderStatusChange(o.id, 'cancelled')}
                                disabled={updatingOrderId === o.id}
                                className="border border-red-500 border-opacity-30 text-red-400 hover:bg-red-500 hover:text-white font-semibold text-[10px] uppercase px-3 py-1.5 rounded transition-colors"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Personal purchases placed */}
                <div className="glass-panel p-6 sm:p-8 rounded-xl border border-luxury-border">
                  <div className="border-b border-luxury-border border-opacity-35 pb-3 mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold">My Purchases Inquiries</h3>
                  </div>

                  {myPurchases.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 text-xs font-light">
                      You have not submitted purchase inquiries to other stores yet.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {myPurchases.map((purchase) => (
                        <div 
                          key={purchase.id}
                          className="p-4 rounded-xl border border-luxury-border border-opacity-25 bg-luxury-purpleDeep bg-opacity-10 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-white">Order Reference: #{purchase.id.substring(0, 8).toUpperCase()}</h4>
                            <p className="text-[10px] text-gray-500">Date: {new Date(purchase.created_at).toLocaleDateString()}</p>
                            <p className="text-gray-400">Total Price: <strong className="text-luxury-gold">₹{Number(purchase.total_price).toLocaleString()}</strong></p>
                          </div>
                          
                          <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            purchase.status === 'completed'
                              ? 'bg-green-500 bg-opacity-10 text-green-400 border-green-500 border-opacity-20'
                              : purchase.status === 'cancelled'
                              ? 'bg-red-500 bg-opacity-10 text-red-400 border-red-500 border-opacity-20'
                              : 'bg-yellow-500 bg-opacity-10 text-yellow-400 border-yellow-500 border-opacity-20'
                          }`}>
                            {purchase.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* TAB 6: FOLLOWERS LIST */}
            {activeTab === 'followers' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="glass-panel p-6 sm:p-8 rounded-xl border border-luxury-border"
              >
                <div className="border-b border-luxury-border border-opacity-30 pb-4 mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold">Followers Directory</h3>
                </div>

                {followers.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-xs font-light">
                    No customers are currently following your shop. Share your profile on social media!
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {followers.map((follower) => (
                      <div 
                        key={follower.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-luxury-purpleDeep bg-opacity-25 border border-luxury-border border-opacity-30"
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src={follower.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'} 
                            alt={follower.name}
                            className="w-10 h-10 rounded-full border border-luxury-border object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-xs text-white">{follower.name}</h4>
                            <p className="text-[10px] text-gray-400">{follower.email}</p>
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-500 font-medium">
                          Followed on {new Date(follower.followed_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 7: SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="glass-panel p-6 sm:p-8 rounded-xl border border-luxury-border space-y-6"
              >
                <div className="border-b border-luxury-border border-opacity-30 pb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold">Dashboard Preferences</h3>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-luxury-purpleDeep bg-opacity-20 border border-luxury-border border-opacity-30">
                  <div>
                    <h4 className="font-semibold text-xs text-white">Receive Follow Notifications</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Send alert notifications to your dashboard when customers follow your store.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setAllowNotifications(!allowNotifications);
                      setSuccessMsg('Settings updated successfully');
                    }}
                    className="text-luxury-gold hover:opacity-85 transition-opacity"
                  >
                    {allowNotifications ? (
                      <ToggleRight className="w-10 h-10" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-600" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-luxury-purpleDeep bg-opacity-20 border border-luxury-border border-opacity-30">
                  <div>
                    <h4 className="font-semibold text-xs text-white">Boutique Display Settings</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Manage details and styling options for your public lookbook presentation.</p>
                  </div>
                  <button className="btn-gold-outline text-[10px] uppercase font-bold tracking-wider px-4 py-2">
                    Manage Theme
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
