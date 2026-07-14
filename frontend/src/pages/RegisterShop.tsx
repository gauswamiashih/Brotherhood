import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, uploadImage } from '../services/api';
import { motion } from 'framer-motion';
import { Store, ShieldCheck, Clock, AlertCircle, BadgeCheck, MapPin } from 'lucide-react';
import { getCategoryLogo, getCategoryCover } from '../utils/fallback';

export const RegisterShop: React.FC = () => {
  const { isAuthenticated, user, simulateAuth } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: user?.name || '',
    phone: '',
    email: user?.email || '',
    city: 'Palanpur',
    category: '',
    description: '',
    instagramUrl: '',
    logoUrl: '',
    coverUrl: '',
    galleryUrlsString: '', // Add images separated by commas or newlines
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Dev simulation email state
  const [devEmail, setDevEmail] = useState('');
  const [devLoading, setDevLoading] = useState(false);

  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUploading(true);
      setError('');
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormData((prev) => ({ ...prev, logoUrl: url }));
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
        setFormData((prev) => ({ ...prev, coverUrl: url }));
      } catch (err: any) {
        setError('Failed to upload cover image');
      } finally {
        setCoverUploading(false);
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
        
        const currentString = formData.galleryUrlsString.trim();
        const separator = currentString ? ',\n' : '';
        setFormData((prev) => ({
          ...prev,
          galleryUrlsString: currentString + separator + urls.join(',\n')
        }));
      } catch (err: any) {
        setError('Failed to upload some gallery images');
      } finally {
        setGalleryUploading(false);
      }
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, category: res.data[0].name }));
        }
      } catch (err) {
        console.warn('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Update owner details if user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        ownerName: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devEmail.trim() || !devEmail.includes('@')) {
      setError('Please enter a valid developer email');
      return;
    }
    setDevLoading(true);
    setError('');
    try {
      await simulateAuth(devEmail.trim());
    } catch (err: any) {
      setError(err.message || 'Developer bypass login failed');
    } finally {
      setDevLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-process gallery images
    const galleryUrls = formData.galleryUrlsString
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0 && (url.startsWith('http://') || url.startsWith('https://')));

    try {
      const payload = {
        ...formData,
        galleryUrls,
      };

      await api.post('/shops', payload);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In verification handler (for production)
  useEffect(() => {
    if (!isAuthenticated && (window as any).google) {
      const initGoogle = () => {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '',
            callback: async (response: any) => {
              try {
                setError('');
                setLoading(true);
                // Auth context login
                const authContext = (useAuth() as any);
                await authContext.loginWithGoogle(response.credential);
              } catch (err: any) {
                setError(err.message || 'Google Auth verification failed');
              } finally {
                setLoading(false);
              }
            }
          });
          
          (window as any).google.accounts.id.renderButton(
            document.getElementById('google-btn-register'),
            { theme: 'dark', size: 'large', width: '320' }
          );
        } catch (err) {
          console.warn("Failed to initialize Google GIS element", err);
        }
      };
      // Short delay to ensure client load
      const t = setTimeout(initGoogle, 500);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated]);

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 sm:p-12 rounded-2xl border border-luxury-gold border-opacity-30 text-center space-y-6 shadow-goldGlow"
        >
          <div className="w-16 h-16 rounded-full bg-luxury-gold bg-opacity-10 border border-luxury-gold flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-luxury-gold" />
          </div>
          <h2 className="text-3xl font-extrabold font-serif text-white tracking-wide">Registration Submitted</h2>
          <div className="text-xs text-luxury-gold uppercase tracking-widest font-bold">STATUS: PENDING REVIEW</div>
          <p className="text-sm text-gray-400 font-light leading-relaxed max-w-md mx-auto">
            Thank you for registering your shop! Your profile has been submitted. The Founder Admin, <strong>Ashish Gauswami</strong>, will review and verify your boutique. You will receive an instant notification once your shop goes live in the marketplace.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard" className="btn-gold-metallic text-xs font-semibold px-6 py-3 uppercase tracking-wider">
              Go to Owner Dashboard
            </Link>
            <Link to="/" className="btn-gold-outline text-xs font-semibold px-6 py-3 uppercase tracking-wider">
              Return Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render Login landing if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 min-h-[80vh] grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-luxury-gold border-opacity-25 bg-luxury-purpleMid bg-opacity-20 text-xs font-bold text-luxury-gold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Verified Retailer Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif leading-tight">
            Claim Your <br />
            <span className="text-gold-gradient">Boutique Profile</span>
          </h1>
          <p className="text-sm text-gray-400 font-light leading-relaxed max-w-sm">
            Unlock premium features: display lookbooks, manage pinned catalog collections, track organic followers, and showcase your luxury designs in Palanpur's fashion network.
          </p>
        </div>

        <div className="glass-panel p-8 sm:p-10 rounded-2xl border border-luxury-border shadow-glass space-y-6">
          <div className="text-center space-y-2">
            <Store className="w-10 h-10 text-luxury-gold mx-auto" />
            <h3 className="text-lg font-bold font-serif">Sign-in Required</h3>
            <p className="text-xs text-gray-400">To register a shop, you must log in with a verified account.</p>
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-3 flex items-start space-x-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google SSO Render Target */}
          <div className="flex flex-col items-center justify-center py-2">
            <div id="google-btn-register" className="mb-2"></div>
            <p className="text-[10px] text-gray-500 mt-2">Sign in safely using Google OAuth Secure SSO</p>
          </div>

          {/* Dev Bypass Section */}
          <div className="border-t border-luxury-border border-opacity-35 pt-4 text-center">
            <p className="text-xs text-gray-400 mb-3">Local Developer Simulation</p>
            <form onSubmit={handleDevLogin} className="space-y-3">
              <input
                type="email"
                placeholder="developer@gmail.com"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                className="w-full bg-luxury-black bg-opacity-60 border border-luxury-border rounded-lg px-3 py-2 text-xs text-white"
                required
              />
              <button
                type="submit"
                disabled={devLoading}
                className="w-full bg-luxury-purpleLight hover:bg-luxury-purpleMid border border-luxury-border text-xs font-bold text-luxury-gold py-2 rounded-lg transition-colors"
              >
                {devLoading ? 'Bypassing...' : 'Simulate Developer Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Already an owner block
  if (user?.role === 'owner') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <Store className="w-12 h-12 text-luxury-gold mx-auto" />
        <h2 className="text-2xl font-bold text-white font-serif">Already Registered</h2>
        <p className="text-sm text-gray-400 font-light">
          Your account is already associated with an active boutique. You can modify your store details, pin images, and check follower counts via your dashboard.
        </p>
        <div className="pt-4">
          <Link to="/dashboard" className="btn-gold-metallic text-xs font-bold uppercase tracking-wider px-6 py-3">
            Go to Owner Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen">
      
      <div className="text-center mb-12 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-wide">REGISTER YOUR SHOP</h1>
        <p className="text-xs text-luxury-gold font-bold uppercase tracking-widest">Palanpur Fashion Network Enrollment</p>
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-xl p-4 flex items-start space-x-2 text-sm text-red-400 mb-8 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-8 sm:p-10 rounded-2xl border border-luxury-border shadow-glass space-y-8">
        
        {/* SECTION 1: Owner Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold tracking-widest text-luxury-gold uppercase border-b border-luxury-border border-opacity-30 pb-2">1. Owner Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">Owner Name</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                className="luxury-input"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">Owner Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                className="luxury-input opacity-70 cursor-not-allowed"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Shop Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold tracking-widest text-luxury-gold uppercase border-b border-luxury-border border-opacity-30 pb-2">2. Boutique Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">Shop Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Couture Royal"
                className="luxury-input"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">Phone Contact</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9664592743"
                className="luxury-input"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="luxury-input"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">Boutique Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="luxury-input appearance-none"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name} className="bg-luxury-purpleDeep">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400">Instagram Handle / URL</label>
            <input
              type="url"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleChange}
              placeholder="e.g. https://www.instagram.com/gauswami_8_07_18"
              className="luxury-input"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400">Boutique Description (Story, Craft, Specialized Wear)</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell our visitors about your boutique, designs, and collections..."
              className="luxury-input resize-none"
            />
          </div>
        </div>

        {/* SECTION 3: Visual Identity (Images) */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold tracking-widest text-luxury-gold uppercase border-b border-luxury-border border-opacity-30 pb-2">3. Visual Assets</h3>
          
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
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
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
                name="coverUrl"
                value={formData.coverUrl}
                onChange={handleChange}
                placeholder="Or paste Cover URL here..."
                className="luxury-input mt-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 block mb-1">Initial Lookbook Gallery (Upload files or enter URLs)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="text-xs text-gray-400 block w-full file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-luxury-border file:bg-luxury-purpleDeep file:text-luxury-gold file:text-xs file:cursor-pointer"
            />
            {galleryUploading && <p className="text-[10px] text-luxury-gold italic">Uploading gallery images...</p>}
            <textarea
              name="galleryUrlsString"
              rows={3}
              value={formData.galleryUrlsString}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-1,&#10;https://images.unsplash.com/photo-2"
              className="luxury-input resize-none mt-1"
            />
          </div>
        </div>
        {/* Live Preview Card */}
        <div className="space-y-4 pt-4 border-t border-luxury-border border-opacity-35">
          <h3 className="text-sm font-bold tracking-widest text-luxury-gold uppercase pb-1">Live Boutique Card Preview</h3>
          
          <div className="glass-panel rounded-2xl overflow-hidden border border-luxury-gold border-opacity-35 relative shadow-goldGlow max-w-2xl mx-auto">
            {/* Cover Banner background image */}
            <div 
              className="h-36 sm:h-44 bg-cover bg-center filter brightness-[0.3]"
              style={{ backgroundImage: `url(${formData.coverUrl || getCategoryCover(formData.category)})` }}
            />
            
            <div className="p-6 relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              {/* Circular Logo Frame */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-luxury-gold bg-luxury-black overflow-hidden shadow-goldGlowStrong shrink-0 relative group">
                <img 
                  src={formData.logoUrl || getCategoryLogo(formData.category)} 
                  alt={formData.name || 'Boutique Preview'}
                  onError={(e) => {
                    e.currentTarget.src = getCategoryLogo(formData.category);
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 mt-12 sm:mt-16 flex-grow">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide font-serif">
                    {formData.name || 'Gauswami\'s'}
                  </h4>
                  <div className="flex items-center space-x-1 bg-luxury-gold bg-opacity-10 border border-luxury-gold px-2 py-0.5 rounded text-[8px] font-bold text-luxury-gold uppercase tracking-wider">
                    <BadgeCheck className="w-3 h-3 fill-luxury-gold text-black" />
                    <span>FOUNDER</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 font-light leading-relaxed max-w-md">
                  {formData.description || 'Palanpur\'s ultimate fashion destination. Offering a curated collection of premium designer wear, luxury casuals, and modern streetwear.'}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[10px] text-gray-300 pt-1">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-luxury-gold mr-0.5" /> 
                    {formData.city || 'Palanpur'}
                  </span>
                  <span className="px-2 py-0.5 bg-luxury-purpleLight rounded-full text-[9px] uppercase font-bold text-luxury-gold">
                    {formData.category || 'All Wear'}
                  </span>
                  <span className="text-luxury-gold font-semibold">1 Followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold-metallic w-full py-4 text-xs font-bold uppercase tracking-widest mt-4"
        >
          {loading ? 'Submitting Registration...' : 'Submit Boutique Registration'}
        </button>

      </form>
    </div>
  );
};
