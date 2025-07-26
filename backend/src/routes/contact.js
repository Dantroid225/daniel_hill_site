const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validateContactForm } = require('../middleware/validation');
const { validateToken } = require('../middleware/csrf');

// Contact routes
router.post(
  '/submit',
  validateToken,
  validateContactForm,
  contactController.submitContactForm
);
router.get('/inquiries', contactController.getAllInquiries);
router.get('/inquiries/:id', contactController.getInquiryById);
router.put(
  '/inquiries/:id/status',
  validateToken,
  contactController.updateInquiryStatus
);

module.exports = router;
