const express = require("express");
const { getWeeklyInsights } = require("../controllers/insightsController");
const router = express.Router();

router.get("/weekly/:userId", getWeeklyInsights);

module.exports = router;