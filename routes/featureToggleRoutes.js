const express = require("express");
const router = express.Router();

const {
  getFeatureToggle,
  updateFeatureToggle,
} = require("../controllers/featureToggleController");

const { authenticateToken } = require("../middleware/authMiddleware");

// Get Feature Toggles
router.get("/", getFeatureToggle);

// Update Feature Toggles (Admin)
router.put("/", authenticateToken, updateFeatureToggle);

module.exports = router;
