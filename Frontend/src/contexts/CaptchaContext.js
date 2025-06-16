import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axiosConfig';

const CaptchaContext = createContext();

export const useCaptcha = () => useContext(CaptchaContext);

export const CaptchaProvider = ({ children }) => {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaModalVisible, setCaptchaModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blockedRequests, setBlockedRequests] = useState([]);
  
  // Check localStorage on init to see if user already verified captcha
  useEffect(() => {
    const checkCaptchaStatus = () => {
      const captchaData = localStorage.getItem('captchaVerified');
      
      if (captchaData) {
        try {
          const { verified, expiry } = JSON.parse(captchaData);
          
          // Check if verification is still valid (not expired)
          if (verified && new Date(expiry) > new Date()) {
            setCaptchaVerified(true);
            setCaptchaRequired(false);
            setCaptchaModalVisible(false);
          } else {
            // Expired, remove from localStorage
            localStorage.removeItem('captchaVerified');
            checkIfCaptchaRequired();
          }
        } catch (err) {
          // Invalid data in localStorage
          localStorage.removeItem('captchaVerified');
          checkIfCaptchaRequired();
        }
      } else {
        checkIfCaptchaRequired();
      }
    };
    
    checkCaptchaStatus();
  }, []);
  
  // Check if captcha is required from the API
  const checkIfCaptchaRequired = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/captcha/check-required`);
      
      if (response.data.status === 'success') {
        const { captchaRequired } = response.data.data;
        
        setCaptchaRequired(captchaRequired);
        setCaptchaModalVisible(captchaRequired);
      }
    } catch (err) {
      console.error('Error checking captcha requirement:', err);
      // Default to requiring captcha if there's an error
      setCaptchaRequired(true);
      setCaptchaModalVisible(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle successful captcha verification
  const handleCaptchaVerified = () => {
    // Set captcha as verified
    setCaptchaVerified(true);
    setCaptchaRequired(false);
    setCaptchaModalVisible(false);
    
    // Store verification in localStorage with 24 hour expiry
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24); // Changed from 1 to 24 hour expiry
    
    localStorage.setItem('captchaVerified', JSON.stringify({
      verified: true,
      expiry: expiry.toISOString()
    }));
    
    // Process any blocked requests
    processBlockedRequests();
  };
  
  // Process any API requests that were blocked waiting for captcha
  const processBlockedRequests = () => {
    blockedRequests.forEach(request => {
      request.proceed();
    });
    
    setBlockedRequests([]);
  };
  
  // Add a blocked request to the queue
  const addBlockedRequest = (request) => {
    setBlockedRequests(prev => [...prev, request]);
  };
  
  // Reset captcha verification (used when unusual activity is detected)
  const resetCaptchaVerification = () => {
    localStorage.removeItem('captchaVerified');
    setCaptchaVerified(false);
    setCaptchaRequired(true);
    setCaptchaModalVisible(true);
  };
  
  // Force check for captcha requirement (can be called after unusual activity)
  const forceCheckCaptchaRequired = () => {
    checkIfCaptchaRequired();
  };
  
  return (
    <CaptchaContext.Provider
      value={{
        captchaVerified,
        captchaRequired,
        captchaModalVisible,
        setCaptchaModalVisible,
        handleCaptchaVerified,
        resetCaptchaVerification,
        forceCheckCaptchaRequired,
        addBlockedRequest,
        loading
      }}
    >
      {children}
    </CaptchaContext.Provider>
  );
};

export default CaptchaContext; 