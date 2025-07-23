const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");

// Portfolio routes (public)
router.get("/", portfolioController.getAllPortfolioItems);
router.get("/:id", portfolioController.getPortfolioItemById);

module.exports = router;
