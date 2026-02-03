const express = require("express");
const { getDailyEnemy } = require("../controllers/enemyOfDayController");
const router = express.Router();

router.get("/today", getDailyEnemy);

module.exports = router;