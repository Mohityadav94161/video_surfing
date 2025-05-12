import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data.data.user);
      } catch (err) {
        console.error('Error loading user:', err);
        setToken(null);
        message.error('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.data.user);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || 'Login failed';
      message.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      const res = await axios.post('/api/auth/signup', { username, email, password });
      setToken(res.data.token);
      setUser(res.data.data.user);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.message || 'Registration failed';
      message.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    message.success('Logged out successfully');
  };

  // Get the authentication status
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 