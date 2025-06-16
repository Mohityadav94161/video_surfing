const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes below this middleware are protected
router.use(authMiddleware.protect);

// User profile routes
router.patch('/updateMe', userController.updateMe);
router.patch('/updatePassword', userController.updatePassword);
router.patch('/updateAvatar', userController.updateAvatar);
router.delete('/deleteMe', userController.deleteMe);

module.exports = router;