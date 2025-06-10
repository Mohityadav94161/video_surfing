const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function for consistent response format
const sendResponse = (req, res, statusCode, message, data) => {
  return res.status(statusCode).json({
    status: statusCode >= 400 ? 'error' : 'success',
    message,
    data
  });
};

// Function to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d', // Default to 7 days if not specified in env
  });
};

// Create and send JWT token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Calculate token expiry for response
  const tokenExpiry = process.env.JWT_EXPIRES_IN || '7d';
  let expiresIn = 7 * 24 * 60 * 60 * 1000; // Default to 7 days in milliseconds
  
  if (typeof tokenExpiry === 'string') {
    const unit = tokenExpiry.slice(-1);
    const value = parseInt(tokenExpiry);
    
    if (unit === 'd') expiresIn = value * 24 * 60 * 60 * 1000;
    else if (unit === 'h') expiresIn = value * 60 * 60 * 1000;
    else if (unit === 'm') expiresIn = value * 60 * 1000;
  }
  
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    message: "Authentication successful",
    data: {
      user,
      token,
      expiresIn
    }
  });
};

// Register a new user
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return sendResponse(req, res, 400, "Username already in use", null);
    }

    // Create user with role 'user' by default
    const newUser = await User.create({
      username,
      email: "", // Set email to empty string instead of undefined
      password,
      role: 'user', // Default role
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error(err);
    return sendResponse(req, res, 500, "Error signing up user", null);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if email and password exist
    if (!username || !password) {
      return sendResponse(req, res, 400, "Please provide username and password", null);
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ username }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return sendResponse(req, res, 401, "Incorrect username or password", null);
    }

    // If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    console.error(err);
    return sendResponse(req, res, 500, "Error logging in user", null);
  }
};

// Create admin user (for development purposes)
exports.createAdmin = async (req, res, next) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV !== 'development') {
      return sendResponse(req, res, 403, "This route is only available in development mode", null);
    }

    const { username, email, password } = req.body;

    // Create admin user
    const adminUser = await User.create({
      username,
      email,
      password,
      role: 'admin',
    });

    createSendToken(adminUser, 201, res);
  } catch (err) {
    console.error(err);
    return sendResponse(req, res, 500, "Error creating admin user", null);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return sendResponse(req, res, 200, "User data retrieved successfully", { user });
  } catch (err) {
    console.error(err);
    return sendResponse(req, res, 500, "Error getting user data", null);
  }
}; 