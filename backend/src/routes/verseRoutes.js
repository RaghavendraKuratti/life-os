const express = require("express");
const { getVerse, getDailyInsightForUser, getContextualInsightForUser, markShlokaAsRead, getShlokaReadStatus } = require("../controllers/verseController");
const router = express.Router();

router.get("/today", getVerse);
router.get("/insight/:userId", getDailyInsightForUser);
router.get("/contextual/:userId", getContextualInsightForUser);
router.post("/mark-read", markShlokaAsRead);
router.get("/read-status/:userId/:date", getShlokaReadStatus);

module.exports = router;