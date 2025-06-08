const express = require('express');
const captchaController = require('../controllers/captchaController');

const router = express.Router();

// Generate a new captcha
router.get('/generate', captchaController.generateCaptcha);

// Verify a captcha
router.post('/verify', captchaController.verifyCaptcha);

// Check if captcha is required
router.get('/check-required', captchaController.checkCaptchaRequired);

module.exports = router; 