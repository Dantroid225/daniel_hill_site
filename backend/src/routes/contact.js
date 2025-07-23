const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Contact routes
router.post('/submit', contactController.submitContactForm);
router.get('/inquiries', contactController.getAllInquiries);
router.get('/inquiries/:id', contactController.getInquiryById);
router.put('/inquiries/:id/status', contactController.updateInquiryStatus);

module.exports = router; 