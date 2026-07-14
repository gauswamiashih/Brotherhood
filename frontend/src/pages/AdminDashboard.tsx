import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Store, 
  CheckCircle, Trash2, 
  BadgeCheck, Award, FileText, Activity,
  CreditCard, BarChart3, Search, SlidersHorizontal, Eye, X,
  Mail, RefreshCw, Play
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'shops' | 'users' | 'orders' | 'activity' | 'adminLogs' | 'emailHub'>('shops');
  
  // Data states
  const [shops, setShops] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email Hub specific states
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [emailSettings, setEmailSettings] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [emailSearch, setEmailSearch] = useState('');
  const [emailFilter, setEmailFilter] = useState('All');
  const [emailHubSubTab, setEmailHubSubTab] = useState<'logs' | 'settings' | 'templates' | 'contact'>('logs');
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [replyMessageId, setReplyMessageId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Fetch email-specific settings/logs
  const fetchEmailHubData = async () => {
    try {
      const logsRes = await api.get('/admin/email/logs');
      setEmailLogs(logsRes.data);

      const settingsRes = await api.get('/admin/email/settings');
      setEmailSettings(settingsRes.data);

      const contactRes = await api.get('/admin/contact/messages');
      setContactMessages(contactRes.data);
    } catch (err) {
      console.error('Failed to fetch email hub details', err);
    }
  };

  // Customer Management Filter States
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verifyFilter, setVerifyFilter] = useState('All');
  const [userSort, setUserSort] = useState('newest');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const shopsRes = await api.get('/admin/shops');
      setShops(shopsRes.data);

      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);

      const analyticsRes = await api.get('/admin/analytics');
      setStats(analyticsRes.data.stats);
      setActivities(analyticsRes.data.activities);
      setAdminLogs(analyticsRes.data.adminLogs);

      const mockOrdersListRes = await api.get('/orders/shop').catch(() => ({ data: [] }));
      setOrders(mockOrdersListRes.data);

      // Fetch Email Hub details
      await fetchEmailHubData();
    } catch (err: any) {
      console.error('Failed to load admin dashboard details', err);
      setError('Unauthorized access or connection error. Admin verification failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, [isAuthenticated, isAdmin]);

  const handleUpdateStatus = async (shopId: string, status: 'approved' | 'rejected' | 'blocked') => {
    setActionLoading(shopId + '-status');
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/admin/shops/${shopId}/status`, { status });
      setShops(prev => 
        prev.map(s => s.id === shopId ? { ...s, status: res.data.status } : s)
      );
      setSuccess(`Successfully updated shop status to: ${status.toUpperCase()}`);
      
      const analyticsRes = await api.get('/admin/analytics');
      setStats(analyticsRes.data.stats);
      setActivities(analyticsRes.data.activities);
      setAdminLogs(analyticsRes.data.adminLogs);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update shop status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerify = async (shopId: string) => {
    setActionLoading(shopId + '-verify');
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/admin/shops/${shopId}/verify`);
      setShops(prev => 
        prev.map(s => s.id === shopId ? { ...s, is_verified: res.data.is_verified } : s)
      );
      setSuccess(res.data.is_verified ? 'Verified badge assigned!' : 'Verified badge removed.');
      
      const analyticsRes = await api.get('/admin/analytics');
      setAdminLogs(analyticsRes.data.adminLogs);
    } catch (err: any) {
      setError('Failed to update verification status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFounder = async (shopId: string) => {
    setActionLoading(shopId + '-founder');
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/admin/shops/${shopId}/founder`);
      setShops(prev => 
        prev.map(s => s.id === shopId ? { ...s, is_founder: res.data.is_founder } : s)
      );
      setSuccess(res.data.is_founder ? 'Founder Flagship status enabled!' : 'Founder Flagship disabled.');
      
      const analyticsRes = await api.get('/admin/analytics');
      setAdminLogs(analyticsRes.data.adminLogs);
    } catch (err: any) {
      setError('Failed to toggle founder status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (!window.confirm('WARNING: Permanently delete this boutique? All settings, gallery, and followers will be deleted.')) return;
    setActionLoading(shopId + '-delete');
    setError('');
    setSuccess('');
    try {
      const res = await api.delete(`/admin/shops/${shopId}`);
      setShops(prev => prev.filter(s => s.id !== shopId));
      setSuccess(res.data.message || 'Boutique deleted.');
      
      const analyticsRes = await api.get('/admin/analytics');
      setStats(analyticsRes.data.stats);
      setActivities(analyticsRes.data.activities);
      setAdminLogs(analyticsRes.data.adminLogs);
    } catch (err: any) {
      setError('Failed to delete boutique');
    } finally {
      setActionLoading(null);
    }
  };

  // User Actions: status update & verification toggles
  const handleToggleUserVerify = async (userId: string) => {
    setActionLoading(userId + '-user-verify');
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/admin/users/${userId}/verify`);
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, is_verified: res.data.is_verified } : u)
      );
      if (selectedCustomer && selectedCustomer.id === userId) {
        setSelectedCustomer((prev: any) => ({ ...prev, is_verified: res.data.is_verified }));
      }
      setSuccess(res.data.is_verified ? 'User verified!' : 'User verification removed.');
      
      const analyticsRes = await api.get('/admin/analytics');
      setAdminLogs(analyticsRes.data.adminLogs);
    } catch (err: any) {
      setError('Failed to toggle user verification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: 'active' | 'suspended' | 'blocked') => {
    setActionLoading(userId + '-user-status');
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status });
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, status: res.data.status } : u)
      );
      if (selectedCustomer && selectedCustomer.id === userId) {
        setSelectedCustomer((prev: any) => ({ ...prev, status: res.data.status }));
      }
      setSuccess(`User status updated to ${status.toUpperCase()}`);
      
      const analyticsRes = await api.get('/admin/analytics');
      setAdminLogs(analyticsRes.data.adminLogs);
    } catch (err: any) {
      setError('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered Users List
  const filteredUsers = users
    .filter((u) => {
      const matchesSearch = 
        u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      
      let matchesVerify = true;
      if (verifyFilter === 'Verified') matchesVerify = u.is_verified;
      else if (verifyFilter === 'Unverified') matchesVerify = !u.is_verified;

      return matchesSearch && matchesRole && matchesStatus && matchesVerify;
    })
    .sort((a, b) => {
      if (userSort === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const totalGrossRevenue = shops.length * 12500 + orders.length * 5499;

  const handleUpdateEmailSettings = async (updatedSettings: any) => {
    try {
      setActionLoading('settings');
      const res = await api.put('/admin/email/settings', updatedSettings);
      setEmailSettings(res.data);
      setSuccess('Email provider configurations updated successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update configurations.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTriggerCron = async (reportType: string) => {
    try {
      setSuccess(`Simulating ${reportType} scheduler thread...`);
      const res = await api.post('/admin/email/test-cron', { reportType });
      setSuccess(res.data.message || 'Simulated cron complete.');
      await fetchEmailHubData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to trigger simulated cron.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleResendEmail = async (id: string) => {
    try {
      setSuccess('Re-queueing email for immediate dispatch...');
      const res = await api.post(`/admin/email/logs/${id}/resend`);
      setSuccess(res.data.message || 'Resend triggered.');
      await fetchEmailHubData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to trigger resend.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleReplyContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessageId || !replyContent.trim()) return;
    try {
      setSuccess('Sending reply email to client...');
      await api.post(`/admin/contact/messages/${replyMessageId}/reply`, { replyContent });
      setSuccess('Reply sent and client email notification queued.');
      setReplyMessageId(null);
      setReplyContent('');
      await fetchEmailHubData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reply.');
      setTimeout(() => setError(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen">
        <div className="h-44 glass-panel shimmer rounded-xl mb-8"></div>
        <div className="h-96 glass-panel shimmer rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Dashboard Title */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 border-b border-luxury-border border-opacity-40 pb-6">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <ShieldCheck className="w-8 h-8 text-luxury-gold shrink-0" />
          <div>
            <h1 className="text-3xl font-extrabold font-serif text-white tracking-wide">ADMINISTRATOR CONTROL CENTER</h1>
            <p className="text-[10px] text-luxury-gold uppercase tracking-[0.2em] font-bold">Founder System Audits & Shop Approvals</p>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-light">
          Welcome back, <span className="text-luxury-gold font-bold">{user?.name}</span>
        </div>
      </div>

      {/* Success / Error Banners */}
      {success && (
        <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-35 rounded-xl p-4 text-xs text-green-400 mb-8 max-w-xl">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-35 rounded-xl p-4 text-xs text-red-400 mb-8 max-w-xl">
          {error}
        </div>
      )}

      {/* Stats Board */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass-panel p-5 rounded-xl border border-luxury-border flex items-center justify-between">
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Total Accounts</p>
              <h4 className="text-2xl font-extrabold text-white mt-1">{stats.totalUsers}</h4>
            </div>
            <Users className="w-8 h-8 text-luxury-gold opacity-30" />
          </div>
          <div className="glass-panel p-5 rounded-xl border border-luxury-border flex items-center justify-between">
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Boutiques</p>
              <h4 className="text-2xl font-extrabold text-white mt-1">{stats.totalShops}</h4>
              <p className="text-[8px] text-luxury-gold mt-1">
                {stats.statusCounts.pending} Pending | {stats.statusCounts.approved} Live
              </p>
            </div>
            <Store className="w-8 h-8 text-luxury-gold opacity-30" />
          </div>
          <div className="glass-panel p-5 rounded-xl border border-luxury-border flex items-center justify-between">
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Gross Platform Revenue</p>
              <h4 className="text-2xl font-extrabold text-luxury-gold mt-1">₹{totalGrossRevenue.toLocaleString()}</h4>
            </div>
            <BarChart3 className="w-8 h-8 text-luxury-gold opacity-30" />
          </div>
          <div className="glass-panel p-5 rounded-xl border border-luxury-border flex items-center justify-between">
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Followers Connections</p>
              <h4 className="text-2xl font-extrabold text-white mt-1">{stats.totalFollowers}</h4>
            </div>
            <CheckCircle className="w-8 h-8 text-luxury-gold opacity-30" />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-luxury-border border-opacity-35 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => setActiveTab('shops')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'shops' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4 inline mr-1.5" />
          Shop Approvals ({shops.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'users' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1.5" />
          Customer & User Manager ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'orders' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 inline mr-1.5" />
          Transaction Logs ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'activity' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 inline mr-1.5" />
          Activity Logs ({activities.length})
        </button>
        <button
          onClick={() => setActiveTab('adminLogs')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'adminLogs' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1.5" />
          Admin Audits ({adminLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('emailHub')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'emailHub' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4 inline mr-1.5" />
          Email Hub & Inbox
        </button>
      </div>

      {/* Content Panels */}
      <div>
        <AnimatePresence mode="wait">
          
          {/* 1. SHOP MANAGEMENT */}
          {activeTab === 'shops' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="glass-panel rounded-xl border border-luxury-border overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-luxury-purpleDeep bg-opacity-40 border-b border-luxury-border border-opacity-40 text-luxury-gold uppercase tracking-wider font-bold">
                      <th className="p-4">Boutique</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Owner Email</th>
                      <th className="p-4">City</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Badges</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shops.map((shop) => (
                      <tr 
                        key={shop.id}
                        className="border-b border-luxury-border border-opacity-25 hover:bg-luxury-purpleDeep hover:bg-opacity-10 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={shop.logo_url || 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=80&h=80&q=80'} 
                              alt={shop.name}
                              className="w-10 h-10 rounded object-cover border border-luxury-border"
                            />
                            <div>
                              <h4 className="font-semibold text-white">{shop.name}</h4>
                              <p className="text-[10px] text-gray-500 font-light">Owner: {shop.owner_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 font-medium">{shop.category}</td>
                        <td className="p-4 text-gray-400 font-light">{shop.owner_email}</td>
                        <td className="p-4 text-gray-400">{shop.city}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[9px] uppercase font-bold tracking-wider ${
                            shop.status === 'approved' 
                              ? 'bg-green-500 bg-opacity-10 text-green-400 border border-green-500 border-opacity-20'
                              : shop.status === 'blocked'
                              ? 'bg-red-500 bg-opacity-10 text-red-400 border border-red-500 border-opacity-20'
                              : 'bg-yellow-500 bg-opacity-10 text-yellow-400 border border-yellow-500 border-opacity-20'
                          }`}>
                            {shop.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleVerify(shop.id)}
                              disabled={actionLoading === shop.id + '-verify'}
                              className={`p-1 rounded border transition-colors ${
                                shop.is_verified 
                                  ? 'bg-luxury-gold bg-opacity-10 border-luxury-gold text-luxury-gold' 
                                  : 'border-luxury-border text-gray-500 hover:text-white'
                              }`}
                              title="Toggle Verification"
                            >
                              <BadgeCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleFounder(shop.id)}
                              disabled={actionLoading === shop.id + '-founder'}
                              className={`p-1 rounded border transition-colors ${
                                shop.is_founder 
                                  ? 'bg-luxury-gold bg-opacity-10 border-luxury-gold text-luxury-gold' 
                                  : 'border-luxury-border text-gray-500 hover:text-white'
                              }`}
                              title="Toggle Founder Flagship Status"
                            >
                              <Award className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {shop.status !== 'approved' && (
                              <button
                                onClick={() => handleUpdateStatus(shop.id, 'approved')}
                                className="bg-green-500 hover:bg-green-600 text-black px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {shop.status === 'approved' && (
                              <button
                                onClick={() => handleUpdateStatus(shop.id, 'blocked')}
                                className="bg-red-500 hover:bg-red-600 text-black px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors"
                              >
                                Block
                              </button>
                            )}
                            {shop.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(shop.id, 'rejected')}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteShop(shop.id)}
                              className="p-1 text-red-400 hover:bg-red-500 hover:text-white border border-red-500 border-opacity-20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* 2. CUSTOMER & USER MANAGEMENT */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="space-y-6"
            >
              {/* Search, filters panel */}
              <div className="glass-panel p-6 rounded-xl border border-luxury-border border-opacity-40 flex flex-col md:flex-row gap-4 items-center justify-between shadow-glass">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-luxury-black bg-opacity-65 border border-luxury-border border-opacity-35 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-luxury-gold"
                  />
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-xs text-gray-300">
                  <div className="flex items-center space-x-1">
                    <span>Role:</span>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="bg-luxury-black border border-luxury-border rounded-lg px-2.5 py-1 text-xs text-gray-300"
                    >
                      <option value="All">All Roles</option>
                      <option value="customer">Customers</option>
                      <option value="owner">Owners</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-luxury-black border border-luxury-border rounded-lg px-2.5 py-1 text-xs text-gray-300"
                    >
                      <option value="All">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>Verification:</span>
                    <select
                      value={verifyFilter}
                      onChange={(e) => setVerifyFilter(e.target.value)}
                      className="bg-luxury-black border border-luxury-border rounded-lg px-2.5 py-1 text-xs text-gray-300"
                    >
                      <option value="All">All Types</option>
                      <option value="Verified">Verified Only</option>
                      <option value="Unverified">Unverified Only</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                    <select
                      value={userSort}
                      onChange={(e) => setUserSort(e.target.value)}
                      className="bg-luxury-black border border-luxury-border rounded-lg px-2.5 py-1 text-xs text-gray-300"
                    >
                      <option value="newest">Newest Account</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users table */}
              <div className="glass-panel rounded-xl border border-luxury-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-luxury-purpleDeep bg-opacity-40 border-b border-luxury-border border-opacity-40 text-luxury-gold uppercase tracking-wider font-bold">
                        <th className="p-4">User Details</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Verification</th>
                        <th className="p-4">Created At</th>
                        <th className="p-4 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">No accounts match search parameters.</td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr 
                            key={u.id}
                            className="border-b border-luxury-border border-opacity-25 hover:bg-luxury-purpleDeep hover:bg-opacity-10 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'} 
                                  alt={u.name}
                                  className="w-9 h-9 rounded-full border border-luxury-border object-cover"
                                />
                                <span className="font-semibold text-white">{u.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-400 font-light">{u.email}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                u.role === 'admin' 
                                  ? 'bg-luxury-gold bg-opacity-10 text-luxury-gold border-luxury-gold border-opacity-20'
                                  : u.role === 'owner'
                                  ? 'bg-luxury-purpleLight text-gray-300 border-luxury-border'
                                  : 'bg-transparent text-gray-500 border-gray-600'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                u.status === 'active' 
                                  ? 'bg-green-500 bg-opacity-10 text-green-400'
                                  : 'bg-red-500 bg-opacity-10 text-red-400'
                              }`}>
                                {u.status || 'active'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <button
                                  onClick={() => handleToggleUserVerify(u.id)}
                                  disabled={actionLoading === u.id + '-user-verify'}
                                  className={`p-1.5 rounded border transition-colors ${
                                    u.is_verified 
                                      ? 'bg-luxury-gold bg-opacity-10 border-luxury-gold text-luxury-gold' 
                                      : 'border-luxury-border text-gray-500 hover:text-white'
                                  }`}
                                  title={u.is_verified ? "Revoke Verification Badge" : "Assign Verified Badge"}
                                >
                                  <BadgeCheck className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                            <td className="p-4 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedCustomer(u)}
                                className="p-1.5 border border-luxury-gold border-opacity-20 text-luxury-gold hover:bg-luxury-gold hover:text-black rounded transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Slide-out detail modal for Customer */}
              <AnimatePresence>
                {selectedCustomer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: 15 }}
                      className="glass-panel max-w-2xl w-full rounded-2xl border border-luxury-border shadow-glass relative p-6 sm:p-8 flex flex-col space-y-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={() => setSelectedCustomer(null)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-luxury-black bg-opacity-80 border border-luxury-border flex items-center justify-center text-gray-400 hover:text-white z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Header details */}
                      <div className="flex items-center space-x-4">
                        <img 
                          src={selectedCustomer.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'} 
                          alt={selectedCustomer.name}
                          className="w-16 h-16 rounded-full border border-luxury-gold object-cover"
                        />
                        <div>
                          <h3 className="text-xl font-bold font-serif text-white flex items-center gap-1.5">
                            {selectedCustomer.name}
                            {selectedCustomer.is_verified && <BadgeCheck className="w-5 h-5 text-luxury-gold" />}
                          </h3>
                          <p className="text-xs text-gray-400">{selectedCustomer.email}</p>
                          <p className="text-[10px] text-gray-500 uppercase mt-0.5">Joined on {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Actions coordinates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-luxury-purpleDeep bg-opacity-35 p-4 rounded-xl border border-luxury-border border-opacity-30">
                        <div className="space-y-2">
                          <h5 className="text-[10px] text-gray-500 font-bold uppercase">Account Access Status</h5>
                          <div className="flex gap-2">
                            {['active', 'suspended', 'blocked'].map((st) => (
                              <button
                                key={st}
                                onClick={() => handleUpdateUserStatus(selectedCustomer.id, st as any)}
                                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all border ${
                                  selectedCustomer.status === st 
                                    ? 'bg-luxury-gold text-black border-luxury-gold shadow' 
                                    : 'bg-transparent text-gray-400 border-luxury-border hover:text-white'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-[10px] text-gray-500 font-bold uppercase">Verification state</h5>
                          <button
                            onClick={() => handleToggleUserVerify(selectedCustomer.id)}
                            className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase transition-all border ${
                              selectedCustomer.is_verified 
                                ? 'bg-luxury-gold text-black border-luxury-gold' 
                                : 'bg-transparent text-gray-400 border-luxury-border'
                            }`}
                          >
                            {selectedCustomer.is_verified ? 'Verified badge active' : 'Verify user Account'}
                          </button>
                        </div>
                      </div>

                      {/* Orders & Activity feeds */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-60 overflow-hidden">
                        
                        {/* Purchases list */}
                        <div className="flex flex-col h-full border border-luxury-border border-opacity-30 rounded-xl p-4 bg-luxury-black bg-opacity-50">
                          <h5 className="text-[10px] text-luxury-gold font-bold uppercase tracking-wider border-b border-luxury-border border-opacity-20 pb-1.5 mb-3 flex items-center justify-between">
                            <span>Order Inquiries</span>
                            <span>({orders.filter(o => o.customer_email === selectedCustomer.email || o.user_id === selectedCustomer.id).length})</span>
                          </h5>
                          
                          <div className="flex-grow overflow-y-auto space-y-2 pr-1 scrollbar-hide text-xs text-gray-300">
                            {orders.filter(o => o.customer_email === selectedCustomer.email || o.user_id === selectedCustomer.id).length === 0 ? (
                              <p className="text-gray-500 text-[11px] text-center pt-8 font-light">No order inquiries.</p>
                            ) : (
                              orders
                                .filter(o => o.customer_email === selectedCustomer.email || o.user_id === selectedCustomer.id)
                                .map(o => (
                                  <div key={o.id} className="p-2 border border-luxury-border border-opacity-20 rounded bg-luxury-purpleDeep bg-opacity-20 flex justify-between items-center">
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-white">#{o.id.substring(0, 5).toUpperCase()}</p>
                                      <p className="text-[9px] text-gray-500">₹{Number(o.total_price).toLocaleString()}</p>
                                    </div>
                                    <span className="text-[8px] uppercase tracking-wider text-luxury-gold">{o.status}</span>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>

                        {/* Activities list */}
                        <div className="flex flex-col h-full border border-luxury-border border-opacity-30 rounded-xl p-4 bg-luxury-black bg-opacity-50">
                          <h5 className="text-[10px] text-luxury-gold font-bold uppercase tracking-wider border-b border-luxury-border border-opacity-20 pb-1.5 mb-3 flex items-center justify-between">
                            <span>Activity logs</span>
                            <span>({activities.filter(a => a.user_id === selectedCustomer.id).length})</span>
                          </h5>
                          
                          <div className="flex-grow overflow-y-auto space-y-2 pr-1 scrollbar-hide text-[10px] text-gray-400">
                            {activities.filter(a => a.user_id === selectedCustomer.id).length === 0 ? (
                              <p className="text-gray-500 text-[11px] text-center pt-8 font-light">No logged activity.</p>
                            ) : (
                              activities
                                .filter(a => a.user_id === selectedCustomer.id)
                                .map(a => (
                                  <div key={a.id} className="border-b border-luxury-border border-opacity-10 pb-1.5 last:border-0">
                                    <p className="font-semibold text-white">{a.action}</p>
                                    <p className="text-[9px] text-gray-500 line-clamp-1">{a.details}</p>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>

                      </div>

                      <div className="pt-4 mt-auto border-t border-luxury-border border-opacity-25 flex justify-end">
                        <button
                          onClick={() => setSelectedCustomer(null)}
                          className="btn-gold-outline px-6 py-2.5 text-xs font-bold uppercase"
                        >
                          Close Details
                        </button>
                      </div>

                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {/* 3. TRANSACTION LOGS */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="glass-panel rounded-xl border border-luxury-border overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-luxury-purpleDeep bg-opacity-40 border-b border-luxury-border border-opacity-45 text-luxury-gold uppercase tracking-wider font-bold">
                      <th className="p-4">Order Ref</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Items Count</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">No checkout transactions on the system yet.</td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="border-b border-luxury-border border-opacity-25 hover:bg-luxury-purpleDeep hover:bg-opacity-10 transition-colors">
                          <td className="p-4 font-bold text-white">#{o.id.substring(0, 8).toUpperCase()}</td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <h4 className="font-semibold text-white">{o.customer_name}</h4>
                              <p className="text-[9px] text-gray-500 font-light">{o.customer_phone} | {o.customer_email}</p>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300 font-medium">
                            {(typeof o.items === 'string' ? JSON.parse(o.items) : o.items).length} items
                          </td>
                          <td className="p-4 text-luxury-gold font-bold">₹{Number(o.total_price).toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                              o.status === 'completed' 
                                ? 'bg-green-500 bg-opacity-10 text-green-400 border border-green-500 border-opacity-20'
                                : o.status === 'cancelled'
                                ? 'bg-red-500 bg-opacity-10 text-red-400 border border-red-500 border-opacity-20'
                                : 'bg-yellow-500 bg-opacity-10 text-yellow-400 border border-yellow-500 border-opacity-20'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* 4. ACTIVITY LOGS */}
          {activeTab === 'activity' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="glass-panel p-6 rounded-xl border border-luxury-border space-y-4"
            >
              <div className="border-b border-luxury-border border-opacity-35 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold">System Activity Feed</h3>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {activities.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex flex-col sm:flex-row justify-between p-3.5 rounded bg-luxury-purpleDeep bg-opacity-20 border border-luxury-border border-opacity-30 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="text-[10px] bg-luxury-purpleLight px-1.5 py-0.5 rounded uppercase text-gray-300">{log.action}</span>
                        <span>{log.user_name || 'System'}</span>
                      </div>
                      <p className="text-gray-400 font-light">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium shrink-0 mt-2 sm:mt-0">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 5. ADMIN ACTIONS AUDIT */}
          {activeTab === 'adminLogs' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="glass-panel p-6 rounded-xl border border-luxury-border space-y-4"
            >
              <div className="border-b border-luxury-border border-opacity-35 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-gold">Admin Audit Trails</h3>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {adminLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex flex-col sm:flex-row justify-between p-3.5 rounded bg-luxury-purpleDeep bg-opacity-20 border border-red-500 border-opacity-10 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="text-[10px] bg-luxury-gold bg-opacity-10 border border-luxury-gold border-opacity-20 px-1.5 py-0.5 rounded uppercase text-luxury-gold font-bold">
                          {log.action}
                        </span>
                        <span>Operator: {log.admin_name}</span>
                      </div>
                      <p className="text-gray-400 font-light">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium shrink-0 mt-2 sm:mt-0">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 6. EMAIL HUB & CUSTOMER INBOX */}
          {activeTab === 'emailHub' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="space-y-8"
            >
              {/* Inner Sub-navigation */}
              <div className="flex border-b border-luxury-border border-opacity-25 pb-px overflow-x-auto whitespace-nowrap gap-4">
                {[
                  { id: 'logs', label: 'Delivery Logs' },
                  { id: 'settings', label: 'Mail Providers' },
                  { id: 'templates', label: 'Template Library' },
                  { id: 'contact', label: 'Support Inbox' }
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setEmailHubSubTab(sub.id as any)}
                    className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                      emailHubSubTab === sub.id ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* SECTION: logs */}
              {emailHubSubTab === 'logs' && (
                <div className="space-y-6">
                  {/* Filters / Search */}
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-luxury-purpleDeep bg-opacity-10 p-4 rounded-xl border border-luxury-border border-opacity-20">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search recipient email..."
                        value={emailSearch}
                        onChange={(e) => setEmailSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold"
                      />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                      {['All', 'sent', 'failed', 'pending'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setEmailFilter(filter)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all ${
                            emailFilter === filter
                              ? 'bg-luxury-gold text-black'
                              : 'bg-luxury-purpleDeep bg-opacity-30 border border-luxury-border border-opacity-20 text-gray-400 hover:text-white'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logs Table */}
                  <div className="overflow-x-auto rounded-xl border border-luxury-border bg-luxury-purpleDeep bg-opacity-10">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-luxury-border border-opacity-30 bg-luxury-black bg-opacity-40 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                          <th className="p-4">Recipient</th>
                          <th className="p-4">Template / Subject</th>
                          <th className="p-4">Delivery Status</th>
                          <th className="p-4">Retries</th>
                          <th className="p-4">Sent At</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emailLogs
                          .filter(log => {
                            const matchSearch = log.recipient_email.toLowerCase().includes(emailSearch.toLowerCase());
                            const matchFilter = emailFilter === 'All' || log.status === emailFilter;
                            return matchSearch && matchFilter;
                          })
                          .map((log) => (
                            <tr key={log.id} className="border-b border-luxury-border border-opacity-10 hover:bg-luxury-purpleDeep hover:bg-opacity-20 transition-all">
                              <td className="p-4">
                                <div className="font-semibold text-white">{log.recipient_name || 'Guest User'}</div>
                                <div className="text-[10px] text-gray-500">{log.recipient_email}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider">{log.template_name}</div>
                                <div className="text-gray-400 font-light mt-0.5">{log.subject}</div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                                  log.status === 'sent'
                                    ? 'bg-green-500 bg-opacity-15 text-green-400 border border-green-500 border-opacity-20'
                                    : log.status === 'failed'
                                    ? 'bg-red-500 bg-opacity-15 text-red-400 border border-red-500 border-opacity-20'
                                    : 'bg-yellow-500 bg-opacity-15 text-yellow-400 border border-yellow-500 border-opacity-20'
                                }`}>
                                  {log.status}
                                </span>
                                {log.error_message && (
                                  <div className="text-[9px] text-red-400 max-w-xs truncate mt-1" title={log.error_message}>
                                    {log.error_message}
                                  </div>
                                )}
                              </td>
                              <td className="p-4 text-gray-400 font-medium">
                                {log.retry_count} / {log.max_retries}
                              </td>
                              <td className="p-4 text-gray-500 font-medium">
                                {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'Pending Queue'}
                              </td>
                              <td className="p-4 text-right">
                                {log.status === 'failed' && (
                                  <button
                                    onClick={() => handleResendEmail(log.id)}
                                    className="p-1 px-2.5 rounded bg-luxury-gold bg-opacity-10 hover:bg-luxury-gold hover:text-black border border-luxury-gold text-luxury-gold text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1 ml-auto animate-pulse"
                                  >
                                    <RefreshCw className="w-2.5 h-2.5" />
                                    Resend
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        {emailLogs.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500 text-[10px] uppercase font-bold">
                              No email log history coordinates found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: settings */}
              {emailHubSubTab === 'settings' && emailSettings && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Provider Settings */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleUpdateEmailSettings({
                        provider: formData.get('provider'),
                        smtpHost: formData.get('smtpHost'),
                        smtpPort: formData.get('smtpPort'),
                        smtpUser: formData.get('smtpUser'),
                        smtpPass: formData.get('smtpPass'),
                        smtpSecure: formData.get('smtpSecure') === 'on',
                        resendApiKey: formData.get('resendApiKey'),
                        sendgridApiKey: formData.get('sendgridApiKey'),
                        senderEmail: formData.get('senderEmail'),
                        senderName: formData.get('senderName')
                      });
                    }}
                    className="lg:col-span-2 glass-panel p-6 rounded-xl border border-luxury-border space-y-6"
                  >
                    <h3 className="text-sm font-serif font-bold text-white tracking-wide uppercase">Email Provider Configuration</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Select Provider</label>
                        <select
                          name="provider"
                          defaultValue={emailSettings.provider}
                          className="w-full p-2.5 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white"
                        >
                          <option value="sandbox">Sandbox (Mocks Logs Only)</option>
                          <option value="smtp">SMTP (Custom Server)</option>
                          <option value="resend">Resend REST API</option>
                          <option value="sendgrid">SendGrid REST API</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Sender Email</label>
                        <input
                          type="email"
                          name="senderEmail"
                          defaultValue={emailSettings.sender_email}
                          className="w-full p-2.5 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Sender Name</label>
                        <input
                          type="text"
                          name="senderName"
                          defaultValue={emailSettings.sender_name}
                          className="w-full p-2.5 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* SMTP Credentials */}
                    <div className="border-t border-luxury-border border-opacity-25 pt-4 space-y-4">
                      <h4 className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider">SMTP Server Settings</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400">Host</label>
                          <input
                            type="text"
                            name="smtpHost"
                            defaultValue={emailSettings.smtp_host || ''}
                            className="w-full p-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400">Port</label>
                          <input
                            type="number"
                            name="smtpPort"
                            defaultValue={emailSettings.smtp_port || ''}
                            className="w-full p-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1 flex items-center h-full pt-5">
                          <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                            <input
                              type="checkbox"
                              name="smtpSecure"
                              defaultChecked={emailSettings.smtp_secure}
                              className="accent-luxury-gold"
                            />
                            Secure (SSL/TLS)
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400">User</label>
                          <input
                            type="text"
                            name="smtpUser"
                            defaultValue={emailSettings.smtp_user || ''}
                            className="w-full p-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400">Password</label>
                          <input
                            type="password"
                            name="smtpPass"
                            defaultValue={emailSettings.smtp_pass || ''}
                            className="w-full p-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* REST API KEYS */}
                    <div className="border-t border-luxury-border border-opacity-25 pt-4 space-y-4">
                      <h4 className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider">REST API Configurations</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400">Resend API Key</label>
                          <input
                            type="password"
                            name="resendApiKey"
                            defaultValue={emailSettings.resend_api_key || ''}
                            className="w-full p-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400">SendGrid API Key</label>
                          <input
                            type="password"
                            name="sendgridApiKey"
                            defaultValue={emailSettings.sendgrid_api_key || ''}
                            className="w-full p-2 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-luxury-border border-opacity-25 pt-4 flex justify-between items-center">
                      <span className="text-[9px] text-gray-500 uppercase tracking-wide">Last updated: {new Date(emailSettings.updated_at).toLocaleString()}</span>
                      <button
                        type="submit"
                        disabled={actionLoading === 'settings'}
                        className="btn-gold-metallic text-[10px] font-bold uppercase tracking-wider px-6 py-2"
                      >
                        {actionLoading === 'settings' ? 'Saving Configurations...' : 'Save Settings'}
                      </button>
                    </div>
                  </form>

                  {/* Settings Toggle Toggles (Events Panel) & Simulated Cron Trigger */}
                  <div className="space-y-6">
                    <div className="glass-panel p-5 rounded-xl border border-luxury-border space-y-4">
                      <h4 className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider">Enabled Notifications Toggles</h4>
                      <p className="text-[9px] text-gray-400 font-light">Toggle global email delivery filters for specific events. Types disabled here will not be dispatched.</p>

                      <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-2">
                        {Array.isArray(emailSettings.enabled_types) && [
                          { key: 'welcome', label: 'Customer Welcome' },
                          { key: 'verification', label: 'Email Verification' },
                          { key: 'password_reset', label: 'Password Reset Code' },
                          { key: 'login_alert', label: 'Security Login Alert' },
                          { key: 'order_confirmation', label: 'Order Confirmed Alert' },
                          { key: 'order_status', label: 'Order Status Shifts' },
                          { key: 'wishlist_price_drop', label: 'Wishlist Price Drop' },
                          { key: 'back_in_stock', label: 'Back in Stock Alert' },
                          { key: 'newsletter_confirmation', label: 'Newsletter Subscriptions' },
                          { key: 'contact_response', label: 'Support Inquiries Replies' },
                          { key: 'account_status', label: 'Customer Account Suspension' },
                          { key: 'shop_registration', label: 'Shop Registration Confirmation' },
                          { key: 'shop_status', label: 'Boutique Moderation Approval' },
                          { key: 'new_order', label: 'Vendor New Order Notification' },
                          { key: 'product_moderation', label: 'Product Moderation Status' },
                          { key: 'low_inventory', label: 'Vendor Stock Level Alerts' },
                          { key: 'sales_report', label: 'Vendor Sales Reporting Cron' },
                          { key: 'new_review', label: 'Vendor Reviews Alerts' },
                          { key: 'new_vendor', label: 'Admin Registration Request' },
                          { key: 'critical_alert', label: 'Admin Hardware Security Alerts' },
                          { key: 'platform_summary', label: 'Admin Summary Cron' }
                        ].map((notif) => {
                          const isEnabled = emailSettings.enabled_types.includes(notif.key);
                          return (
                            <label key={notif.key} className="flex items-center justify-between p-2 rounded bg-luxury-black bg-opacity-40 text-xs text-white cursor-pointer select-none">
                              <span className="font-medium text-[10px] text-gray-300">{notif.label}</span>
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={async () => {
                                  const list: string[] = [...emailSettings.enabled_types];
                                  const nextList = isEnabled ? list.filter(k => k !== notif.key) : [...list, notif.key];
                                  await handleUpdateEmailSettings({ enabledTypes: nextList });
                                }}
                                className="accent-luxury-gold"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="glass-panel p-5 rounded-xl border border-luxury-border space-y-3">
                      <h4 className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider">Simulated Scheduler Cron Threads</h4>
                      <p className="text-[9px] text-gray-400 font-light">Trigger scheduled background cron routines to scan stock database logs, summarize platform growth, or draft vendor sales reports.</p>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleTriggerCron('platform_summary')}
                          className="w-full p-2 bg-luxury-purpleDeep bg-opacity-40 hover:bg-luxury-purpleDeep hover:bg-opacity-80 border border-luxury-border text-[9px] uppercase font-bold tracking-wider text-gray-200 transition-all rounded-lg flex items-center justify-center gap-1"
                        >
                          <Play className="w-3 h-3 text-luxury-gold" />
                          Platform Summary Cron (Admin)
                        </button>
                        <button
                          onClick={() => handleTriggerCron('sales_report')}
                          className="w-full p-2 bg-luxury-purpleDeep bg-opacity-40 hover:bg-luxury-purpleDeep hover:bg-opacity-80 border border-luxury-border text-[9px] uppercase font-bold tracking-wider text-gray-200 transition-all rounded-lg flex items-center justify-center gap-1"
                        >
                          <Play className="w-3 h-3 text-luxury-gold" />
                          Sales Performance Cron (Vendors)
                        </button>
                        <button
                          onClick={() => handleTriggerCron('low_inventory')}
                          className="w-full p-2 bg-luxury-purpleDeep bg-opacity-40 hover:bg-luxury-purpleDeep hover:bg-opacity-80 border border-luxury-border text-[9px] uppercase font-bold tracking-wider text-gray-200 transition-all rounded-lg flex items-center justify-center gap-1"
                        >
                          <Play className="w-3 h-3 text-luxury-gold" />
                          Low Inventory Alert Cron
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: templates */}
              {emailHubSubTab === 'templates' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Template selector */}
                  <div className="lg:col-span-1 glass-panel p-5 rounded-xl border border-luxury-border space-y-4">
                    <h4 className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider">Select Mail Template</h4>
                    <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
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
                        { type: 'shop_registration', label: 'Shop Registered' },
                        { type: 'shop_status', label: 'Shop Status' },
                        { type: 'new_order', label: 'New Vendor Order' },
                        { type: 'product_moderation', label: 'Product Moderation' },
                        { type: 'low_inventory', label: 'Low Inventory Alert' },
                        { type: 'sales_report', label: 'Vendor Sales Report' },
                        { type: 'new_review', label: 'Vendor Review Alert' },
                        { type: 'new_vendor', label: 'New Shop Req (Admin)' },
                        { type: 'critical_alert', label: 'Critical Alert (Admin)' },
                        { type: 'platform_summary', label: 'Platform Summary (Admin)' }
                      ].map((item) => (
                        <button
                          key={item.type}
                          onClick={() => setSelectedTemplate(item.type)}
                          className={`w-full text-left p-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                            selectedTemplate === item.type
                              ? 'bg-luxury-gold text-black border-luxury-gold'
                              : 'bg-luxury-purpleDeep bg-opacity-20 border-luxury-border border-opacity-35 text-gray-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template Viewer */}
                  <div className="lg:col-span-3 glass-panel p-5 rounded-xl border border-luxury-border flex flex-col min-h-[500px]">
                    <div className="border-b border-luxury-border border-opacity-30 pb-3 flex justify-between items-center">
                      <h4 className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider">Live HTML Render Coordinates ({selectedTemplate})</h4>
                    </div>

                    <div className="flex-1 bg-white rounded-lg mt-4 overflow-hidden border border-luxury-border border-opacity-40">
                      <iframe
                        src={`http://localhost:5000/api/admin/email/templates/preview?name=${selectedTemplate}`}
                        className="w-full h-[500px] border-0"
                        title="Email Template Live Preview"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: contact inquiries */}
              {emailHubSubTab === 'contact' && (
                <div className="space-y-6">
                  <div className="glass-panel p-5 rounded-xl border border-luxury-border">
                    <h3 className="text-sm font-serif font-bold text-white tracking-wide uppercase">Client Support Inbox</h3>
                    <p className="text-[9px] text-gray-400 mt-1 font-light">Read messages submitted through the lookbook contact coordinates. Reply to trigger layout support responses instantly.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {contactMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-5 rounded-xl bg-luxury-purpleDeep bg-opacity-25 border border-luxury-border border-opacity-30 space-y-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-xs text-white">{msg.name}</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">{msg.email}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider ${
                            msg.replied
                              ? 'bg-green-500 bg-opacity-15 text-green-400 border border-green-500 border-opacity-20'
                              : 'bg-yellow-500 bg-opacity-15 text-yellow-400 border border-yellow-500 border-opacity-20'
                          }`}>
                            {msg.replied ? 'Replied' : 'Pending Reply'}
                          </span>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold text-luxury-gold uppercase tracking-wide">Subject: {msg.subject}</div>
                          <p className="text-xs text-gray-300 font-light mt-1.5 leading-relaxed italic bg-luxury-black bg-opacity-30 p-3 rounded-lg border border-luxury-border border-opacity-15">
                            "{msg.message}"
                          </p>
                        </div>

                        {msg.replied && (
                          <div className="text-xs border-t border-luxury-border border-opacity-20 pt-3">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-green-400">Response Sent:</span>
                            <p className="text-gray-400 font-light mt-1 pl-2 border-l border-green-500 border-opacity-40 italic">
                              "{msg.reply_content}"
                            </p>
                          </div>
                        )}

                        {!msg.replied && (
                          <div className="pt-2 text-right">
                            <button
                              onClick={() => setReplyMessageId(msg.id)}
                              className="btn-gold-outline text-[9px] uppercase font-bold tracking-wider px-4 py-2"
                            >
                              Compose Reply Email
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {contactMessages.length === 0 && (
                      <div className="p-8 text-center text-gray-500 text-[10px] uppercase font-bold">
                        No support inquiries received in coordinates inbox.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* REPLY SUPPORT MODAL */}
              {replyMessageId && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-lg glass-panel p-6 rounded-xl border border-luxury-border space-y-4">
                    <div className="flex justify-between items-center border-b border-luxury-border border-opacity-35 pb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-luxury-gold">Compose Reply Notification</h4>
                      <button onClick={() => setReplyMessageId(null)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleReplyContact} className="space-y-4">
                      <div>
                        <label className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Compose Email Message Body</label>
                        <textarea
                          rows={6}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Type response contents to client. The customer will receive an elegant email referencing their original ticket subject..."
                          className="w-full mt-1.5 p-3 bg-luxury-black border border-luxury-border rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold"
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setReplyMessageId(null)}
                          className="px-4 py-2 bg-transparent hover:bg-luxury-purpleDeep text-[10px] font-bold text-gray-400 uppercase tracking-wider rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-gold-metallic text-[10px] font-bold uppercase tracking-wider px-5 py-2"
                        >
                          Queue Reply Email
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 5. ADMIN LOGS */}

        </AnimatePresence>
      </div>

    </div>
  );
};
