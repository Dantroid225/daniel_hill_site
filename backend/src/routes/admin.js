const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const portfolioController = require('../controllers/portfolioController');
const { authenticateAdmin } = require('../middleware/adminAuth');
const { validateToken } = require('../middleware/csrf');
const {
  upload,
  processImage,
  handleUploadError,
} = require('../middleware/upload');
const {
  validateAdminLogin,
  validatePortfolioItem,
} = require('../middleware/validation');

// Admin authentication routes
router.post('/login', validateAdminLogin, adminAuthController.login);
router.post(
  '/logout',
  authenticateAdmin,
  validateToken,
  adminAuthController.logout
);
router.get('/profile', authenticateAdmin, adminAuthController.getProfile);
router.put(
  '/change-password',
  authenticateAdmin,
  validateToken,
  adminAuthController.changePassword
);
router.post(
  '/create-admin',
  authenticateAdmin,
  validateToken,
  adminAuthController.createAdmin
);

// Admin portfolio management routes
router.get('/portfolio', authenticateAdmin, portfolioController.getAllItems);
router.post(
  '/portfolio',
  authenticateAdmin,
  validateToken,
  upload.single('image'),
  processImage,
  handleUploadError,
  validatePortfolioItem,
  portfolioController.createItem
);
router.put(
  '/portfolio/:id',
  authenticateAdmin,
  validateToken,
  upload.single('image'),
  processImage,
  handleUploadError,
  validatePortfolioItem,
  portfolioController.updateItem
);
router.delete(
  '/portfolio/:id',
  authenticateAdmin,
  validateToken,
  portfolioController.deleteItem
);
router.put(
  '/portfolio/reorder',
  authenticateAdmin,
  validateToken,
  portfolioController.reorderItems
);
router.put(
  '/portfolio/:id/featured',
  authenticateAdmin,
  validateToken,
  portfolioController.toggleFeatured
);
router.put(
  '/portfolio/:id/status',
  authenticateAdmin,
  validateToken,
  portfolioController.updateStatus
);

// Get archived images (for admin management)
router.get(
  '/archived-images',
  authenticateAdmin,
  portfolioController.getArchivedImages
);

module.exports = router;
