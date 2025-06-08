const express = require('express');
const supportController = require('../controllers/supportController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public route for creating a submission
router.post('/submissions', supportController.createSubmission);

// Admin only routes
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

// Get all submissions with pagination and filtering
router.get('/submissions', supportController.getAllSubmissions);

// Get submission statistics
router.get('/stats', supportController.getSubmissionStats);

// Get, update, or delete a specific submission
router.route('/submissions/:id')
  .get(supportController.getSubmission)
  .patch(supportController.updateSubmissionStatus)
  .delete(supportController.deleteSubmission);

module.exports = router; 