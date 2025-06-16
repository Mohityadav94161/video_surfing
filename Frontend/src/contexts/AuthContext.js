import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { message } from 'antd';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    // Initialize token from localStorage on mount
    return localStorage.getItem('token');
  });
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Set up axios with token whenever token changes
  useEffect(() => {
    console.log('Setting up axios token:', token ? 'present' : 'absent');
    
    if (token) {
      // Always set the token in axios headers when available
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
    }
  }, [token]);

  // Load user function that can be called anytime to revalidate
  const loadUser = async (skipLoading = false) => {
    if (!skipLoading) {
      setLoading(true);
    }
    
    // Check for token in both state and localStorage
    const storedToken = token || localStorage.getItem('token');
    const expiryTimeString = localStorage.getItem('tokenExpiry');
    
    console.log('loadUser called, token exists:', !!storedToken);
    
    if (!storedToken) {
      setLoading(false);
      setInitializing(false);
      return { success: false, reason: 'no-token' };
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
        return { success: false, reason: 'token-expired' };
      }
    }
    
    // Set token in headers in case it's not set
    if (!axiosInstance.defaults.headers.common['Authorization'] && storedToken) {
      console.log('Setting missing Authorization header');
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      // Also update local state if needed
      if (!token && storedToken) {
        setToken(storedToken);
      }
    }
    
    try {
      console.log('Fetching user data from API');
      // Token is valid, load user data
      const res = await axiosInstance.get('/api/auth/me');
      console.log('User data response:', res.data);
      
      // Check for user data in the nested response
      if (!res.data || !res.data.data || !res.data.data.user) {
        console.error('No user data in response:', res.data);
        throw new Error('Invalid response format');
      }
      
      const userData = res.data.data.user;
      setUser(userData);
      return { success: true, user: userData };
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
      return { success: false, reason: 'auth-error', error: err };
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  // Load user on initial render if token exists
  useEffect(() => {
    console.log('Initial auth check...');
    loadUser();
  }, []); // Only run once on mount, not on token changes to avoid loops

  // Setup axios response interceptor to handle token expiration
  useEffect(() => {
    console.log('Setting up axios interceptor');
    const interceptor = axiosInstance.interceptors.response.use(
      response => response,
      async error => {
        if (error.response && error.response.status === 401 && token) {
          console.log('401 error intercepted, clearing auth state');
          // Token is invalid or expired, log out the user
          setToken(null);
          setUser(null);
          message.error('Your session has expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Remove the interceptor when the component unmounts
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      console.log('Logging in user:', username);
      
      // Clear any existing token before login
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      const res = await axiosInstance.post('/api/auth/login', { username, password });
      
      console.log('Login response:', res.data);
      
      // Check for token in the nested data structure
      if (!res.data || !res.data.data || !res.data.data.token) {
        console.error('No token in login response:', res.data);
        return { success: false, message: 'Authentication failed: No token received' };
      }
      
      // Get the token from response (notice the nested data structure)
      const newToken = res.data.data.token;
      
      // Set authorization header for future requests
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Store token in localStorage
      localStorage.setItem('token', newToken);
      
      // Store token expiry time
      const expiresIn = res.data.data.expiresIn || 7 * 24 * 60 * 60 * 1000; // Default to 7 days
      const expiryTime = Date.now() + expiresIn;
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      // Update state
      setToken(newToken);
      setUser(res.data.data.user);
      
      console.log('Login successful, token stored');
      return { success: true, user: res.data.data.user };
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
  const register = async (username, password) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post('/api/auth/signup', { username, password });
      
      // Check for token in the nested data structure
      if (!res.data || !res.data.data || !res.data.data.token) {
        console.error('No token in register response:', res.data);
        return { success: false, message: 'Registration failed: No token received' };
      }
      
      // Get the token from response (notice the nested data structure)
      const newToken = res.data.data.token;
      
      // Set authorization header for future requests
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Store token in localStorage
      localStorage.setItem('token', newToken);
      
      // Store token expiry time
      const expiresIn = res.data.data.expiresIn || 7 * 24 * 60 * 60 * 1000; // Default to 7 days
      const expiryTime = Date.now() + expiresIn;
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      // Update state
      setToken(newToken);
      setUser(res.data.data.user);
      
      return { success: true, user: res.data.data.user };
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
    console.log('Logging out user');
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    message.success('Logged out successfully');
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
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
    logout,
    loadUser // Expose the loadUser function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 