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
                error: "User ID is required",
                userMessage: "Unable to load insights. Please try logging in again."
            });
        }

        const insights = await generateWeeklyInsights(userId);
        
        // If no insights (no check-ins), return success with null data
        if (!insights) {
            return res.json({
                success: true,
                data: null,
                message: "No check-ins found for this week. Start tracking to see insights!"
            });
        }
        
        // Add user-friendly messages based on AI status
        let userMessage = null;
        if (insights.aiError) {
            const errorMessages = {
                'api_key': 'AI insights temporarily unavailable. Showing basic summary.',
                'quota_exceeded': 'AI service limit reached. Showing basic summary.',
                'network': 'Connection issue with AI service. Showing basic summary.',
                'timeout': 'AI service taking too long. Showing basic summary.',
                'service_error': 'Unable to generate AI insights. Showing basic summary.',
                'unknown': 'AI insights unavailable. Showing basic summary.'
            };
            userMessage = errorMessages[insights.aiError.type] || errorMessages['unknown'];
        }
        
        res.json({
            success: true,
            data: insights,
            userMessage,
            aiStatus: {
                available: insights.aiGenerated,
                error: insights.aiError
            }
        });
    } catch (error) {
        console.error("Error fetching weekly insights:", error);
        
        // Provide user-friendly error messages
        let userMessage = "Unable to load insights. Please try again later.";
        let statusCode = 500;
        
        if (error.message?.includes('permission') || error.message?.includes('auth')) {
            userMessage = "Access denied. Please check your permissions.";
            statusCode = 403;
        } else if (error.message?.includes('not found')) {
            userMessage = "User data not found. Please try logging in again.";
            statusCode = 404;
        } else if (error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
            userMessage = "Network error. Please check your connection.";
            statusCode = 503;
        }
        
        res.status(statusCode).json({
            success: false,
            error: error.message,
            userMessage
        });
    }
}

module.exports = {
    getWeeklyInsights
};