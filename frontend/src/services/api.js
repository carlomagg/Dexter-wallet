import axios from 'axios';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token, logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh/`,
          { refresh: refreshToken }
        );
        
        const { access } = response.data;
        
        // Update the token in localStorage and axios headers
        localStorage.setItem('access_token', access);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Wallet service functions
export const walletService = {
  getBalance: () => api.get('/wallet/balance/'),
  
  fundWallet: (amount) => api.post('/wallet/fund/', { amount }),
  
  verifyTransaction: (reference) => api.get(`/wallet/verify/${reference}/`),
  
  getTransactions: () => api.get('/transactions/'),
};

// Auth service functions
export const authService = {
  register: (userData) => api.post('/auth/register/', userData),
  
  login: (credentials) => api.post('/auth/login/', credentials),
  
  refreshToken: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
};
