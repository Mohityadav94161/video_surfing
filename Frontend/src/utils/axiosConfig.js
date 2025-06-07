import axios from 'axios';

// Set default base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Add a request interceptor to include credentials
axios.interceptors.request.use(
  config => {
    config.withCredentials = true;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axios;