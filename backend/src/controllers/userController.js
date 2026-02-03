const { updateStreak } = require("../services/streakService");
const { fetchProgress, saveUserInfo, getUserInfo, createUserInfo } = require("../services/userService");
async function streak(req, res) {
    try {
        const { userId } = req.params;
        
        const streak = await updateStreak(userId);
        res.json({ success: true, streak });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
}
async function progress(req, res) {
    try {
        const { userId } = req.params;
        const { key, progressReq } = req.body;
        const data = await fetchProgress(userId, key, progressReq);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
}

async function updateUserInfo(req, res) {
    try {
        const { userId } = req.params;
        const {
            firstName,
            lastName,
            contact,
            profilePic,
            dailyReminder,
            reminderTime,
            jounralingReminder,
            defaultEnemy,
            darkMode,
            notifications,
            meditationSound
          } = req.body;
        let response = await saveUserInfo(userId, req.body);
        res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ success: false, error: error.message })
    }
}

async function fetchUserInfo(req, res) {
    try {
        const { userId } = req.params;
        let response = await getUserInfo(userId);
        res.status(200).json(response);
    } catch(error) {
        res.status(500).json({ success: false, error: error.message })
    }
}

async function initUserInfo(req, res) {
    try {
        let response = await createUserInfo(req.body);
        res.status(201).json(response);
    } catch(ex) {
        throw ex;
    }
}

module.exports = { streak, progress, updateUserInfo, fetchUserInfo, initUserInfo };