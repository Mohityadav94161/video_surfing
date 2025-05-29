import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { message } from 'antd';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

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
      setInitializing(true);
      setLoading(true);
      
      const storedToken = localStorage.getItem('token');
      const expiryTimeString = localStorage.getItem('tokenExpiry');
      
      if (!storedToken) {
        setLoading(false);
        setInitializing(false);
        return;
      }
      
      // Check if token is expired
      if (expiryTimeString) {
        const expiryTime = parseInt(expiryTimeString);
        if (Date.now() > expiryTime) {
          // Token is expired
          console.log('Token expired, clearing auth state');
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
          setLoading(false);
          setInitializing(false);
          return;
        }
      }
      
      try {
        // Token is valid, load user data
        const res = await axios.get('/api/auth/me');
        setUser(res.data.data.user);
      } catch (err) {
        console.error('Error loading user:', err);
        // Only show the error message if it's not a token expiration or initial load
        if (!initializing && err.response && err.response.status === 401) {
          message.error('Session expired. Please login again.');
        }
        
        // Clear the token and user state
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    };

    loadUser();
  }, [token]);

  // Setup axios response interceptor to handle token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401 && token) {
          // Token is invalid or expired, log out the user
          setToken(null);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Remove the interceptor when the component unmounts
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/login', { username, password });
      
      // Set token with expiration
      setToken(res.data.token);
      
      // Store token expiry time
      const expiresIn = res.data.expiresIn || 7 * 24 * 60 * 60 * 1000; // Default to 7 days
      const expiryTime = Date.now() + expiresIn;
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      setUser(res.data.data.user);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || 'Login failed';
      message.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/signup', { username, email, password });
      
      // Set token with expiration
      setToken(res.data.token);
      
      // Store token expiry time
      const expiresIn = res.data.expiresIn || 7 * 24 * 60 * 60 * 1000; // Default to 7 days
      const expiryTime = Date.now() + expiresIn;
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      setUser(res.data.data.user);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.message || 'Registration failed';
      message.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    message.success('Logged out successfully');
  };

  // Get the authentication status
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading,
    initializing,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 