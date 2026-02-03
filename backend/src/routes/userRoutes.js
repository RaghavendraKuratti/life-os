const express = require("express");
const { streak, progress, updateUserInfo, fetchUserInfo, createUserInfo, initUserInfo } = require("../controllers/userController");
const router = express.Router();

router.get("/streak/:userId", streak);
router.post("/progress/:userId", progress);
router.put("/info/:userId", updateUserInfo);
router.get("/info/:userId", fetchUserInfo);
router.post("/info", initUserInfo);

module.exports = router;