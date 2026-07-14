import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { motion } from 'framer-motion';
import { CinematicIntro } from './components/CinematicIntro';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { ShopProfile } from './pages/ShopProfile';
import { RegisterShop } from './pages/RegisterShop';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { DashboardRouter } from './components/DashboardRouter';
import { Login } from './pages/Login';
import { Cart } from './pages/Cart';
import { ChatInbox } from './pages/ChatInbox';
import { AiStylist } from './pages/AiStylist';
import { FutureVision } from './pages/FutureVision';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(() => {
    // Force play if URL has ?intro=true
    if (window.location.search.includes('intro=true')) {
      return true;
    }
    // Always show intro on localhost/local IP for easy visual inspection
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return true;
    }
    const lastPlayed = localStorage.getItem('brotherhood_intro_played');
    if (lastPlayed) {
      const parsedTime = parseInt(lastPlayed, 10);
      if (Date.now() - parsedTime < 24 * 60 * 60 * 1000) {
        return false;
      }
    }
    return true;
  });

  return (
    <AuthProvider>
      {showIntro && <CinematicIntro onComplete={() => setShowIntro(false)} />}
      
      <Router>
        <motion.div
          initial={showIntro ? { opacity: 0, scale: 0.96, filter: 'blur(12px)' } : false}
          animate={!showIntro ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col min-h-screen"
        >
          {/* Header */}
          <Header />

          {/* Main Layout Area */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/shops/:id" element={<ShopProfile />} />
              <Route path="/register-shop" element={<RegisterShop />} />
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/vendor-dashboard" element={<OwnerDashboard />} />
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/inbox" element={<ChatInbox />} />
              <Route path="/ai-stylist" element={<AiStylist />} />
              <Route path="/future-vision" element={<FutureVision />} />
              {/* Fallback route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </motion.div>
      </Router>
    </AuthProvider>
  );
};

export default App;
