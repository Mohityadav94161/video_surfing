const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes - require admin authentication
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

// Analytics data endpoints
router.get('/traffic', analyticsController.getTrafficData);
router.get('/visitors', analyticsController.getVisitorsData);
router.get('/location', analyticsController.getLocationData);
router.get('/performance', analyticsController.getPerformanceData);

module.exports = router; 