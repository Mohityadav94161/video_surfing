const express = require('express');
const homeSectionController = require('../controllers/homeSectionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes - accessible to all users
router.get('/active', homeSectionController.getActiveSections);

// Protected routes - require admin authentication
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

// Admin CRUD operations for sections
router.route('/')
  .get(homeSectionController.getAllSections)
  .post(homeSectionController.createSection);

router.route('/:id')
  .get(homeSectionController.getSection)
  .patch(homeSectionController.updateSection)
  .delete(homeSectionController.deleteSection);

// Special operations for sections
router.post('/reorder', homeSectionController.reorderSections);
router.post('/:id/add-videos', homeSectionController.addVideosToSection);
router.post('/:id/remove-videos', homeSectionController.removeVideosFromSection);

module.exports = router; 