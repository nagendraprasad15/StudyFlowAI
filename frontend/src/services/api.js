import axios from 'axios';

// Base API URL configuration (swaps between production Render and local development endpoint)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios interceptor to automatically attach authorization tokens on outbound headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studyflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to intercept profile tokens expiry and auto logging out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('studyflow_token');
      // If window exists and user is not already on login page, redirect them
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
