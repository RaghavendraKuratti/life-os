const express = require("express");
const {
    saveCheckIn,
    weeklyStats,
    addJournel,
    getJournalPrompts,
    getTriggers,
    getJournalEntriesController,
    getJournalAnalyticsController
} = require("../controllers/checkinController");
const router = express.Router();

router.post("/:userId", saveCheckIn);
router.get("/weekly/:userId", weeklyStats);
router.post("/journel/:userId", addJournel);
router.get("/journel/entries/:userId", getJournalEntriesController);
router.get("/journel/analytics/:userId", getJournalAnalyticsController);
router.get("/prompts/:enemy", getJournalPrompts);
router.get("/triggers/:enemy", getTriggers);

module.exports = router;
