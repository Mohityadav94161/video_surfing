import React, { useState, useEffect, useRef } from 'react';
import axios from '../utils/axiosConfig';
import './Captcha.css';
import { Button, Input } from 'antd';

const Captcha = ({ onVerify, onError }) => {
  const [captchaId, setCaptchaId] = useState(null);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(15);
  const canvasRef = useRef(null);
  
  // Generate captcha image from text using canvas
  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 200;
    canvas.height = 70;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${Math.random()})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Captcha text
    ctx.font = '28px Courier';
    ctx.fillStyle = '#333';
    for (let i = 0; i < text.length; i++) {
      const x = 15 + i * 25;
      const y = 35 + Math.random() * 5;
      const angle = (Math.random() - 0.5) * 0.5;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };
  
  // Generate new captcha
  const generateCaptcha = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/captcha/generate');
      
      if (response.data.status === 'success') {
        setCaptchaId(response.data.data.captchaId);
        setCaptchaText(response.data.data.captchaValue); // Use the actual captcha value
        // Generate image from text
        // console.log('captcha ',response.data.data.captchaValue)
        drawCaptcha(response.data.data.captchaValue);
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
      
      const response = await axios.post('/captcha/verify', {
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
            <canvas 
              ref={canvasRef}
              className="captcha-image" 
              style={{ border: '1px solid #ddd', borderRadius: '4px' }}
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