import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, LogOut, LayoutDashboard, Store, Menu, X, Bell, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../services/api';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin, cartCount } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data);
          setUnreadCount(res.data.filter((n: any) => !n.is_read).length);
        } catch (err) {
          console.warn('Failed to load notifications');
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
      setMobileMenuOpen(false);
    }
  };

  const markAsRead = async (notifId: string) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notifId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    return '/dashboard';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-luxury-black bg-opacity-70 border-b border-luxury-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <img 
            src="/logo.jpg" 
            alt="Brotherhood Logo" 
            className="w-9 h-9 rounded-full border border-luxury-gold border-opacity-50 object-cover shadow-goldGlow transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-wider text-gold-gradient font-serif leading-none">
              BROTHERHOOD
            </span>
            <span className="text-[8px] uppercase tracking-[0.32em] font-bold text-gray-400 mt-1">
              CLOTHING
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
          <Link 
            to="/" 
            className={`hover:text-luxury-gold transition-colors ${isActive('/') ? 'text-luxury-gold border-b-2 border-luxury-gold py-1' : 'text-gray-300'}`}
          >
            Home
          </Link>
          <Link 
            to="/marketplace" 
            className={`hover:text-luxury-gold transition-colors ${isActive('/marketplace') ? 'text-luxury-gold border-b-2 border-luxury-gold py-1' : 'text-gray-300'}`}
          >
            Marketplace
          </Link>
          <Link 
            to="/ai-stylist" 
            className={`hover:text-luxury-gold transition-colors ${isActive('/ai-stylist') ? 'text-luxury-gold border-b-2 border-luxury-gold py-1' : 'text-gray-300'}`}
          >
            AI Stylist
          </Link>
          {(!isAuthenticated || (user && user.role === 'customer')) && (
            <Link 
              to="/register-shop" 
              className={`hover:text-luxury-gold transition-colors ${isActive('/register-shop') ? 'text-luxury-gold border-b-2 border-luxury-gold py-1' : 'text-gray-300'}`}
            >
              Register Shop
            </Link>
          )}
          {isAuthenticated && (
            <Link 
              to="/dashboard" 
              className={`hover:text-luxury-gold transition-colors ${isActive('/dashboard') || isActive('/customer-dashboard') || isActive('/vendor-dashboard') || isActive('/admin') ? 'text-luxury-gold border-b-2 border-luxury-gold py-1' : 'text-gray-300'}`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* SEARCH & ACTIONS */}
        <div className="hidden lg:flex items-center space-x-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search premium shops..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="bg-luxury-purpleDeep bg-opacity-40 border border-luxury-border border-opacity-35 rounded-full pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-luxury-gold transition-all duration-300 w-60 text-white placeholder-gray-400"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </form>
        </div>

        {/* RIGHT AREA: CART, NOTIFICATIONS & AUTH */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* SHOPPING CART */}
          <Link 
            to="/cart"
            className="relative p-2 rounded-full hover:bg-luxury-purpleMid transition-colors"
          >
            <ShoppingBag className="w-5 h-5 text-gray-300 hover:text-luxury-gold" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-luxury-gold text-black text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              {/* NOTIFICATIONS */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full hover:bg-luxury-purpleMid transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-300 hover:text-luxury-gold" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-luxury-gold text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 mt-3 w-80 glass-panel rounded-xl overflow-hidden shadow-glass border border-luxury-border z-50"
                    >
                      <div className="px-4 py-3 border-b border-luxury-border flex justify-between items-center bg-luxury-purpleMid bg-opacity-30">
                        <span className="text-xs font-semibold tracking-wider text-luxury-gold">NOTIFICATIONS</span>
                        {unreadCount > 0 && <span className="text-[10px] text-gray-400">{unreadCount} unread</span>}
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-500">No notifications yet.</div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => markAsRead(n.id)}
                              className={`p-3 border-b border-luxury-border border-opacity-40 cursor-pointer transition-colors ${n.is_read ? 'bg-transparent' : 'bg-luxury-purpleMid bg-opacity-10 hover:bg-opacity-25'}`}
                            >
                              <div className="flex justify-between items-start">
                                <span className={`text-xs font-semibold ${n.is_read ? 'text-gray-300' : 'text-luxury-gold'}`}>{n.title}</span>
                                {!n.is_read && <span className="w-1.5 h-1.5 bg-luxury-gold rounded-full"></span>}
                              </div>
                              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{n.message}</p>
                              <span className="text-[9px] text-gray-500 mt-1 block">
                                {new Date(n.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* USER PROFILE DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img 
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'} 
                    alt={user?.name}
                    className="w-10 h-10 rounded-full border border-luxury-gold object-cover hover:brightness-110 transition-all"
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-56 glass-panel rounded-xl shadow-glass border border-luxury-border overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-luxury-border bg-luxury-purpleMid bg-opacity-20">
                        <p className="text-xs font-semibold text-luxury-gold tracking-wide truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                        <div className="mt-1 flex items-center space-x-1">
                          <span className="text-[9px] bg-luxury-purpleLight px-1.5 py-0.5 rounded text-gray-300 font-bold uppercase">
                            {user?.role}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link 
                          to={getDashboardLink()}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-xs text-gray-300 hover:bg-luxury-purpleMid hover:text-white transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2 text-luxury-gold" />
                          Dashboard
                        </Link>
                        {user?.role === 'owner' && (
                          <Link 
                            to="/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs text-gray-300 hover:bg-luxury-purpleMid hover:text-white transition-colors"
                          >
                            <Store className="w-4 h-4 mr-2 text-luxury-gold" />
                            My Shop Profile
                          </Link>
                        )}
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-xs text-red-400 hover:bg-luxury-purpleMid hover:text-red-300 transition-colors border-t border-luxury-border border-opacity-40"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link 
              to="/login"
              className="btn-gold-metallic text-xs font-semibold tracking-wider uppercase px-5 py-2.5"
            >
              Login
            </Link>
          )}

          {/* MOBILE MENU BUTTON */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-luxury-purpleMid text-gray-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-luxury-purpleDeep border-t border-luxury-border overflow-hidden"
          >
            <div className="px-4 pt-3 pb-4 space-y-3">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'text-luxury-gold bg-luxury-purpleMid' : 'text-gray-300'}`}
              >
                Home
              </Link>
              <Link 
                to="/marketplace" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/marketplace') ? 'text-luxury-gold bg-luxury-purpleMid' : 'text-gray-300'}`}
              >
                Marketplace
              </Link>
              <Link 
                to="/ai-stylist" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/ai-stylist') ? 'text-luxury-gold bg-luxury-purpleMid' : 'text-gray-300'}`}
              >
                AI Stylist
              </Link>
              {(!isAuthenticated || (user && user.role === 'customer')) && (
                <Link 
                  to="/register-shop" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/register-shop') ? 'text-luxury-gold bg-luxury-purpleMid' : 'text-gray-300'}`}
                >
                  Register Shop
                </Link>
              )}
              {isAuthenticated && (
                <Link 
                  to="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard') || isActive('/customer-dashboard') || isActive('/vendor-dashboard') || isActive('/admin') ? 'text-luxury-gold bg-luxury-purpleMid' : 'text-gray-300'}`}
                >
                  Dashboard
                </Link>
              )}

              <form onSubmit={handleSearchSubmit} className="relative pt-2 px-3">
                <input
                  type="text"
                  placeholder="Search premium shops..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full bg-luxury-black bg-opacity-70 border border-luxury-border rounded-full pl-10 pr-4 py-2.5 text-sm text-white"
                />
                <Search className="absolute left-6 top-5 w-4 h-4 text-gray-400" />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
