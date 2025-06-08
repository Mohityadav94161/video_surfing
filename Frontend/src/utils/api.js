import axios from 'axios';

// Create a custom Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  withCredentials: true,
});

// This will be set in the App component
let captchaContextValue = null;

// Function to set the captcha context
export const setCaptchaContext = (context) => {
  captchaContextValue = context;
};

// Create a request queue for pending requests during captcha verification
const requestQueue = [];

// Add request interceptor to handle captcha verification
api.interceptors.request.use(
  async (config) => {
    // Skip captcha check for captcha-related endpoints
    if (config.url.includes('/api/captcha/')) {
      return config;
    }

    // If captcha context is not available, just proceed with the request
    if (!captchaContextValue) {
      return config;
    }

    const { captchaVerified, captchaRequired, captchaModalVisible, setCaptchaModalVisible, addBlockedRequest } = captchaContextValue;

    // If captcha verification is required and not yet verified
    if (captchaRequired && !captchaVerified) {
      // Show the captcha modal if not already visible
      if (!captchaModalVisible) {
        setCaptchaModalVisible(true);
      }

      // Create a promise that will be resolved when captcha is verified
      return new Promise((resolve) => {
        const request = {
          config,
          proceed: () => resolve(config)
        };

        // Add request to queue
        addBlockedRequest(request);
      });
    }

    // Captcha is verified or not required, proceed with the request
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle captcha-related errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // If the error is captcha-related (403 status code)
    if (error.response && error.response.status === 403 && error.response.data && error.response.data.data?.captchaRequired) {
      // If captcha context is available
      if (captchaContextValue) {
        const { resetCaptchaVerification } = captchaContextValue;
        
        // Reset captcha verification and show modal
        resetCaptchaVerification();
        
        // Store the failed request to retry after captcha verification
        const originalRequest = error.config;
        
        // Return a promise that will be resolved when captcha is verified and request is retried
        return new Promise((resolve, reject) => {
          const retryOriginalRequest = async () => {
            try {
              // Retry the original request
              const response = await api(originalRequest);
              resolve(response);
            } catch (retryError) {
              reject(retryError);
            }
          };
          
          // Add an event listener for captcha verification
          document.addEventListener('captchaVerified', retryOriginalRequest, { once: true });
        });
      }
    }
    
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);

export default api; 