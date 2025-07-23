const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuthController");
const portfolioController = require("../controllers/portfolioController");
const { authenticateAdmin } = require("../middleware/adminAuth");
const {
  upload,
  processImage,
  handleUploadError,
} = require("../middleware/upload");

// Admin authentication routes
router.post("/login", adminAuthController.login);
router.post("/logout", authenticateAdmin, adminAuthController.logout);
router.get("/profile", authenticateAdmin, adminAuthController.getProfile);
router.put(
  "/change-password",
  authenticateAdmin,
  adminAuthController.changePassword
);
router.post(
  "/create-admin",
  authenticateAdmin,
  adminAuthController.createAdmin
);

// Admin portfolio management routes
router.get("/portfolio", authenticateAdmin, portfolioController.getAllItems);
router.post(
  "/portfolio",
  authenticateAdmin,
  upload.single("image"),
  processImage,
  handleUploadError,
  portfolioController.createItem
);
router.put(
  "/portfolio/:id",
  authenticateAdmin,
  upload.single("image"),
  processImage,
  handleUploadError,
  portfolioController.updateItem
);
router.delete(
  "/portfolio/:id",
  authenticateAdmin,
  portfolioController.deleteItem
);
router.put(
  "/portfolio/reorder",
  authenticateAdmin,
  portfolioController.reorderItems
);
router.put(
  "/portfolio/:id/featured",
  authenticateAdmin,
  portfolioController.toggleFeatured
);
router.put(
  "/portfolio/:id/status",
  authenticateAdmin,
  portfolioController.updateStatus
);

// Get archived images (for admin management)
router.get(
  "/archived-images",
  authenticateAdmin,
  portfolioController.getArchivedImages
);

module.exports = router;
