const express = require('express');
const router = express.Router();

// Import route modules
const portfolioRoutes = require('./portfolio');
const contactRoutes = require('./contact');
const authRoutes = require('./auth');

// Route definitions
router.use('/portfolio', portfolioRoutes);
router.use('/contact', contactRoutes);
router.use('/auth', authRoutes);

// Default API route
router.get('/', (req, res) => {
  res.json({
    message: 'DH Portfolio API',
    version: '1.0.0',
    endpoints: {
      portfolio: '/api/portfolio',
      contact: '/api/contact',
      auth: '/api/auth'
    }
  });
});

module.exports = router; 