import axios from 'axios';

// Get backend URL if defined, otherwise use proxy
const API_URL = (import.meta as any).env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.url;
};

// Auto attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('brotherhood_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Catch unauthorized errors, blocks, or suspensions and logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorMsg = error.response.data?.error || '';
      
      const isUnauthorized = status === 401;
      const isBanned = status === 403 && (
        errorMsg.toLowerCase().includes('suspended') || 
        errorMsg.toLowerCase().includes('blocked')
      );

      if (isUnauthorized || isBanned) {
        localStorage.removeItem('brotherhood_token');
        localStorage.removeItem('brotherhood_user');
        localStorage.removeItem('brotherhood_cart');
        
        if (typeof window !== 'undefined') {
          if (isBanned) {
            window.location.href = `/login?error=${encodeURIComponent(errorMsg)}`;
          } else {
            window.location.href = '/login?session_expired=true';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);
