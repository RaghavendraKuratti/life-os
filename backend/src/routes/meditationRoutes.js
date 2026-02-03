const express = require("express");
const { saveMeditation, fetchMeditation } = require("../controllers/meditationController");
const router = express.Router();

router.post('/', saveMeditation);
router.get('/:userId', fetchMeditation);

module.exports = router;

