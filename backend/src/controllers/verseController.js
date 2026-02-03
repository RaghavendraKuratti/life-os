const { getTodaysVerse } = require("../services/verseService");
const { getDailyInsight, getContextualInsight } = require("../services/dailyInsightService");
const { db } = require("../config/firebase");

async function getVerse(req, res) {
    try {
        const verse = await getTodaysVerse();
        if (!verse) {
            return res.status(404).json({ error: "No verse for today" })
        }
        res.json(verse)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message } )
    }
}

/**
 * Get daily insight for a user
 */
async function getDailyInsightForUser(req, res) {
    try {
        const { userId } = req.params;
        const { type = 'mixed' } = req.query; // 'verse', 'modern', or 'mixed'
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required"
            });
        }

        const insight = await getDailyInsight(userId, type);
        
        res.json({
            success: true,
            data: insight
        });
    } catch (error) {
        console.error("Error fetching daily insight:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

/**
 * Get contextual insight based on user's recent patterns
 */
async function getContextualInsightForUser(req, res) {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required"
            });
        }

        const insight = await getContextualInsight(userId);
        
        res.json({
            success: true,
            data: insight
        });
    } catch (error) {
        console.error("Error fetching contextual insight:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

/**
 * Mark shloka as read for a user
 */
async function markShlokaAsRead(req, res) {
    try {
        const { userId, date } = req.body;
        
        if (!userId || !date) {
            return res.status(400).json({
                success: false,
                error: "User ID and date are required"
            });
        }

        // Store read status in Firestore
        const readRef = db.collection('users').doc(userId).collection('readShlokas').doc(date);
        await readRef.set({
            readAt: new Date().toISOString(),
            date: date
        });

        res.json({
            success: true,
            message: "Shloka marked as read successfully"
        });
    } catch (error) {
        console.error("Error marking shloka as read:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

/**
 * Check if user has read a specific shloka
 */
async function getShlokaReadStatus(req, res) {
    try {
        const { userId, date } = req.params;
        
        if (!userId || !date) {
            return res.status(400).json({
                success: false,
                error: "User ID and date are required"
            });
        }

        // Check read status in Firestore
        const readRef = db.collection('users').doc(userId).collection('readShlokas').doc(date);
        const readDoc = await readRef.get();

        res.json({
            success: true,
            isRead: readDoc.exists,
            data: readDoc.exists ? readDoc.data() : null
        });
    } catch (error) {
        console.error("Error checking shloka read status:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = {
    getVerse,
    getDailyInsightForUser,
    getContextualInsightForUser,
    markShlokaAsRead,
    getShlokaReadStatus
};