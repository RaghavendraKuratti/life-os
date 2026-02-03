const { db, admin } = require('../config/firebase');
const { todayISO, daysAgo, daysAgoDate, todayString } = require('../utils/dateUtils');

async function updateStreak(uid) {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const data = userSnap.data();
    if (!data) {
        throw new Error("User not found");
    }
    
    //Streaks
    let streaks = data.streaks || {};
    streaks["lastCheckin"] = (streaks["lastCheckin"] || todayString());
    if (streaks.lastCheckin === daysAgoDate()) {
        streaks["checkinDays"] = (streaks["checkinDays"] || 0) + 1;
    } else if (streaks.lastCheckin == todayString()) {
        // Already Checked in
    } else {
        streaks["checkinDays"] = 1;
    }
    console.log("Streaks ", streaks);
    streaks["lastCheckin"] = todayString();
    streaks["highestScore"] = Math.max(streaks["checkinDays"], (streaks["highestScore"] || 0));
    await userRef.update({
        streaks
    })
    return streaks;
}

async function updateMeditationStreak(uid) {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const data = userSnap.data();
    if (!data) {
        throw new Error("User not found");
    }
    
    // Streaks with weekly grace skip logic
    let streaks = data.meditationStreaks || {
        checkinDays: 0,
        highestScore: 0,
        lastCheckin: null,
        weeklyGraceUsed: false,
        lastGraceWeek: null
    };
    
    const today = todayString();
    const yesterday = daysAgoDate(1);
    const lastCheckin = streaks.lastCheckin;
    
    // Calculate current week number (ISO week)
    const currentWeek = getISOWeek(new Date());
    const lastGraceWeek = streaks.lastGraceWeek || 0;
    
    // Reset weekly grace if new week
    if (currentWeek !== lastGraceWeek) {
        streaks.weeklyGraceUsed = false;
    }
    
    if (!lastCheckin) {
        // First time checking in
        streaks.checkinDays = 1;
    } else if (lastCheckin === today) {
        // Already checked in today - don't increment
        streaks.checkinDays = streaks.checkinDays || 1;
    } else if (lastCheckin === yesterday) {
        // Consecutive day - increment streak
        streaks.checkinDays = (streaks.checkinDays || 0) + 1;
    } else {
        // Missed day(s) - check if we can use grace skip
        const daysMissed = getDaysDifference(lastCheckin, today);
        
        if (daysMissed === 2 && !streaks.weeklyGraceUsed) {
            // Missed exactly 1 day and grace available - use grace skip
            streaks.checkinDays = (streaks.checkinDays || 0) + 1;
            streaks.weeklyGraceUsed = true;
            streaks.lastGraceWeek = currentWeek;
            streaks.graceSkipUsedDate = today;
        } else {
            // Streak broken - reset to 1
            streaks.checkinDays = 1;
        }
    }
    
    streaks.lastCheckin = today;
    streaks.highestScore = Math.max(streaks.checkinDays, (streaks.highestScore || 0));
    
    await userRef.update({
        meditationStreaks: streaks
    });
    
    return streaks;
}

/**
 * Get ISO week number for a date
 */
function getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Get difference in days between two date strings
 */
function getDaysDifference(date1Str, date2Str) {
    const date1 = new Date(date1Str);
    const date2 = new Date(date2Str);
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}


async function saveUserAverages(userId, selfRating, key) {
    try {
        const ref = db.collection("users")
            .doc(userId)
            .collection(key)
            .doc(todayString());
        return db.runTransaction(async (t) => {
            const doc = await t.get(ref);
            if (!doc.exists) {
                t.set(ref, {
                    total: +selfRating,
                    count: 1,
                    average: +selfRating,
                    lastUpdated: todayISO()
                })
            } else {
                const data = doc.data();
                const newTotal = data.total + +selfRating;
                const newCount = data.count + 1;
                const newAvg = newTotal/newCount;

                t.update(ref, {
                    total: newTotal,
                    count: newCount,
                    average: newAvg,
                    lastUpdated: todayISO()
                })
            }
        })
    } catch(ex) {
        throw ex;
    }
}

module.exports = { updateStreak, saveUserAverages, updateMeditationStreak };