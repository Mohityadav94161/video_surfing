const mongoose = require('mongoose');

const captchaSchema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
      index: true
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    value: {
      type: String,
      required: [true, 'Captcha value is required']
    },
    verified: {
      type: Boolean,
      default: false
    },
    failedAttempts: {
      type: Number,
      default: 0
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    lastFailedAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration time is required']
    },
    endpoint: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for cleanup of expired captchas
captchaSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to check if IP is blocked
captchaSchema.statics.isIPBlocked = async function(ipAddress) {
  const captcha = await this.findOne({ 
    ipAddress, 
    isBlocked: true,
    expiresAt: { $gt: new Date() }
  });
  
  return !!captcha;
};

// Static method to check for unusual activity
captchaSchema.statics.hasUnusualActivity = async function(ipAddress) {
  // Check recent failed attempts
  const recentFailure = await this.findOne({
    ipAddress,
    verified: false,
    failedAttempts: { $gt: 3 },
    lastFailedAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
  });
  
  if (recentFailure) return true;
  
  // Check request rate (more than 20 requests in the last minute)
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const requestCount = await this.countDocuments({
    ipAddress,
    createdAt: { $gt: oneMinuteAgo }
  });
  
  if (requestCount > 40) return true;
  
  // Check for endpoint switching pattern (more than 10 different endpoints in a minute)
  const distinctEndpoints = await this.distinct('endpoint', {
    ipAddress,
    endpoint: { $ne: null },
    createdAt: { $gt: oneMinuteAgo }
  });
  
  if (distinctEndpoints.length > 10) return true;
  
  return false;
};

const Captcha = mongoose.model('Captcha', captchaSchema);

module.exports = Captcha; 