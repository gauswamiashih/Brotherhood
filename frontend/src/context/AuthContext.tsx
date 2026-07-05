import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'customer' | 'owner' | 'admin';
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  shop_id: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: (credential: string, role?: string) => Promise<User>;
  simulateAuth: (email: string, role?: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  
  // Shopping Cart State
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Initialize Auth & Cart State from LocalStorage
  const checkAuth = async () => {
    const savedToken = localStorage.getItem('brotherhood_token');
    const savedUser = localStorage.getItem('brotherhood_user');
    const savedCart = localStorage.getItem('brotherhood_cart');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('brotherhood_cart', JSON.stringify(cart));
  }, [cart]);

  const refreshUser = async () => {
    try {
      const savedUser = localStorage.getItem('brotherhood_user');
      if (savedUser) {
        // Refresh local details check
        const res = await api.get('/shops/my/profile').catch(() => null);
        if (res && res.data) {
          // Sync owner settings if exists
        }
      }
    } catch (err) {
      console.warn("Failed to sync profile");
    }
  };

  const loginWithGoogle = async (credential: string, role?: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { credential, role });
      const { token: serverToken, user: serverUser } = res.data;

      localStorage.setItem('brotherhood_token', serverToken);
      localStorage.setItem('brotherhood_user', JSON.stringify(serverUser));
      
      setToken(serverToken);
      setUser(serverUser);
      return serverUser;
    } catch (error: any) {
      console.error('Google Auth exchange failed:', error);
      throw new Error(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const simulateAuth = async (email: string, role?: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { credential: email, role });
      const { token: serverToken, user: serverUser } = res.data;

      localStorage.setItem('brotherhood_token', serverToken);
      localStorage.setItem('brotherhood_user', JSON.stringify(serverUser));
      
      setToken(serverToken);
      setUser(serverUser);
      return serverUser;
    } catch (error: any) {
      console.error('Simulation login failed:', error);
      throw new Error(error.response?.data?.error || 'Simulated login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('brotherhood_token');
    localStorage.removeItem('brotherhood_user');
    localStorage.removeItem('brotherhood_cart');
    setToken(null);
    setUser(null);
    setCart([]);
  };

  // Cart Management
  const addToCart = (product: any, quantity = 1) => {
    setCart((prev) => {
      // Find if item already exists
      const existing = prev.find((item) => item.id === product.id);
      
      // Strict rule: cart can only contain items from ONE shop at a time to prevent multi-vendor order routing errors,
      // OR we allow multi-shop checkout but segment the orders. Let's warn/empty or support single-store shopping:
      const diffStoreItem = prev.find((item) => item.shop_id !== product.shop_id);
      if (diffStoreItem) {
        // Empty previous cart and start fresh from the new shop
        alert(`Your cart contained items from "${diffStoreItem.shop_id === 's2' ? 'Couture Palanpur' : 'a different boutique'}". We have updated your cart to items from the new boutique.`);
        return [{
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity,
          image_url: product.image_url,
          shop_id: product.shop_id,
        }];
      }

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity,
        image_url: product.image_url,
        shop_id: product.shop_id,
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin' && user?.email === 'gauswamiashish760@gmail.com';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      loginWithGoogle,
      simulateAuth,
      logout,
      isAuthenticated,
      isAdmin,
      refreshUser,
      
      // Cart Exports
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
