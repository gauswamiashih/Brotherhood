import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ShoppingBag, Heart, Bell, Settings,
  LogOut, ArrowRight, BookmarkCheck,
  ToggleLeft, ToggleRight, Mail, RefreshCw
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'notifications' | 'settings'>('orders');
  
  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [followedShops, setFollowedShops] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Dashboard UI states
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);
  
  // Profile settings state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
  });

  const [allowEmailNotifications, setAllowEmailNotifications] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch personal orders
      const ordersRes = await api.get('/orders/my');
      setOrders(ordersRes.data);

      // 2. Fetch notifications
      const notifRes = await api.get('/notifications');
      setNotifications(notifRes.data);

      // 3. Fetch followed shops
      const shopsRes = await api.get('/shops');
      const allShops = shopsRes.data;
      
      const followed: any[] = [];
      for (const s of allShops) {
        try {
          const followStatusRes = await api.get(`/shops/${s.id}/follow-status`);
          if (followStatusRes.data.following) {
            followed.push(s);
          }
        } catch (e) {
          // ignore
        }
      }
      setFollowedShops(followed);

      // Fetch email notifications preference
      try {
        const prefRes = await api.get('/users/settings/notifications');
        setAllowEmailNotifications(prefRes.data.allow_email_notifications);
      } catch (e) {
        console.error('Failed to load email preferences', e);
      }

      // Load saved mock address / phone from localStorage
      const savedPhone = localStorage.getItem('brotherhood_phone') || '';
      const savedAddress = localStorage.getItem('brotherhood_address') || '';
      setProfileForm({
        name: user?.name || '',
        phone: savedPhone,
        address: savedAddress
      });

    } catch (err) {
      console.error('Failed to load customer dashboard details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'customer') {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'owner') {
        navigate('/dashboard');
      }
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      localStorage.setItem('brotherhood_phone', profileForm.phone);
      localStorage.setItem('brotherhood_address', profileForm.address);
      setSuccessMsg('Fulfillment details and profile coordinates updated!');
    } catch (err) {
      setErrorMsg('Failed to update details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleEmailNotifications = async () => {
    const newVal = !allowEmailNotifications;
    try {
      setAllowEmailNotifications(newVal);
      await api.put('/users/settings/notifications', { allowEmailNotifications: newVal });
      setSuccessMsg('Email preferences updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setAllowEmailNotifications(!newVal);
      setErrorMsg(err.response?.data?.error || 'Failed to update email preferences.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleTriggerTestEmail = async (type: string) => {
    try {
      setSuccessMsg(`Queuing test ${type} email...`);
      const res = await api.post('/users/test-email', { type });
      setSuccessMsg(res.data.message || `Test ${type} email queued.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to send test email.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen">
        <div className="h-44 glass-panel shimmer rounded-xl mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="glass-panel h-64 shimmer rounded-xl col-span-1"></div>
          <div className="glass-panel h-96 shimmer rounded-xl col-span-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Top Banner Details */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-luxury-border border-opacity-40 flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 shadow-glass">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img 
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'} 
            alt={user?.name}
            className="w-20 h-20 rounded-full border border-luxury-gold object-cover shadow-goldGlow"
          />
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide flex items-center justify-center sm:justify-start gap-1.5">
              {user?.name}
              {user?.role === 'customer' && (
                <span className="text-[9px] bg-luxury-gold bg-opacity-10 border border-luxury-gold px-2 py-0.5 rounded text-luxury-gold font-bold uppercase tracking-wider">
                  Verified Buyer
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-400 font-light">{user?.email}</p>
          </div>
        </div>

        <button 
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="btn-gold-outline text-xs px-5 py-2.5 flex items-center space-x-1.5 font-semibold uppercase tracking-wider shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-35 rounded-xl p-4 text-xs text-green-400 mb-8 max-w-xl">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-35 rounded-xl p-4 text-xs text-red-400 mb-8 max-w-xl">
          {errorMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="glass-panel p-4 rounded-xl space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'orders' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-300 hover:bg-luxury-purpleMid hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4 mr-2.5" />
              My Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'wishlist' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-300 hover:bg-luxury-purpleMid hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4 mr-2.5" />
              Followed Boutiques ({followedShops.length})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'notifications' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-300 hover:bg-luxury-purpleMid hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4 mr-2.5" />
              Notifications ({notifications.filter(n => !n.is_read).length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'profile' ? 'bg-luxury-gold text-black shadow-goldGlow' : 'text-gray-300 hover:bg-luxury-purpleMid hover:text-white'
              }`}
            >
              <User className="w-4 h-4 mr-2.5" />
              My Profile
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
            
            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                <div className="glass-panel p-6 sm:p-8 rounded-xl border border-luxury-border">
                  <div className="border-b border-luxury-border border-opacity-35 pb-3 mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold">My Purchases Inquiries</h3>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 text-xs font-light">
                      You haven't placed any order inquiries yet. Browse marketplace to find couture!
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((o) => (
                        <div 
                          key={o.id}
                          className="p-5 rounded-xl border border-luxury-border border-opacity-40 bg-luxury-purpleDeep bg-opacity-20 flex flex-col space-y-4 shadow"
                        >
                          <div className="flex flex-wrap items-center justify-between border-b border-luxury-border border-opacity-20 pb-3 gap-2">
                            <div>
                              <h4 className="font-bold text-xs text-white">REF: #{o.id.substring(0, 8).toUpperCase()}</h4>
                              <p className="text-[9px] text-gray-500">Shop: <strong className="text-luxury-gold">{o.shop_name || 'Boutique'}</strong></p>
                              <p className="text-[9px] text-gray-500 mt-0.5">Date: {new Date(o.created_at).toLocaleString()}</p>
                            </div>
                            
                            <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              o.status === 'completed'
                                ? 'bg-green-500 bg-opacity-10 text-green-400 border-green-500 border-opacity-20'
                                : o.status === 'cancelled'
                                ? 'bg-red-500 bg-opacity-10 text-red-400 border-red-500 border-opacity-20'
                                : o.status === 'shipped'
                                ? 'bg-blue-500 bg-opacity-10 text-blue-400 border-blue-500 border-opacity-20'
                                : 'bg-yellow-500 bg-opacity-10 text-yellow-400 border-yellow-500 border-opacity-20'
                            }`}>
                              {o.status}
                            </span>
                          </div>

                          {/* Visual timeline stepper */}
                          {o.status === 'cancelled' ? (
                            <div className="bg-red-500 bg-opacity-5 border border-red-500 border-opacity-25 rounded-lg p-3 text-center text-xs text-red-400 font-semibold tracking-wide uppercase shrink-0">
                              Order Cancelled
                            </div>
                          ) : (
                            <div className="py-2 space-y-4 border-t border-b border-luxury-border border-opacity-15 py-4">
                              <div className="flex items-center justify-between relative px-2">
                                {/* Connector Line Background */}
                                <div className="absolute top-[9px] left-8 right-8 h-0.5 bg-gray-700 z-0"></div>
                                {/* Active Connector Line */}
                                <div 
                                  className="absolute top-[9px] left-8 h-0.5 bg-luxury-gold z-0 transition-all duration-550"
                                  style={{
                                    width: `${
                                      o.status === 'pending' ? '0%' :
                                      o.status === 'confirmed' ? '33.33%' :
                                      o.status === 'shipped' ? '66.66%' : '100%'
                                    }`
                                  }}
                                ></div>

                                {/* Step items */}
                                {['pending', 'confirmed', 'shipped', 'completed'].map((step, idx) => {
                                  const stepsList = ['pending', 'confirmed', 'shipped', 'completed'];
                                  const stepLabels = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];
                                  const activeIdx = stepsList.indexOf(o.status);
                                  const isCompleted = idx <= activeIdx;
                                  const isCurrent = idx === activeIdx;

                                  return (
                                    <div key={step} className="flex flex-col items-center z-10 select-none">
                                      {/* Dot */}
                                      <div 
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                                          isCompleted 
                                            ? 'border-luxury-gold bg-luxury-black text-luxury-gold shadow-goldGlow' 
                                            : 'border-gray-600 bg-[#090214] text-gray-600'
                                        }`}
                                      >
                                        <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-luxury-gold animate-pulse' : 'bg-transparent'}`}></div>
                                      </div>
                                      <span className={`text-[9px] font-bold mt-1.5 uppercase tracking-wider ${isCurrent ? 'text-luxury-gold' : 'text-gray-500'}`}>
                                        {stepLabels[idx]}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Toggle Timeline logs */}
                              {o.status_history && (
                                <div className="pt-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedTimelineId(expandedTimelineId === o.id ? null : o.id)}
                                    className="text-[9px] text-luxury-gold font-bold uppercase tracking-widest hover:underline flex items-center gap-1.5"
                                  >
                                    {expandedTimelineId === o.id ? 'Hide Detailed Timeline' : 'View Detailed Timeline'}
                                  </button>
                                  
                                  <AnimatePresence>
                                    {expandedTimelineId === o.id && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 bg-luxury-black bg-opacity-40 p-3 rounded-lg border border-luxury-border border-opacity-15 space-y-2 overflow-hidden"
                                      >
                                        {(typeof o.status_history === 'string' ? JSON.parse(o.status_history) : o.status_history).map((log: any, logIdx: number) => (
                                          <div key={logIdx} className="flex items-start text-[10.5px] leading-relaxed text-gray-400 gap-2 border-l border-luxury-gold border-opacity-35 pl-3 relative">
                                            <div className="absolute left-[-3.5px] top-[5px] w-1.5 h-1.5 rounded-full bg-luxury-gold"></div>
                                            <div className="flex-grow">
                                              <span className="text-white font-semibold uppercase text-[9px] mr-1.5">{log.status}</span>
                                              <span>{log.notes}</span>
                                              <div className="text-[8px] text-gray-600 mt-0.5">
                                                {new Date(log.timestamp).toLocaleString()}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}

                            </div>
                          )}

                          <div className="space-y-2">
                            <h5 className="font-bold text-[10px] uppercase text-luxury-gold tracking-wider">Purchased Couture</h5>
                            <div className="space-y-1.5 text-xs text-gray-300">
                              {(typeof o.items === 'string' ? JSON.parse(o.items) : o.items).map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center">
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
                            <div className="border-t border-luxury-border border-opacity-20 pt-2 flex justify-between text-white text-sm font-extrabold mt-2">
                              <span>Total Price:</span>
                              <span className="text-luxury-gold">₹{Number(o.total_price).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="text-[10px] text-gray-500 font-light border-t border-luxury-border border-opacity-20 pt-3 flex items-center justify-between">
                            <span>Fulfillment Address: {o.customer_address}</span>
                            <span>Boutique phone: {o.customer_phone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: WISHLIST */}
            {activeTab === 'wishlist' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                <div className="glass-panel p-6 sm:p-8 rounded-xl border border-luxury-border">
                  <div className="border-b border-luxury-border border-opacity-35 pb-3 mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold">My Followed Boutiques</h3>
                  </div>

                  {followedShops.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 text-xs font-light">
                      You are not following any boutiques yet. Explore boutiques to receive alerts!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {followedShops.map((shop) => (
                        <div 
                          key={shop.id}
                          className="glass-panel p-4 rounded-xl border border-luxury-border border-opacity-30 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <img src={shop.logo_url} alt={shop.name} className="w-12 h-12 rounded object-cover border" />
                            <div>
                              <h4 className="font-serif font-bold text-white text-sm flex items-center gap-1">
                                {shop.name}
                                {shop.is_verified && <BookmarkCheck className="w-3.5 h-3.5 text-luxury-gold" />}
                              </h4>
                              <p className="text-[10px] text-gray-500">{shop.category}</p>
                            </div>
                          </div>
                          <Link to={`/shops/${shop.id}`} className="text-luxury-gold hover:underline text-xs flex items-center gap-1 font-semibold uppercase">
                            Enter
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                <div className="glass-panel p-6 sm:p-8 rounded-xl border border-luxury-border">
                  <div className="border-b border-luxury-border border-opacity-35 pb-3 mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold">Notification Center</h3>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 text-xs font-light">
                      No notifications yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((n) => (
                        <div 
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-4 rounded-xl border border-luxury-border border-opacity-30 flex items-start justify-between cursor-pointer transition-colors ${
                            n.is_read ? 'bg-transparent' : 'bg-luxury-purpleMid bg-opacity-15 hover:bg-opacity-25'
                          }`}
                        >
                          <div className="space-y-1">
                            <h4 className={`text-xs font-bold ${n.is_read ? 'text-gray-300' : 'text-luxury-gold'}`}>{n.title}</h4>
                            <p className="text-[11px] text-gray-400 font-light leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-gray-500 mt-1 block">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {!n.is_read && <span className="w-2 h-2 bg-luxury-gold rounded-full shrink-0"></span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: PROFILE PROFILE */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="glass-panel p-6 sm:p-8 rounded-xl border border-luxury-border"
              >
                <div className="border-b border-luxury-border border-opacity-35 pb-3 mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold">Profile Coordinates</h3>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400">Account Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="luxury-input opacity-70 cursor-not-allowed"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400">Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9664592743"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="luxury-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400">Default Delivery Address</label>
                    <textarea
                      placeholder="Add detailed delivery coordinates in Palanpur..."
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      rows={3}
                      className="luxury-input resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold-metallic w-full py-3 text-xs font-bold uppercase tracking-widest"
                  >
                    {submitting ? 'Saving settings...' : 'Update Details'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="glass-panel p-6 sm:p-8 rounded-xl border border-luxury-border space-y-6"
              >
                <div className="border-b border-luxury-border border-opacity-35 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold">Settings Preferences</h3>
                </div>

                {/* Email Preferences Toggle */}
                <div className="p-4 rounded-xl bg-luxury-purpleDeep bg-opacity-20 border border-luxury-border border-opacity-30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-xs text-white">Receive Email Notifications</h4>
                    <p className="text-[10px] text-gray-400">Receive luxury order status updates, security alerts, and flagship lookbooks directly in your inbox.</p>
                  </div>
                  <button 
                    onClick={handleToggleEmailNotifications}
                    className="text-luxury-gold hover:opacity-85 transition-opacity focus:outline-none"
                  >
                    {allowEmailNotifications ? (
                      <ToggleRight className="w-10 h-10" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Test Sandbox Mail triggers */}
                <div className="p-5 rounded-xl border border-luxury-border border-opacity-20 bg-luxury-black bg-opacity-40 space-y-4">
                  <div>
                    <h4 className="font-bold text-xs text-luxury-gold uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-luxury-gold" />
                      Email Sandbox Test triggers
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Instantly queue template-rendered email alerts to your registered email address (<strong>${user?.email}</strong>) to inspect layout formatting and test delivery.
                    </p>
                  </div>

                  {successMsg && (
                    <div className="bg-luxury-gold bg-opacity-10 border border-luxury-gold border-opacity-30 rounded-lg p-2.5 text-[10px] text-luxury-gold">
                      {successMsg}
                    </div>
                  )}

                  {errorMsg && (
                    <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-2.5 text-[10px] text-red-400">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { type: 'welcome', label: 'Welcome Email' },
                      { type: 'verification', label: 'Verification Code' },
                      { type: 'password_reset', label: 'Password Reset' },
                      { type: 'login_alert', label: 'Security Login' },
                      { type: 'order_confirmation', label: 'Order Confirmed' },
                      { type: 'order_status', label: 'Order Shipped' },
                      { type: 'wishlist_price_drop', label: 'Price Drop' },
                      { type: 'back_in_stock', label: 'Back in Stock' },
                      { type: 'newsletter_confirmation', label: 'Newsletter Sub' },
                      { type: 'contact_response', label: 'Support Reply' },
                      { type: 'account_status', label: 'Account Suspension' },
                    ].map((item) => (
                      <button
                        key={item.type}
                        onClick={() => handleTriggerTestEmail(item.type)}
                        className="p-2 rounded-lg bg-luxury-purpleDeep bg-opacity-40 hover:bg-luxury-purpleMid hover:bg-opacity-40 border border-luxury-border border-opacity-30 text-[9px] text-gray-200 font-medium tracking-wide transition-all uppercase flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3 text-luxury-gold" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
