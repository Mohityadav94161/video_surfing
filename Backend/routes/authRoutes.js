const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const captchaMiddleware = require('../middleware/captchaMiddleware');

const router = express.Router();

// Public routes with captcha protection
router.post('/signup', captchaMiddleware.requireCaptcha, authController.signup);
router.post('/login', captchaMiddleware.requireCaptcha, authController.login);

// Protected routes
router.get('/me', authMiddleware.protect, authController.getMe);

// Admin only route - for development
router.post('/create-admin', authController.createAdmin);

module.exports = router;