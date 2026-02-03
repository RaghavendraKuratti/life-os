const { Timestamp } = require("firebase-admin/firestore");
const { saveCheckin, aggregateWeekly, saveJournel, getJournalEntries, getJournalAnalytics } = require("../services/checkinService");
const { todayString, daysAgo, daysAgoTS } = require("../utils/dateUtils");
const { saveUserAverages } = require("../services/streakService");
const { getPromptsForEnemy, validateJournalEntry } = require("../services/journalPromptsService");
const { getTriggersForEnemy } = require("../data/enemyTriggers");
// async function saveCheckIn(req, res) {
//     try {
//         const { userId, responses } = req.body;
//         console.log("saveCheckIn", userId, responses, req.body);
        
//         await saveCheckin(userId, responses);
//         res.json({ ok: true })
//     } catch (e) {
//         res.status(500).json({ error: e.message });
//     }
// }
async function saveCheckIn(req, res) {
    try {
        const { userId } = req.params;
        const {
            enemy,
            rating,  // Keep for backward compatibility but don't use
            intensity,
            triggers,
            resisted,
            duration,
            notes
        } = req.body;
        
        console.log("saveCheckIn", userId, enemy, {
            intensity,
            triggers,
            resisted,
            duration,
            notes: notes ? 'provided' : 'none'
        });
        
        // Prepare checkin data - only use intensity
        const checkinData = {
            intensity,
            triggers,
            resisted,
            duration,
            notes
        };
        
        const remaining = await saveCheckin(userId, enemy, checkinData);
        await saveUserAverages(userId, intensity, enemy);
        
        res.json({
            success: true,
            ok: true,
            remaining,
            message: 'Check-in saved successfully'
        });
    } catch (e) {
        console.error("Error in saveCheckIn:", e);
        res.status(500).json({
            success: false,
            error: e.message
        });
    }
}
async function weeklyStats(req, res) {
    try {
        const { userId } = req.params;
        if (!userId) res.status(400).json({ error: "Missing userId" });
        const now = daysAgoTS(0);
        const startThis = daysAgoTS(0);
        const startPrev = daysAgoTS(7);
        
        const current = await aggregateWeekly(userId, startThis, now);
        const previous = await aggregateWeekly(userId, startPrev, startThis);

        const result = {};

        for (const k of Object.keys(current)) {
            const c = current[k] || 0;
            const p = previous[k] || 0;
            const change = p > 0 ? ((c - p) / p) * 100 : (c > 0 ? 100 : 0);
            result[k] = {
                current: +c.toFixed(2),
                previous: +p.toFixed(2),
                change: +change.toFixed(1)
            }
        }
        res.json(result);
    } catch (e) {
        console.log(e);
        
        res.status(500).json({ error: e.message });
    }
}

async function addJournel(req, res) {
    try {
        const { userId } = req.params;
        const { tags, note, moodBefore, moodAfter } = req.body;
        
        // Validate journal entry
        const validation = validateJournalEntry({ tags, note });
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                errors: validation.errors
            });
        }
        
        await saveJournel(userId, tags, note, moodBefore, moodAfter);
        res.json({ success: true, message: "Journal entry saved" });
    } catch(ex) {
        res.status(500).json({ success: false, error: ex.message });
    }
}

/**
 * Get journal entries for a user
 */
async function getJournalEntriesController(req, res) {
    try {
        const { userId } = req.params;
        const { limit, startDate, endDate, enemy } = req.query;
        
        const options = {};
        if (limit) options.limit = parseInt(limit);
        if (startDate) options.startDate = startDate;
        if (endDate) options.endDate = endDate;
        if (enemy) options.enemy = enemy;
        
        const entries = await getJournalEntries(userId, options);
        
        res.json({
            success: true,
            data: entries
        });
    } catch(ex) {
        res.status(500).json({ success: false, error: ex.message });
    }
}

/**
 * Get journal analytics for a user
 */
async function getJournalAnalyticsController(req, res) {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;
        
        const analytics = await getJournalAnalytics(userId, parseInt(days));
        
        res.json({
            success: true,
            data: analytics
        });
    } catch(ex) {
        res.status(500).json({ success: false, error: ex.message });
    }
}

/**
 * Get journal prompts for a specific enemy
 */
async function getJournalPrompts(req, res) {
    try {
        const { enemy } = req.params;
        const { count = 3 } = req.query;
        
        if (!enemy) {
            return res.status(400).json({
                success: false,
                error: "Enemy parameter is required"
            });
        }
        
        const prompts = getPromptsForEnemy(enemy, parseInt(count));
        
        res.json({
            success: true,
            data: {
                enemy,
                prompts
            }
        });
    } catch(ex) {
        res.status(500).json({ success: false, error: ex.message });
    }
}

/**
 * Get common triggers for a specific enemy
 */
async function getTriggers(req, res) {
    try {
        const { enemy } = req.params;
        
        if (!enemy) {
            return res.status(400).json({
                success: false,
                error: "Enemy parameter is required"
            });
        }
        
        const triggers = getTriggersForEnemy(enemy);
        
        res.json({
            success: true,
            data: {
                enemy,
                triggers
            }
        });
    } catch(ex) {
        res.status(500).json({ success: false, error: ex.message });
    }
}

module.exports = {
    saveCheckIn,
    weeklyStats,
    addJournel,
    getJournalPrompts,
    getTriggers,
    getJournalEntriesController,
    getJournalAnalyticsController
}