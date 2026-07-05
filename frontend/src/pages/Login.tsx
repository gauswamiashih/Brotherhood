import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, User, Store } from 'lucide-react';

export const Login: React.FC = () => {
  const { isAuthenticated, loginWithGoogle, simulateAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [selectedRole, setSelectedRole] = useState<'customer' | 'owner'>('customer');
  const [devEmail, setDevEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect to router, else check search parameters for errors
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath);
    } else {
      const queryError = searchParams.get('error');
      const sessionExpired = searchParams.get('session_expired');
      if (queryError) {
        setError(queryError);
      } else if (sessionExpired) {
        setError('Your login session has expired. Please sign in again.');
      }
    }
  }, [isAuthenticated, navigate, redirectPath, searchParams]);

  // Google Login GIS setup
  useEffect(() => {
    if (!isAuthenticated && (window as any).google) {
      const renderGoogleBtn = () => {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '',
            callback: async (response: any) => {
              setLoading(true);
              setError('');
              try {
                // Pass selected role for new user registration
                await loginWithGoogle(response.credential, selectedRole);
              } catch (err: any) {
                setError(err.message || 'Google Auth verification failed.');
              } finally {
                setLoading(false);
              }
            }
          });

          (window as any).google.accounts.id.renderButton(
            document.getElementById('google-btn-login'),
            { theme: 'dark', size: 'large', width: '320' }
          );
        } catch (err) {
          console.warn("Google SSO render element skipped: missing configuration or window elements");
        }
      };
      
      const t = setTimeout(renderGoogleBtn, 300);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, selectedRole]);

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devEmail.trim() || !devEmail.includes('@')) {
      setError('Please enter a valid developer email format.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await simulateAuth(devEmail.trim().toLowerCase(), selectedRole);
    } catch (err: any) {
      setError(err.message || 'Developer login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 min-h-[85vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel w-full p-8 sm:p-10 rounded-2xl border border-luxury-border shadow-glass space-y-8"
      >
        <div className="text-center space-y-3">
          <img 
            src="/logo.jpg" 
            alt="Brotherhood Logo" 
            className="w-16 h-16 rounded-full border border-luxury-gold object-cover mx-auto shadow-goldGlow"
          />
          <h2 className="text-3xl font-extrabold font-serif tracking-wide text-white">PORTAL SIGN IN</h2>
          <p className="text-xs text-luxury-gold font-bold uppercase tracking-widest">Brotherhood Premium Marketplace</p>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-35 rounded-xl p-3 flex items-start space-x-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ROLE SELECTION TABS */}
        <div className="space-y-2">
          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center block">
            Select Account Role
          </label>
          <div className="grid grid-cols-2 gap-2 bg-luxury-purpleDeep bg-opacity-30 p-1 rounded-xl border border-luxury-border border-opacity-30">
            <button
              onClick={() => setSelectedRole('customer')}
              className={`py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'customer' 
                  ? 'bg-luxury-gold text-black shadow-goldGlow' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Customer
            </button>
            <button
              onClick={() => setSelectedRole('owner')}
              className={`py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'owner' 
                  ? 'bg-luxury-gold text-black shadow-goldGlow' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              Shop Owner
            </button>
          </div>

          <p className="text-[10.5px] text-gray-400 text-center font-light leading-relaxed pt-2 px-1">
            {selectedRole === 'customer' 
              ? "Instantly register to browse premium Palanpur boutiques, add couture items to your cart, and track shipment status."
              : "Register your boutique profile, display gallery lookbooks, manage active catalog items, and receive client order inquiries."}
          </p>
        </div>

        {/* Standard Google Login Button target */}
        <div className="flex flex-col items-center justify-center space-y-3 py-2 border-t border-luxury-border border-opacity-20 pt-6">
          <div id="google-btn-login"></div>
          <p className="text-[9px] text-gray-500">Sign in securely with your Google SSO ID token</p>
        </div>

        {/* Local Developer Simulation panel */}
        <div className="border-t border-luxury-border border-opacity-35 pt-6 text-center space-y-4">
          <div>
            <h4 className="text-xs font-bold text-luxury-gold uppercase tracking-wider">Developer Sandbox Mode</h4>
            <p className="text-[9px] text-gray-400 mt-1">Bypasses external OAuth credentials for rapid prototyping and local review.</p>
          </div>

          <form onSubmit={handleDevLogin} className="space-y-3 text-left">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Test Email Address</label>
              <input
                type="email"
                placeholder="e.g. customer@test.com"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                className="w-full bg-luxury-black bg-opacity-60 border border-luxury-border border-opacity-40 rounded-lg px-3 py-2 text-xs text-white focus:border-luxury-gold focus:outline-none transition-all"
                required
              />
              <p className="text-[9px] text-gray-500 mt-1">
                Tip: Enter <strong>gauswamiashish760@gmail.com</strong> to simulate Founder Admin access.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-luxury-purpleLight hover:bg-luxury-purpleMid border border-luxury-border text-xs font-bold uppercase tracking-wider text-luxury-gold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Processing Bypass Login...' : `Enter Sandbox as ${selectedRole.toUpperCase()}`}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
