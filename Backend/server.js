const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { logRequest } = require('./middleware/analyticsMiddleware');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const homeSectionRoutes = require('./routes/homeSectionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const collectionRoutes = require('./routes/collectionRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Configure trust proxy - Fix for express-rate-limit
app.set('trust proxy', 1); // trust first proxy

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Session configuration for tracking user sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'video-surfing-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Track page views for bounce rate calculation
app.use((req, res, next) => {
  if (req.session) {
    if (!req.session.pageViews) {
      req.session.pageViews = [];
    }
    req.session.pageViews.push({
      path: req.originalUrl,
      timestamp: new Date()
    });
  }
  next();
});

// Analytics logging
app.use(logRequest);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/home-sections', homeSectionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/collections', collectionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 