const analyticsService = require('../services/analyticsService');

/**
 * Get summary statistics
 * GET /analytics/summary/:userId?days=7
 */
async function getSummary(req, res) {
    try {
        const { userId } = req.params;
        const days = parseInt(req.query.days) || 7;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const summary = await analyticsService.getSummaryStats(userId, days);

        res.json({
            success: true,
            data: summary
        });

    } catch (error) {
        console.error('Error in getSummary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get summary statistics',
            error: error.message
        });
    }
}

/**
 * Get intensity trend
 * GET /analytics/intensity-trend/:userId?days=7&enemy=KRODHA
 */
async function getIntensityTrend(req, res) {
    try {
        const { userId } = req.params;
        const days = parseInt(req.query.days) || 7;
        const enemy = req.query.enemy || null;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const trend = await analyticsService.getIntensityTrend(userId, days, enemy);

        res.json({
            success: true,
            data: {
                trend,
                days,
                enemy: enemy || 'all'
            }
        });

    } catch (error) {
        console.error('Error in getIntensityTrend:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get intensity trend',
            error: error.message
        });
    }
}

/**
 * Get trigger analysis
 * GET /analytics/triggers/:userId?days=30&enemy=KRODHA
 */
async function getTriggers(req, res) {
    try {
        const { userId } = req.params;
        const days = parseInt(req.query.days) || 30;
        const enemy = req.query.enemy || null;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const triggers = await analyticsService.getTriggerAnalysis(userId, days, enemy);

        res.json({
            success: true,
            data: {
                triggers,
                days,
                enemy: enemy || 'all'
            }
        });

    } catch (error) {
        console.error('Error in getTriggers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get trigger analysis',
            error: error.message
        });
    }
}

/**
 * Get time-of-day patterns
 * GET /analytics/time-patterns/:userId?days=30
 */
async function getTimePatterns(req, res) {
    try {
        const { userId } = req.params;
        const days = parseInt(req.query.days) || 30;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const patterns = await analyticsService.getTimePatterns(userId, days);

        res.json({
            success: true,
            data: {
                ...patterns,
                days
            }
        });

    } catch (error) {
        console.error('Error in getTimePatterns:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get time patterns',
            error: error.message
        });
    }
}

/**
 * Get comprehensive analytics (all data in one call)
 * GET /analytics/comprehensive/:userId?summaryDays=7&trendDays=7&triggerDays=30&timeDays=30&enemy=KRODHA
 */
async function getComprehensive(req, res) {
    try {
        const { userId } = req.params;
        const options = {
            summaryDays: parseInt(req.query.summaryDays) || 7,
            trendDays: parseInt(req.query.trendDays) || 7,
            triggerDays: parseInt(req.query.triggerDays) || 30,
            timeDays: parseInt(req.query.timeDays) || 30,
            enemy: req.query.enemy || null
        };

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const analytics = await analyticsService.getComprehensiveAnalytics(userId, options);

        res.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Error in getComprehensive:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get comprehensive analytics',
            error: error.message
        });
    }
}

module.exports = {
    getSummary,
    getIntensityTrend,
    getTriggers,
    getTimePatterns,
    getComprehensive
};