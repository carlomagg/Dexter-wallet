import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  const register = async (email, password, firstName, lastName) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/auth/register/', {
        email,
        password,
        first_name: firstName,
        last_name: lastName
      });
      
      const { user, access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/auth/login/', {
        email,
        password
      });
      
      const { access, refresh } = response.data;
      
      // Get user info
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      const userResponse = await api.get('/wallet/balance/');
      const user = {
        email,
        wallet: userResponse.data
      };
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid email or password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const updateUserWallet = (walletData) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        wallet: walletData
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateUserWallet
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
