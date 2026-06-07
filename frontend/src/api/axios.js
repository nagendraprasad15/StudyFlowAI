import axios from 'axios';

// Centralized base URL targeting either production backend or local development server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic authorization bearer token injection interceptor
apiClient.interceptors.request.use(
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

// Unified response error handler interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('studyflow_token');
      // Redirect to login page on unauthorized response (session expired)
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
