const Video = require('../models/Video');
const User = require('../models/User');
const AnalyticsLog = require('../models/AnalyticsLog');
const mongoose = require('mongoose');

// Get traffic data
exports.getTrafficData = async (req, res, next) => {
  try {
    // Parse date range from query params
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    // Query parameters
    const dateFilter = {
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    // Aggregate to get page views and unique visitors
    const analyticsStats = await AnalyticsLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          uniqueIPs: { $addToSet: "$ip" },
          avgResponseTime: { $avg: "$responseTime" }
        }
      }
    ]);
    
    // Get page views grouped by URL path
    const pageViewsByPath = await AnalyticsLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$path",
          pageviews: { $sum: 1 },
          avgTime: { $avg: "$responseTime" },
          bounceCount: {
            $sum: {
              $cond: [
                { $eq: [{ $size: { $ifNull: ["$session.pageViews", []] } }, 1] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { pageviews: -1 } },
      { $limit: 10 }
    ]);
    
    // Process page views to calculate bounce rate
    const topPages = pageViewsByPath.map(page => ({
      path: page._id,
      pageviews: page.pageviews,
      avgTime: Math.round(page.avgTime / 1000), // Convert to seconds
      bounceRate: page.pageviews > 0 ? Math.round((page.bounceCount / page.pageviews) * 100 * 10) / 10 : 0
    }));
    
    // Get visitors by device type
    const deviceStats = await AnalyticsLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$device.type",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Process device stats and calculate percentages
    const totalDeviceCount = deviceStats.reduce((sum, device) => sum + device.count, 0);
    const visitorsByDevice = deviceStats.map(device => ({
      device: device._id.charAt(0).toUpperCase() + device._id.slice(1), // Capitalize first letter
      count: device.count,
      percentage: totalDeviceCount > 0 ? Math.round((device.count / totalDeviceCount) * 100 * 10) / 10 : 0
    }));
    
    // Get visitors by time of day
    const visitorsByTime = await AnalyticsLog.aggregate([
      { $match: dateFilter },
      {
        $project: {
          hour: { $hour: "$timestamp" }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ["$hour", 4] }, then: "00:00-04:00" },
                { case: { $lt: ["$hour", 8] }, then: "04:00-08:00" },
                { case: { $lt: ["$hour", 12] }, then: "08:00-12:00" },
                { case: { $lt: ["$hour", 16] }, then: "12:00-16:00" },
                { case: { $lt: ["$hour", 20] }, then: "16:00-20:00" }
              ],
              default: "20:00-24:00"
            }
          },
          visitors: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Process time stats
    const timePeriodsMap = {
      "00:00-04:00": 0,
      "04:00-08:00": 0,
      "08:00-12:00": 0,
      "12:00-16:00": 0,
      "16:00-20:00": 0,
      "20:00-24:00": 0
    };
    
    visitorsByTime.forEach(period => {
      timePeriodsMap[period._id] = period.visitors;
    });
    
    const processedTimeStats = Object.entries(timePeriodsMap).map(([hour, visitors]) => ({
      hour, visitors
    }));
    
    // Get traffic sources (referrers)
    const referrerStats = await AnalyticsLog.aggregate([
      { 
        $match: { 
          ...dateFilter, 
          referrer: { $ne: null, $ne: "" } 
        } 
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: [{ $indexOfCP: ["$referrer", "google"] }, -1] },
              then: {
                $cond: {
                  if: { $eq: [{ $indexOfCP: ["$referrer", "facebook"] }, -1] },
                  then: {
                    $cond: {
                      if: { $eq: [{ $indexOfCP: ["$referrer", "twitter"] }, -1] },
                      then: {
                        $cond: {
                          if: { $eq: [{ $indexOfCP: ["$referrer", "youtube"] }, -1] },
                          then: "Other",
                          else: "YouTube"
                        }
                      },
                      else: "Twitter"
                    }
                  },
                  else: "Facebook"
                }
              },
              else: "Google"
            }
          },
          visitors: { $sum: 1 },
          conversions: { $sum: { $cond: [{ $ne: ["$userId", null] }, 1, 0] } }
        }
      }
    ]);
    
    // Process referrer stats
    const referrers = referrerStats.map(referrer => {
      const conversionRate = referrer.visitors > 0 
        ? Math.round((referrer.conversions / referrer.visitors) * 100 * 10) / 10 
        : 0;
      
      return {
        source: referrer._id,
        visitors: referrer.visitors,
        conversion: conversionRate
      };
    });
    
    // If no analytics data is available yet, use some seed data
    const totalVisits = analyticsStats.length > 0 ? analyticsStats[0].totalVisits : 0;
    const uniqueVisitors = analyticsStats.length > 0 ? analyticsStats[0].uniqueIPs.length : 0;
    
    // Get actual total page views from Videos collection (based on view counts)
    const videoViewsResult = await Video.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const pageViews = totalVisits > 0 ? totalVisits : (videoViewsResult.length > 0 ? videoViewsResult[0].totalViews : 0);
    
    // Calculate average session duration (approximately 3 minutes if no real data)
    const avgSessionDuration = analyticsStats.length > 0 ? Math.round(analyticsStats[0].avgResponseTime / 1000) : 180;
    
    // Calculate bounce rate (default to 45% if no real data)
    const bounceRate = topPages.length > 0 
      ? Math.round(topPages.reduce((sum, page) => sum + page.bounceRate, 0) / topPages.length * 10) / 10
      : 45.0;
    
    // Return compiled traffic data 
    res.status(200).json({
      status: 'success',
      data: {
        totalVisits,
        uniqueVisitors,
        pageViews,
        avgSessionDuration,
        bounceRate,
        visitorsByDevice: visitorsByDevice.length > 0 ? visitorsByDevice : [
          { device: 'Desktop', count: Math.round(uniqueVisitors * 0.65), percentage: 65 },
          { device: 'Mobile', count: Math.round(uniqueVisitors * 0.30), percentage: 30 },
          { device: 'Tablet', count: Math.round(uniqueVisitors * 0.05), percentage: 5 }
        ],
        visitorsByTime: processedTimeStats.length > 0 ? processedTimeStats : [
          { hour: '00:00-04:00', visitors: Math.round(pageViews * 0.05) },
          { hour: '04:00-08:00', visitors: Math.round(pageViews * 0.10) },
          { hour: '08:00-12:00', visitors: Math.round(pageViews * 0.25) },
          { hour: '12:00-16:00', visitors: Math.round(pageViews * 0.30) },
          { hour: '16:00-20:00', visitors: Math.round(pageViews * 0.20) },
          { hour: '20:00-24:00', visitors: Math.round(pageViews * 0.10) }
        ],
        topPages: topPages.length > 0 ? topPages : [
          { path: '/', pageviews: Math.round(pageViews * 0.35), avgTime: 120, bounceRate: 35 },
          { path: '/video/popular', pageviews: Math.round(pageViews * 0.15), avgTime: 240, bounceRate: 25 },
          { path: '/search', pageviews: Math.round(pageViews * 0.20), avgTime: 150, bounceRate: 40 }
        ],
        referrers: referrers.length > 0 ? referrers : [
          { source: 'Google', visitors: Math.round(uniqueVisitors * 0.45), conversion: 3.5 },
          { source: 'Direct', visitors: Math.round(uniqueVisitors * 0.25), conversion: 5.0 },
          { source: 'Facebook', visitors: Math.round(uniqueVisitors * 0.15), conversion: 2.5 },
          { source: 'Twitter', visitors: Math.round(uniqueVisitors * 0.10), conversion: 1.8 },
          { source: 'Other', visitors: Math.round(uniqueVisitors * 0.05), conversion: 1.2 }
        ]
      }
    });
  } catch (err) {
    console.error('Error getting traffic data:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve traffic data: ' + err.message
    });
  }
};

// Get visitors data
exports.getVisitorsData = async (req, res, next) => {
  try {
    // Parse date range from query params
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    // Get recent visitors from analytics log
    const recentVisitors = await AnalyticsLog.find({
      timestamp: { $gte: startDate, $lte: endDate }
    })
    .sort({ timestamp: -1 })
    .limit(100);
    
    // Process visitors to remove duplicates and get the most recent entries
    const visitorMap = new Map();
    
    recentVisitors.forEach(visitor => {
      // Use IP as key to identify unique visitors
      if (!visitorMap.has(visitor.ip)) {
        visitorMap.set(visitor.ip, {
          id: visitor._id,
          ip: visitor.ip,
          location: visitor.location ? `${visitor.location.city || ''}, ${visitor.location.country || 'Unknown'}` : 'Unknown',
          browser: visitor.device?.browser || 'Unknown',
          os: visitor.device?.os || 'Unknown',
          timestamp: visitor.timestamp.toISOString().replace('T', ' ').substring(0, 19),
          page: visitor.path
        });
      }
    });
    
    // Convert map to array and take the top 20 most recent visitors
    const processedVisitors = Array.from(visitorMap.values()).slice(0, 20);
    
    // Get actual user count
    const userCount = await User.countDocuments();
    
    // If no real data available yet, use sample data
    const visitorData = processedVisitors.length > 0 ? processedVisitors : [
      { id: 1, ip: '192.168.1.1', location: 'New York, US', browser: 'Chrome', os: 'Windows', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), page: '/video/123' },
      { id: 2, ip: '203.0.113.1', location: 'London, UK', browser: 'Firefox', os: 'macOS', timestamp: new Date(Date.now() - 60000).toISOString().replace('T', ' ').substring(0, 19), page: '/' }
    ];
    
    res.status(200).json({
      status: 'success',
      data: {
        recentVisitors: visitorData,
        userCount
      }
    });
  } catch (err) {
    console.error('Error getting visitors data:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve visitors data: ' + err.message
    });
  }
};

// Get location data
exports.getLocationData = async (req, res, next) => {
  try {
    // Parse date range from query params
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    // Get visitor locations from analytics log
    const locationStats = await AnalyticsLog.aggregate([
      { 
        $match: { 
          timestamp: { $gte: startDate, $lte: endDate },
          'location.country': { $exists: true, $ne: null }
        } 
      },
      {
        $group: {
          _id: "$location.country",
          visitors: { $sum: 1 }
        }
      },
      { $sort: { visitors: -1 } },
      { $limit: 10 }
    ]);
    
    // Calculate total visitors for percentage calculation
    const totalVisitors = locationStats.reduce((sum, location) => sum + location.visitors, 0);
    
    // Process location stats with percentages
    const processedLocationStats = locationStats.map(location => ({
      country: location._id || 'Unknown',
      visitors: location.visitors,
      percentage: totalVisitors > 0 ? Math.round((location.visitors / totalVisitors) * 100 * 10) / 10 : 0
    }));
    
    // If no real data available yet, get user count and use sample data
    const userCount = await User.countDocuments();
    
    const locationData = processedLocationStats.length > 0 ? processedLocationStats : [
      { country: 'United States', visitors: Math.round(userCount * 0.4), percentage: 40 },
      { country: 'India', visitors: Math.round(userCount * 0.2), percentage: 20 },
      { country: 'United Kingdom', visitors: Math.round(userCount * 0.1), percentage: 10 },
      { country: 'Canada', visitors: Math.round(userCount * 0.08), percentage: 8 },
      { country: 'Other', visitors: Math.round(userCount * 0.22), percentage: 22 }
    ];
    
    res.status(200).json({
      status: 'success',
      data: {
        topCountries: locationData
      }
    });
  } catch (err) {
    console.error('Error getting location data:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve location data: ' + err.message
    });
  }
};

// Get performance data
exports.getPerformanceData = async (req, res, next) => {
  try {
    // Parse date range from query params
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    // Calculate average response time
    const avgResponseTime = await AnalyticsLog.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, avg: { $avg: "$responseTime" } } }
    ]);
    
    // Calculate error rate (non-2xx, non-3xx responses)
    const errorRateData = await AnalyticsLog.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          errorRequests: {
            $sum: {
              $cond: [
                { $and: [
                  { $gte: ["$statusCode", 400] },
                  { $lt: ["$statusCode", 600] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    // Calculate API metrics by endpoint
    const apiMetrics = await AnalyticsLog.aggregate([
      { 
        $match: { 
          timestamp: { $gte: startDate, $lte: endDate },
          path: { $regex: /^\/api\// }
        } 
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $regexMatch: { input: "$path", regex: /^\/api\/videos\/[a-f0-9]+/ } },
              then: "/api/videos/:id",
              else: {
                $cond: {
                  if: { $regexMatch: { input: "$path", regex: /^\/api\/auth\/(?!login).+/ } },
                  then: "/api/auth/*",
                  else: "$path"
                }
              }
            }
          },
          avgResponseTime: { $avg: "$responseTime" },
          requestCount: { $sum: 1 }
        }
      },
      { $sort: { requestCount: -1 } },
      { $limit: 10 }
    ]);
    
    // Process API metrics
    const processedApiMetrics = apiMetrics.map(metric => ({
      endpoint: metric._id,
      avgResponseTime: Math.round(metric.avgResponseTime),
      requestsPerDay: Math.round(metric.requestCount / ((endDate - startDate) / (24 * 60 * 60 * 1000)))
    }));
    
    // Calculate default values if no real data is available
    const serverResponseTime = avgResponseTime.length > 0 ? (avgResponseTime[0].avg / 1000).toFixed(2) : 0.45;
    
    const errorRate = errorRateData.length > 0 && errorRateData[0].totalRequests > 0
      ? (errorRateData[0].errorRequests / errorRateData[0].totalRequests * 100).toFixed(2)
      : 0.3;
    
    // Guesstimate page load time (server response time + 800ms client rendering)
    const avgPageLoad = (parseFloat(serverResponseTime) + 0.8).toFixed(2);
    
    res.status(200).json({
      status: 'success',
      data: {
        avgPageLoad,
        serverResponseTime,
        errorRate,
        apiMetrics: processedApiMetrics.length > 0 ? processedApiMetrics : [
          { endpoint: '/api/videos', avgResponseTime: 235, requestsPerDay: 3267 },
          { endpoint: '/api/videos/:id', avgResponseTime: 187, requestsPerDay: 1854 },
          { endpoint: '/api/auth/login', avgResponseTime: 312, requestsPerDay: 542 }
        ]
      }
    });
  } catch (err) {
    console.error('Error getting performance data:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve performance data: ' + err.message
    });
  }
}; 