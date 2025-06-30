const crypto = require('crypto');
const Captcha = require('../models/Captcha');

// Generate a random captcha string
const generateCaptchaValue = () => {
  // Exclude confusing characters like 0, O, 1, I, l
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

// Generate captcha text (temporary replacement for image generation)
const generateCaptchaText = (text) => {
  // Return a simple text representation for now
  // In production, you might want to use a different approach or add canvas back
  return `CAPTCHA: ${text}`;
};

// Generate new captcha
exports.generateCaptcha = async (req, res) => {
  try {
    // Get client IP
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    // Check if IP is blocked
    const isBlocked = await Captcha.isIPBlocked(ipAddress);
    if (isBlocked) {
      return res.status(403).json({
        status: 'error',
        message: 'Too many failed attempts. Please try again later.'
      });
    }
    
    // Generate captcha value
    const captchaValue = generateCaptchaValue();
    
    // Set expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Create captcha record
    const captcha = await Captcha.create({
      ipAddress,
      userId: req.user ? req.user.id : null,
      value: captchaValue,
      expiresAt
    });
    
    // Generate text representation (temporary)
    const captchaText = generateCaptchaText(captchaValue);
    
    res.status(200).json({
      status: 'success',
      data: {
        captchaId: captcha._id,
        captchaText, // Changed from captchaImage to captchaText
        captchaValue, // Include the actual value for testing purposes
        expiresAt
      }
    });
  } catch (err) {
    console.error('Error generating captcha:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error generating captcha'
    });
  }
};

// Verify captcha
exports.verifyCaptcha = async (req, res) => {
  try {
    const { captchaId, captchaValue } = req.body;
    
    if (!captchaId || !captchaValue) {
      return res.status(400).json({
        status: 'fail',
        message: 'Captcha ID and value are required'
      });
    }
    
    // Get client IP
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    // Find captcha record
    const captcha = await Captcha.findById(captchaId);
    
    // Check if captcha exists
    if (!captcha) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid captcha or captcha expired'
      });
    }
    
    // Check if captcha belongs to the same IP
    if (captcha.ipAddress !== ipAddress) {
      return res.status(403).json({
        status: 'fail',
        message: 'Captcha validation failed'
      });
    }
    
    // Check if captcha is already verified
    if (captcha.verified) {
      return res.status(200).json({
        status: 'success',
        message: 'Captcha already verified'
      });
    }
    
    // Check if captcha is expired
    if (captcha.expiresAt < new Date()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Captcha expired'
      });
    }
    
    // Check if captcha value is correct (case sensitive)
    if (captcha.value !== captchaValue) {
      captcha.failedAttempts += 1;
      captcha.lastFailedAt = new Date();
      
      // Block user after 10 failed attempts (reduced from 15)
      if (captcha.failedAttempts >= 10) {
        captcha.isBlocked = true;
        // Block for 24 hours
        captcha.expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
        
        await captcha.save();
        
        return res.status(403).json({
          status: 'error',
          message: 'Too many failed attempts. Your IP has been blocked for 12 hours.'
        });
      }
      
      await captcha.save();
      
      return res.status(400).json({
        status: 'fail',
        message: 'Incorrect captcha value',
        data: {
          attemptsLeft: 10 - captcha.failedAttempts
        }
      });
    }
    
    // Mark captcha as verified
    captcha.verified = true;
    
    // Set expiry time to 1 hour
    captcha.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    await captcha.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Captcha verified successfully',
      data: {
        expiry: captcha.expiresAt
      }
    });
  } catch (err) {
    console.error('Error verifying captcha:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error verifying captcha'
    });
  }
};

// Check if captcha verification is required
exports.checkCaptchaRequired = async (req, res) => {
  try {
    // Get client IP
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    // Check if IP is blocked
    const isBlocked = await Captcha.isIPBlocked(ipAddress);
    
    // Check for unusual activity
    const hasUnusualActivity = await Captcha.hasUnusualActivity(ipAddress);
    
    // Check if a verified captcha exists for this IP (excluding activity tracking)
    const hasVerifiedCaptcha = await Captcha.findOne({
      ipAddress,
      verified: true,
      value: { $ne: 'activity_tracking' },
      expiresAt: { $gt: new Date() }
    });
    
    // A new visitor is someone without a verified captcha
    const isNewVisitor = !hasVerifiedCaptcha;
    
    // In production, consider capturing more metrics about the client:
    // - User agent pattern
    // - Request headers
    // - Time of day
    // - Geolocation based on IP
    
    // Modified to not require captcha for all new visitors
    // Only require captcha if:
    // - IP is blocked
    // - Has unusual activity
    // - Has the unusualActivity flag
    const captchaRequired = isBlocked || hasUnusualActivity || req.unusualActivity;
    
    // If captcha is required, create a pending captcha session
    if (captchaRequired && !hasVerifiedCaptcha) {
      // Pre-generate a captcha ID for faster loading when the captcha component mounts
      const captchaValue = generateCaptchaValue();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      const captcha = await Captcha.create({
        ipAddress,
        userId: req.user ? req.user.id : null,
        value: captchaValue,
        expiresAt
      });
      
      res.status(200).json({
        status: 'success',
        data: {
          captchaRequired,
          captchaId: captcha._id,
          reason: isBlocked ? 'blocked' : 
                  hasUnusualActivity ? 'unusual_activity' : 
                  req.unusualActivity ? 'flagged' : 'none',
          expiry: expiresAt
        }
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: {
          captchaRequired,
          reason: isBlocked ? 'blocked' : 
                  hasUnusualActivity ? 'unusual_activity' : 
                  req.unusualActivity ? 'flagged' : 'none'
        }
      });
    }
  } catch (err) {
    console.error('Error checking captcha requirement:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error checking captcha requirement'
    });
  }
}; 