const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Utility function to create error
const createError = (status, message) => {
  const error = new Error(message);
  error.statusCode = status;
  return error;
};

// Protect routes - check if user is logged in
exports.protect = async (req, res, next) => {
  try {
    // 1) Check if token exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(createError(401, 'You are not logged in. Please log in to get access.'));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(createError(401, 'The user belonging to this token no longer exists.'));
    }

    // 4) Check if user is active
    if (!currentUser.active) {
      return next(createError(401, 'This user account has been deactivated.'));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(createError(401, 'Invalid token. Please log in again.'));
    }
    if (err.name === 'TokenExpiredError') {
      return next(createError(401, 'Your token has expired. Please log in again.'));
    }
    next(err);
  }
};

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(createError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
}; 