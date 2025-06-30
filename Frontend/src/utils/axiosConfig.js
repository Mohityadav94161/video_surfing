import axios from 'axios';

// Store reference to captcha context functions (will be set by CaptchaContext)
let captchaContextRef = null;
let captchaInProgress = false; // Flag to prevent multiple captcha modals

// Function to set captcha context reference
export const setCaptchaContextRef = (contextRef) => {
  captchaContextRef = contextRef;
};

// Function to reset captcha in progress flag
export const resetCaptchaInProgress = () => {
  captchaInProgress = false;
  // console.log('Captcha in progress flag reset');
};

// Use the full API base URL from environment variable which includes /api
// console.log('🌍 Environment variable REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// console.log('📍 Final API base URL configured as:', apiBaseUrl);

// Set up default configuration
const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout (default)
});

// Create a special instance for long-running operations like video extraction
const longRunningAxios = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 300000, // 5 minutes timeout for bulk operations
});

// Get token from local storage on initial load
const token = localStorage.getItem('token');
if (token) {
  console.log('Setting initial Authorization header from localStorage');
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  longRunningAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Add a request interceptor for both instances
const requestInterceptor = config => {
  // Always include credentials
  config.withCredentials = true;
  
  // Check for token before each request
  const currentToken = localStorage.getItem('token');
  if (currentToken && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${currentToken}`;
    // console.log(`Adding Authorization header to request to ${config.url}`);
  }
  
  // Log full request details
  console.log(`🔍 Request Debug:`, {
    method: config.method?.toUpperCase() || 'GET',
    baseURL: config.baseURL,
    url: config.url,
    fullURL: `${config.baseURL}${config.url}`,
    hasAuth: config.headers['Authorization'] ? 'Yes' : 'No',
    timeout: `${config.timeout}ms`
  });
  
  return config;
};

const requestErrorInterceptor = error => {
  console.error('Request error:', error);
  return Promise.reject(error);
};

// Add request interceptors to both instances
axiosInstance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
longRunningAxios.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

// Add a response interceptor to handle response for both instances
const responseInterceptor = response => {
  // Log success responses with more detail
  // console.log(`Response from ${response.config.url}:`, 
  //             `Status: ${response.status}`,
  //             `Data:`, response.data);
  return response;
};

const responseErrorInterceptor = error => {
  // Log error responses with more detail
  if (error.response) {
    console.error(`Error from ${error.config?.url}:`, 
                  `Status: ${error.response.status}`, 
                  `Data:`, error.response.data);
    
    // Handle 403 Captcha Required errors
    if (error.response.status === 403 && 
        error.response.data?.data?.captchaRequired === true) {
      console.warn('Captcha required - triggering captcha verification');
      
      if (captchaContextRef) {
        // Check if captcha is already in progress to prevent multiple modals
        if (!captchaInProgress) {
          captchaInProgress = true;
          // console.log('Starting captcha verification process');
          
          // Reset captcha verification and show modal (mark as auto-triggered)
          captchaContextRef.resetCaptchaVerification(true);
        }
        
        // Return a promise that resolves when captcha is verified
        return new Promise((resolve, reject) => {
          const originalRequest = error.config;
          
          // Add this request to the blocked requests queue
          captchaContextRef.addBlockedRequest({
            url: originalRequest.url,
            method: originalRequest.method,
            proceed: async () => {
              try {
                console.log('Retrying request after captcha verification:', originalRequest.url);
                // Retry the original request
                const response = await axios(originalRequest);
                resolve(response);
              } catch (retryError) {
                reject(retryError);
              }
            }
          });
        });
      } else {
        console.warn('Captcha context not available - cannot handle captcha requirement automatically');
      }
    }
    
    // Handle 401 Unauthorized errors
    if (error.response.status === 401) {
      console.warn('Authentication error - clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
    }
  } else if (error.request) {
    console.error('Request made but no response received:', error.request);
  } else {
    console.error('Request failed:', error.message);
  }
  
  return Promise.reject(error);
};

// Add response interceptors to both instances
axiosInstance.interceptors.response.use(responseInterceptor, responseErrorInterceptor);
longRunningAxios.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export default axiosInstance;
export { longRunningAxios };