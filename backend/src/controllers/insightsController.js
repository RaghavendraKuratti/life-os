const { generateWeeklyInsights } = require("../services/insightsService");

/**
 * Get weekly insights for a user
 */
async function getWeeklyInsights(req, res) {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: "User ID is required" 
            });
        }

        const insights = await generateWeeklyInsights(userId);
        
        res.json({ 
            success: true, 
            data: insights 
        });
    } catch (error) {
        console.error("Error fetching weekly insights:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

module.exports = {
    getWeeklyInsights
};