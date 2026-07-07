import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, CreditCard, ShieldCheck, ShoppingBag, ArrowLeft, ClipboardCheck } from 'lucide-react';

export const Cart: React.FC = () => {
  const { 
    cart, 
    cartTotal, 
    cartCount, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    isAuthenticated,
    user 
  } = useAuth();
  
  const navigate = useNavigate();

  const [checkoutForm, setCheckoutForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    customerAddress: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Simulated Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [mockCard, setMockCard] = useState({
    number: '4111 2222 3333 4444',
    expiry: '12/28',
    cvv: '123'
  });

  const handleSimulatedPayment = async () => {
    if (!pendingOrder) return;
    setPaymentLoading(true);
    setError('');
    try {
      const res = await api.post(`/orders/${pendingOrder.id}/pay`);
      setOrderSuccess(res.data);
      setShowPaymentModal(false);
      clearCart();
    } catch (err: any) {
      console.error('Payment simulation failed:', err);
      setError(err.response?.data?.error || 'Simulated payment processing failed.');
      setShowPaymentModal(false);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleQtyChange = (itemId: string, currentQty: number, offset: number) => {
    updateCartQuantity(itemId, currentQty + offset);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (cart.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        shopId: cart[0].shop_id,
        customerName: checkoutForm.customerName,
        customerEmail: checkoutForm.customerEmail,
        customerPhone: checkoutForm.customerPhone,
        customerAddress: checkoutForm.customerAddress,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice: cartTotal
      };

      const res = await api.post('/orders', payload);
      setPendingOrder(res.data);
      setShowPaymentModal(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit order. Check input fields.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 sm:p-12 rounded-2xl border border-luxury-gold border-opacity-35 text-center space-y-6 shadow-goldGlow"
        >
          <div className="w-16 h-16 rounded-full bg-luxury-gold bg-opacity-10 border border-luxury-gold flex items-center justify-center mx-auto">
            <ClipboardCheck className="w-8 h-8 text-luxury-gold" />
          </div>
          <h2 className="text-3xl font-extrabold font-serif text-white tracking-wide">Inquiry Placed Successfully</h2>
          <div className="text-xs text-luxury-gold uppercase tracking-widest font-bold">ORDER REF: #{orderSuccess.id.substring(0, 8).toUpperCase()}</div>
          <p className="text-sm text-gray-400 font-light leading-relaxed max-w-md mx-auto">
            Your premium purchase request for <strong>₹{Number(orderSuccess.total_price).toLocaleString()}</strong> has been submitted. The boutique owner will review your address, verify stock limits, and contact you via phone or email shortly to confirm delivery schedules.
          </p>
          <div className="pt-6 border-t border-luxury-border border-opacity-35 max-w-sm mx-auto text-left space-y-2 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Customer Name:</span>
              <span className="text-white font-semibold">{orderSuccess.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Contact Phone:</span>
              <span className="text-white font-semibold">{orderSuccess.customer_phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Inquiry Status:</span>
              <span className="text-luxury-gold font-bold uppercase">{orderSuccess.status}</span>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace" className="btn-gold-metallic text-xs font-semibold px-6 py-3 uppercase tracking-wider">
              Browse More Collections
            </Link>
            <Link to="/dashboard" className="btn-gold-outline text-xs font-semibold px-6 py-3 uppercase tracking-wider">
              Check Order Status
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <ShoppingBag className="w-16 h-16 text-luxury-gold mx-auto opacity-50" />
        <h2 className="text-2xl font-bold text-white font-serif">Your Bag is Empty</h2>
        <p className="text-gray-400 text-sm font-light">Explore boutiques or products across Palanpur to add items to your couture bag.</p>
        <div className="pt-4">
          <Link to="/marketplace" className="btn-gold-metallic text-xs font-bold uppercase tracking-wider px-6 py-3">
            Go to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      
      <div className="mb-10 flex items-center space-x-2">
        <Link to="/marketplace" className="text-xs text-gray-400 hover:text-white flex items-center uppercase font-bold tracking-wider">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Continue Shopping
        </Link>
      </div>

      <h1 className="text-3xl font-extrabold font-serif text-white tracking-wide mb-10">YOUR COUTURE BAG</h1>

      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-35 rounded-xl p-4 text-sm text-red-400 mb-8 max-w-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Cart Items List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-luxury-border space-y-6">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-luxury-border border-opacity-30 pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-20 h-24 rounded object-cover border border-luxury-border shadow shrink-0"
                  />
                  <div className="text-center sm:text-left space-y-1">
                    <h3 className="font-semibold text-sm text-white">{item.name}</h3>
                    <p className="text-[10px] text-gray-500">Premium Outlet Boutique</p>
                    <span className="text-xs text-luxury-gold font-bold block">₹{Number(item.price).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-luxury-border rounded-full p-1 bg-luxury-black bg-opacity-55">
                    <button 
                      onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                      className="p-1 hover:text-luxury-gold transition-colors text-gray-400"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs text-white font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                      className="p-1 hover:text-luxury-gold transition-colors text-gray-400"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Delete button */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 border border-red-500 border-opacity-10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Checkout Form & Totals */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Order Summary Card */}
          <div className="glass-panel p-6 rounded-xl border border-luxury-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-gold border-b border-luxury-border border-opacity-35 pb-2">Order summary</h3>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} items):</span>
                <span className="text-white font-semibold">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Fulfillment & Handling:</span>
                <span className="text-green-400 font-semibold uppercase tracking-wider text-[10px]">Free Delivery</span>
              </div>
              <div className="border-t border-luxury-border border-opacity-30 pt-3 flex justify-between text-sm font-extrabold text-white">
                <span>Total:</span>
                <span className="text-luxury-gold">₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Shipping Form */}
          <div className="glass-panel p-6 rounded-xl border border-luxury-border space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-gold border-b border-luxury-border border-opacity-35 pb-2">Fulfillment Details</h3>
            
            {!isAuthenticated ? (
              <div className="text-center py-4 space-y-4">
                <p className="text-xs text-gray-400">Please sign in to complete your checkout inquiries.</p>
                <Link to="/login?redirect=/cart" className="btn-gold-metallic text-xs font-semibold px-6 py-2.5 uppercase tracking-wider block">
                  Login & Proceed
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-semibold uppercase">Contact Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={checkoutForm.customerName}
                    onChange={handleInputChange}
                    className="luxury-input py-2 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-semibold uppercase">Contact Phone</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    placeholder="e.g. 9664592743"
                    value={checkoutForm.customerPhone}
                    onChange={handleInputChange}
                    className="luxury-input py-2 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-semibold uppercase">Email (For Invoice Copy)</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={checkoutForm.customerEmail}
                    onChange={handleInputChange}
                    className="luxury-input py-2 text-xs opacity-75 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-semibold uppercase">Delivery Address</label>
                  <textarea
                    name="customerAddress"
                    rows={3}
                    placeholder="Provide detailed shipping coordinates in Palanpur..."
                    value={checkoutForm.customerAddress}
                    onChange={handleInputChange}
                    className="luxury-input text-xs resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold-metallic w-full py-3.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  {loading ? 'Processing Checkout...' : 'Submit Inquiry & Place Order'}
                </button>
              </form>
            )}
          </div>

          <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-500">
            <ShieldCheck className="w-4 h-4 text-luxury-gold" />
            <span>Secure connection & guaranteed boutique delivery.</span>
          </div>

        </div>

      </div>

      {/* SIMULATED PAYMENT MODAL */}
      {showPaymentModal && pendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md p-6 rounded-2xl border border-luxury-gold shadow-goldGlow space-y-6 bg-[#090214] bg-opacity-95 animate-fadeIn"
          >
            <div className="text-center space-y-2 border-b border-luxury-border border-opacity-35 pb-4">
              <h3 className="text-lg font-bold font-serif text-white tracking-wide">RAZORPAY VIRTUAL CHECKOUT</h3>
              <p className="text-xs text-luxury-gold font-bold uppercase tracking-widest">Sandbox Payment Simulator</p>
            </div>

            {/* Price display */}
            <div className="bg-luxury-purpleDeep bg-opacity-25 border border-luxury-border border-opacity-40 p-4 rounded-xl flex justify-between items-center text-xs">
              <span className="text-gray-400">Total Payable Amount:</span>
              <span className="text-base font-extrabold text-luxury-gold">₹{Number(pendingOrder.total_price).toLocaleString()}</span>
            </div>

            {/* Simulated Credit Card graphics */}
            <div className="bg-gradient-to-br from-luxury-purpleMid to-[#090214] p-5 rounded-xl border border-luxury-gold border-opacity-25 text-xs text-gray-300 relative space-y-8 shadow shadow-goldGlow">
              <div className="flex justify-between items-start">
                <span className="font-bold text-[10px] text-luxury-gold uppercase tracking-widest">Couture Elite Card</span>
                <span className="font-mono text-gray-500">VISA / RUPAY</span>
              </div>
              <div className="font-mono text-base tracking-widest text-white">{mockCard.number}</div>
              <div className="flex justify-between items-center text-[10px]">
                <div>
                  <span className="text-gray-500 uppercase block text-[8px] mb-0.5">Card Holder</span>
                  <span className="text-white font-semibold">{pendingOrder.customer_name}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase block text-[8px] mb-0.5">Expires</span>
                  <span className="text-white font-semibold">{mockCard.expiry}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase block text-[8px] mb-0.5">CVV</span>
                  <span className="text-white font-semibold">***</span>
                </div>
              </div>
            </div>

            {/* Input fields to allow typing card detail simulation */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-semibold">Card Number</label>
                <input
                  type="text"
                  value={mockCard.number}
                  onChange={(e) => setMockCard({ ...mockCard, number: e.target.value })}
                  className="luxury-input py-2 text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-semibold">Expiry Date</label>
                  <input
                    type="text"
                    value={mockCard.expiry}
                    onChange={(e) => setMockCard({ ...mockCard, expiry: e.target.value })}
                    className="luxury-input py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-semibold">CVV</label>
                  <input
                    type="password"
                    maxLength={3}
                    value={mockCard.cvv}
                    onChange={(e) => setMockCard({ ...mockCard, cvv: e.target.value })}
                    className="luxury-input py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleSimulatedPayment}
                disabled={paymentLoading}
                className="w-full bg-luxury-gold hover:bg-opacity-90 text-black py-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow-goldGlow transition-colors"
              >
                {paymentLoading ? 'Processing Sandbox Payment...' : 'Pay (Simulate Success)'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false);
                  setOrderSuccess(pendingOrder); // Still show order success but status remains pending
                  clearCart();
                }}
                className="w-full bg-[#090214] hover:bg-luxury-purpleDeep border border-luxury-border border-opacity-40 text-gray-400 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel & Pay Later
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
