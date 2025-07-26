const express = require('express');
const router = express.Router();
const { generateToken } = require('../middleware/csrf');

console.log('Loading API routes...');

// Import route modules
const portfolioRoutes = require('./portfolio');
const contactRoutes = require('./contact');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');

console.log('Route modules loaded successfully');

// CSRF token generation route
router.get('/csrf-token', generateToken);

// Route definitions
router.use('/portfolio', portfolioRoutes);
router.use('/contact', contactRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

console.log('All routes registered');

// Default API route
router.get('/', (req, res) => {
  res.json({
    message: 'DH Portfolio API',
    version: '1.0.0',
    endpoints: {
      portfolio: '/api/portfolio',
      contact: '/api/contact',
      auth: '/api/auth',
      admin: '/api/admin',
      csrf: '/api/csrf-token',
    },
  });
});

module.exports = router;
