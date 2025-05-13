const mongoose = require('mongoose');

const analyticsLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: {
      type: String,
      required: [true, 'IP address is required']
    },
    userAgent: {
      type: String
    },
    path: {
      type: String,
      required: [true, 'Request path is required']
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    },
    statusCode: {
      type: Number
    },
    responseTime: {
      type: Number, // in milliseconds
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    location: {
      country: String,
      city: String,
      lat: Number,
      lng: Number
    },
    referrer: {
      type: String
    },
    device: {
      type: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'other']
      },
      browser: String,
      os: String
    }
  },
  { timestamps: true }
);

// Index for efficient querying
analyticsLogSchema.index({ timestamp: -1 });
analyticsLogSchema.index({ path: 1 });
analyticsLogSchema.index({ ip: 1 });
analyticsLogSchema.index({ 'location.country': 1 });

const AnalyticsLog = mongoose.model('AnalyticsLog', analyticsLogSchema);

module.exports = AnalyticsLog; 