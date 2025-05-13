const AnalyticsLog = require('../models/AnalyticsLog');
const useragent = require('useragent');
const axios = require('axios');

// Middleware to log API requests for analytics
const logRequest = async (req, res, next) => {
  // Start timing the request
  const startTime = Date.now();
  
  // Store the original end method
  const originalEnd = res.end;
  
  // Override the end method to capture response data
  res.end = function() {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Don't log analytics-related requests to avoid recursive logging
    if (req.originalUrl.startsWith('/api/analytics')) {
      return originalEnd.apply(this, arguments);
    }
    
    // Extract user agent details
    const agent = useragent.parse(req.headers['user-agent']);
    
    // Determine device type
    let deviceType = 'other';
    if (agent.device.family !== 'Other') {
      deviceType = agent.device.family.toLowerCase().includes('mobile') ? 'mobile' : 
                  agent.device.family.toLowerCase().includes('tablet') ? 'tablet' : 'desktop';
    } else {
      deviceType = agent.os.family === 'iOS' || agent.os.family === 'Android' ? 'mobile' : 'desktop';
    }
    
    // Get the IP address
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Create analytics log entry
    const logEntry = {
      ip,
      userAgent: req.headers['user-agent'],
      path: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      userId: req.user ? req.user._id : undefined,
      referrer: req.headers.referer || req.headers.referrer,
      device: {
        type: deviceType,
        browser: agent.family,
        os: agent.os.family
      },
      // Create empty location object to be filled by geolocation service
      location: {
        country: null,
        city: null,
        lat: null,
        lng: null
      }
    };
    
    // Add session tracking if available
    if (req.session && req.session.id) {
      logEntry.session = {
        id: req.session.id,
        pageViews: req.session.pageViews || []
      };
    }
    
    // Don't block the response - log asynchronously and try to get geolocation data
    (async () => {
      try {
        // Only look up real IPs (not localhost or internal IPs)
        if (ip && !ip.startsWith('127.') && !ip.startsWith('192.168.') && !ip.startsWith('::1')) {
          try {
            // Use free IP geolocation API (replace with paid service in production for accuracy)
            const geoResponse = await axios.get(`http://ip-api.com/json/${ip}`);
            
            if (geoResponse.data && geoResponse.data.status === 'success') {
              logEntry.location = {
                country: geoResponse.data.country,
                city: geoResponse.data.city,
                lat: geoResponse.data.lat,
                lng: geoResponse.data.lon
              };
            }
          } catch (geoError) {
            // Silently fail for geolocation errors
            console.error('Geolocation lookup failed:', geoError.message);
          }
        }
        
        // Create the log entry
        await AnalyticsLog.create(logEntry);
      } catch (err) {
        console.error('Error logging analytics data:', err);
      }
    })();
    
    // Call the original end method
    return originalEnd.apply(this, arguments);
  };
  
  next();
};

module.exports = {
  logRequest
}; 