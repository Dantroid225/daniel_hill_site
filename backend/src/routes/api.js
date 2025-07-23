const express = require('express');
const router = express.Router();
const { generateSitemap } = require('../utils/sitemapGenerator');

console.log('Loading API routes...');

// Import route modules
const portfolioRoutes = require('./portfolio');
const contactRoutes = require('./contact');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');

console.log('Route modules loaded successfully');

// Route definitions
router.use('/portfolio', portfolioRoutes);
router.use('/contact', contactRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// Sitemap route
router.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await generateSitemap();
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

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
      sitemap: '/api/sitemap.xml',
    },
  });
});

module.exports = router;
