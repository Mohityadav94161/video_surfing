const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    token,
    expiresIn,
    data: {
      user,
    },
  });
};

// Register a new user
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use',
      });
    }

    // Create user with role 'user' by default
    const newUser = await User.create({
      username,
      email,
      password,
      role: 'user', // Default role
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error signing up user',
    });
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
    }

    // If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error logging in user',
    });
  }
};

// Create admin user (for development purposes)
exports.createAdmin = async (req, res, next) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        status: 'fail',
        message: 'This route is only available in development mode',
      });
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
    res.status(500).json({
      status: 'error',
      message: 'Error creating admin user',
    });
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error getting user data',
    });
  }
}; 