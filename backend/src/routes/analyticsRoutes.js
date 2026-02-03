const express = require('express');
const router = express.Router();
const {
    getSummary,
    getIntensityTrend,
    getTriggers,
    getTimePatterns,
    getComprehensive
} = require('../controllers/analyticsController');

// Summary statistics
router.get('/summary/:userId', getSummary);

// Intensity trend over time
router.get('/intensity-trend/:userId', getIntensityTrend);

// Trigger frequency analysis
router.get('/triggers/:userId', getTriggers);

// Time-of-day patterns
router.get('/time-patterns/:userId', getTimePatterns);

// Comprehensive analytics (all in one)
router.get('/comprehensive/:userId', getComprehensive);

module.exports = router;