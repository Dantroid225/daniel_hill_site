const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/refresh-token', authController.refreshToken);
router.post(
  '/revoke-tokens/:userId',
  authenticateToken,
  authController.revokeAllTokens
);

module.exports = router;
