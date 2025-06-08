const Captcha = require('../models/Captcha');

// Middleware to enforce captcha verification for specific routes
exports.requireCaptcha = async (req, res, next) => {
  try {
    // Get client IP
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    // Check if IP is blocked
    const isBlocked = await Captcha.isIPBlocked(ipAddress);
    if (isBlocked) {
      return res.status(403).json({
        status: 'error',
        message: 'Too many failed attempts. Please solve a captcha to continue.',
        data: {
          captchaRequired: true
        }
      });
    }
    
    // Check for unusual activity
    const hasUnusualActivity = await Captcha.hasUnusualActivity(ipAddress);
    
    // For new visitors or those with unusual activity, require captcha
    if (hasUnusualActivity || req.unusualActivity) {
      // Check if a verified captcha exists for this IP
      const verifiedCaptcha = await Captcha.findOne({
        ipAddress,
        verified: true,
        value: { $ne: 'activity_tracking' },
        expiresAt: { $gt: new Date() }
      });
      
      if (!verifiedCaptcha) {
        return res.status(403).json({
          status: 'error',
          message: 'Please solve a captcha to continue.',
          data: {
            captchaRequired: true
          }
        });
      }
    }
    
    // Continue to the next middleware
    next();
  } catch (err) {
    console.error('Error checking captcha:', err);
    // Allow request to proceed in case of error
    next();
  }
};

// Middleware to detect unusual activity patterns
exports.detectUnusualActivity = async (req, res, next) => {
  try {
    // Get client IP
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    // Skip for some authenticated users
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    
    // Track the current endpoint for pattern detection
    const endpoint = req.originalUrl.split('?')[0]; // Strip query parameters
    
    // Create a record to track this request
    await Captcha.create({
      ipAddress,
      value: 'activity_tracking',
      verified: true,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry for tracking
      endpoint
    });
    
    // Calculate time window for activity tracking
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // Count recent requests from this IP in different time windows
    const requestCountLastMinute = await Captcha.countDocuments({
      ipAddress,
      createdAt: { $gt: oneMinuteAgo }
    });
    
    const requestCountLastFiveMinutes = await Captcha.countDocuments({
      ipAddress,
      createdAt: { $gt: fiveMinutesAgo }
    });
    
    const requestCountLastHour = await Captcha.countDocuments({
      ipAddress,
      createdAt: { $gt: oneHourAgo }
    });
    
    // Check if this is a new visitor (with no verified captcha in the database)
    const hasVerifiedCaptcha = await Captcha.findOne({
      ipAddress,
      verified: true,
      value: { $ne: 'activity_tracking' },
      expiresAt: { $gt: new Date() }
    });

    // Comment out or remove this block to stop requiring captcha for every visitor
    /*
    // For demonstration purposes, consider every new visitor as requiring captcha verification
    if (!hasVerifiedCaptcha) {
      console.log(`New visitor detected from IP: ${ipAddress}, requiring captcha verification`);
      req.unusualActivity = true;
    }
    */
    
    // Detect unusual activity based on request rate
    // - More than 30 requests in 1 minute
    // - More than 120 requests in 5 minutes
    // - More than 500 requests in 1 hour
    if (
      requestCountLastMinute > 30 || 
      requestCountLastFiveMinutes > 120 || 
      requestCountLastHour > 500
    ) {
      // Record unusual activity
      console.warn(`Unusual activity detected from IP: ${ipAddress}`);
      
      // Mark request for captcha on next sensitive action
      req.unusualActivity = true;
      
      // If the activity is very aggressive, invalidate any existing captcha
      if (requestCountLastMinute > 60) {
        await Captcha.updateMany(
          { 
            ipAddress, 
            value: { $ne: 'activity_tracking' } 
          },
          { 
            $set: { expiresAt: new Date() } 
          }
        );
      }
    }
    
    // Detect unusual patterns:
    // - Rapid switching between pages (multiple different endpoints in short time)
    const distinctEndpointsLastMinute = await Captcha.distinct('endpoint', {
      ipAddress,
      createdAt: { $gt: oneMinuteAgo }
    });
    
    if (distinctEndpointsLastMinute.length > 15) {
      console.warn(`Unusual navigation pattern detected from IP: ${ipAddress}`);
      req.unusualActivity = true;
    }
    
    // Don't track the endpoint again at the end
    next();
  } catch (err) {
    console.error('Error detecting unusual activity:', err);
    // Allow request to proceed in case of error
    next();
  }
}; 