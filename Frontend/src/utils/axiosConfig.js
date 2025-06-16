import axios from 'axios';

// Determine the API base URL - IMPORTANT: Don't include '/api' as endpoints already include it
const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('API base URL configured as:', apiBaseUrl);

// Set up default configuration
const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Get token from local storage on initial load
const token = localStorage.getItem('token');
if (token) {
  console.log('Setting initial Authorization header from localStorage');
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Add a request interceptor
axiosInstance.interceptors.request.use(
  config => {
    // Always include credentials
    config.withCredentials = true;
    
    // Check for token before each request
    const currentToken = localStorage.getItem('token');
    if (currentToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${currentToken}`;
      console.log(`Adding Authorization header to request to ${config.url}`);
    }
    
    // Log full request details
    console.log(`Request: ${config.method?.toUpperCase() || 'GET'} ${config.baseURL}${config.url}`, 
                `Headers:`, config.headers,
                `Authorization: ${config.headers['Authorization'] ? 'Yes' : 'No'}`);
    
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle response
axiosInstance.interceptors.response.use(
  response => {
    // Log success responses with more detail
    console.log(`Response from ${response.config.url}:`, 
                `Status: ${response.status}`,
                `Data:`, response.data);
    return response;
  },
  error => {
    // Log error responses with more detail
    if (error.response) {
      console.error(`Error from ${error.config?.url}:`, 
                    `Status: ${error.response.status}`, 
                    `Data:`, error.response.data);
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        console.warn('Authentication error - clearing token');
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        
        // Optionally redirect to login page or show a message
      }
    } else if (error.request) {
      console.error('Request made but no response received:', error.request);
    } else {
      console.error('Request failed:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;