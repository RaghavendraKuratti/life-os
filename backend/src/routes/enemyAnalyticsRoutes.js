const express = require("express");
const { getUserEnemyAnalytics, getWeeklyBreakdown } = require("../controllers/enemyAnalyticsController");
const router = express.Router();

// Get enemy analytics for a user
// Query params: days (default: 30)
router.get("/:userId", getUserEnemyAnalytics);

// Get weekly enemy breakdown
router.get("/:userId/weekly", getWeeklyBreakdown);

module.exports = router;