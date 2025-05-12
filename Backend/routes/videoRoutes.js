const express = require('express');
const videoController = require('../controllers/videoController');
const commentController = require('../controllers/commentController');
const reactionController = require('../controllers/reactionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', videoController.getAllVideos);
router.get('/categories', videoController.getCategories);
router.get('/tags', videoController.getPopularTags);

// Protected routes (require authentication)
router.use('/stats', authMiddleware.protect);
router.use('/stats', authMiddleware.restrictTo('admin'));
router.get('/stats', videoController.getVideoStats);

// Dynamic ID routes - must be placed after all specific routes
router.get('/:id', videoController.getVideo);

// Comment routes (public GET, authenticated POST/DELETE)
router.get('/:videoId/comments', commentController.getComments);

// Reaction routes (public GET, authenticated POST)
router.get('/:videoId/reactions', reactionController.getReactionStats);

// Protected routes (require authentication)
router.use(authMiddleware.protect);

// Comment and reaction routes that require authentication
router.post('/:videoId/comments', commentController.addComment);
router.delete('/comments/:id', commentController.deleteComment);
router.post('/:videoId/reactions', reactionController.toggleReaction);

// Admin only routes
router.use(authMiddleware.restrictTo('admin'));

// Move admin stats route to be above the dynamic routes
router.post('/extract-metadata', videoController.extractMetadata);
router.post('/', videoController.addVideo);
router.patch('/:id', videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);

module.exports = router; 