const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { validateContactForm } = require("../middleware/validation");

// Contact routes
router.post(
  "/submit",
  validateContactForm,
  contactController.submitContactForm
);
router.get("/inquiries", contactController.getAllInquiries);
router.get("/inquiries/:id", contactController.getInquiryById);
router.put("/inquiries/:id/status", contactController.updateInquiryStatus);

module.exports = router;
