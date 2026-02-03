const { getEnemyAnalytics, getWeeklyEnemyBreakdown } = require("../services/enemyAnalyticsService");

/**
 * Get enemy analytics for a user
 */
async function getUserEnemyAnalytics(req, res) {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: "User ID is required" 
            });
        }

        const analytics = await getEnemyAnalytics(userId, parseInt(days));
        
        res.json({ 
            success: true, 
            data: analytics 
        });
    } catch (error) {
        console.error("Error fetching enemy analytics:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

/**
 * Get weekly enemy breakdown
 */
async function getWeeklyBreakdown(req, res) {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: "User ID is required" 
            });
        }

        const breakdown = await getWeeklyEnemyBreakdown(userId);
        
        res.json({ 
            success: true, 
            data: breakdown 
        });
    } catch (error) {
        console.error("Error fetching weekly breakdown:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

module.exports = {
    getUserEnemyAnalytics,
    getWeeklyBreakdown
};