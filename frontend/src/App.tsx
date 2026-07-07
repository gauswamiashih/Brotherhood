import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
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
              {/* Fallback route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
