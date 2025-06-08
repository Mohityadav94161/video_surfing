import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Captcha.css';
import { Button, Input } from 'antd';

const Captcha = ({ onVerify, onError }) => {
  const [captchaId, setCaptchaId] = useState(null);
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(15);
  
  // Generate new captcha
  const generateCaptcha = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/captcha/generate`);
      
      if (response.data.status === 'success') {
        setCaptchaId(response.data.data.captchaId);
        setCaptchaImage(response.data.data.captchaImage);
      } else {
        setError('Failed to load captcha');
        if (onError) onError('Failed to load captcha');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error generating captcha:', err);
      setError('Failed to load captcha. Please try again.');
      if (onError) onError('Failed to load captcha');
      setLoading(false);
    }
  };
  
  // Verify captcha
  const verifyCaptcha = async () => {
    try {
      if (!captchaValue) {
        setError('Please enter the captcha code');
        return;
      }
      
      setLoading(true);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/captcha/verify`, {
        captchaId,
        captchaValue
      });
      
      if (response.data.status === 'success') {
        if (onVerify) onVerify();
        setError('');
      } else {
        setError('Incorrect captcha code');
        if (response.data.data && response.data.data.attemptsLeft) {
          setAttemptsLeft(response.data.data.attemptsLeft);
        }
        setCaptchaValue('');
        generateCaptcha();
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error verifying captcha:', err);
      
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to verify captcha');
        
        if (err.response.data.data && err.response.data.data.attemptsLeft) {
          setAttemptsLeft(err.response.data.data.attemptsLeft);
        }
      } else {
        setError('Failed to verify captcha. Please try again.');
      }
      
      setCaptchaValue('');
      generateCaptcha();
      setLoading(false);
    }
  };
  
  // Load captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, []);
  
  return (
    <div className="captcha-container">
      <h3>Security Verification</h3>
      <p>Please enter the code below to verify you're not a bot</p>
      
      {loading ? (
        <div className="captcha-loading">Loading captcha...</div>
      ) : (
        <>
          <div className="captcha-image-container">
            <img 
              src={captchaImage} 
              alt="Captcha" 
              className="captcha-image" 
            />
            <Button 
              className="refresh-captcha-btn" 
              onClick={generateCaptcha}
              disabled={loading}
              aria-label="Refresh captcha"
            >
              ↻
            </Button>
          </div>
          
          <div className="captcha-input-container">
            <Input 
              type="text"
              value={captchaValue}
              onChange={(e) => setCaptchaValue(e.target.value)}
              placeholder="Enter code"
              className="captcha-input"
              aria-label="Captcha code"
            />
            
            <button 
              className="verify-captcha-btn"
              onClick={verifyCaptcha}
              disabled={loading || !captchaValue}
            >
              Verify
            </button>
          </div>
          
          {error && (
            <div className="captcha-error">
              {error}
              {attemptsLeft < 15 && (
                <div className="attempts-left">
                  Attempts left: {attemptsLeft}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Captcha; 