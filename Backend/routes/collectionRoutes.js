const express = require('express');
const collectionController = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All collection routes require authentication
router.use(authMiddleware.protect);

// Basic collection routes
router.get('/', collectionController.getUserCollections);
router.post('/', collectionController.createCollection);
router.get('/stats', collectionController.getUserCollectionStats);
router.get('/:id', collectionController.getCollection);
router.patch('/:id', collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);

// Routes for managing videos in collections
router.post('/:id/videos', collectionController.addVideoToCollection);
router.delete('/:id/videos/:videoId', collectionController.removeVideoFromCollection);

module.exports = router; 