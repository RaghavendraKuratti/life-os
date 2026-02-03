const { db } = require("../config/firebase");
const { todayString, daysAgoDate } = require("../utils/dateUtils");

/**
 * Get summary statistics for a user
 * @param {string} userId - User ID
 * @param {number} days - Number of days to analyze (default: 7)
 * @param {string} enemy - Optional enemy filter
 * @returns {Object} Summary statistics
 */
async function getSummaryStats(userId, days = 7, enemy = null) {
    try {
        const startDate = daysAgoDate(days);
        const endDate = todayString();

        // Simple query without date filtering to avoid index requirement
        const checkinsRef = db.collection('enemyCheckins')
            .where('userid', '==', userId);

        const snapshot = await checkinsRef.get();
        
        // Filter by date and enemy in memory
        const filteredDocs = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const matchesDate = data.timestamp >= startDate && data.timestamp <= endDate;
            const matchesEnemy = !enemy || data.enemy === enemy;
            
            if (matchesDate && matchesEnemy) {
                filteredDocs.push(data);
            }
        });

        if (filteredDocs.length === 0) {
            return {
                avgIntensity: 0,
                topTrigger: null,
                currentStreak: 0,
                totalCheckins: 0,
                period: `${days} days`
            };
        }

        let totalIntensity = 0;
        let intensityCount = 0;
        const triggerCounts = {};
        const checkinDates = new Set();

        filteredDocs.forEach(data => {
            
            // Calculate average intensity
            if (data.intensity) {
                totalIntensity += data.intensity;
                intensityCount++;
            }

            // Count triggers
            if (data.triggers && Array.isArray(data.triggers)) {
                data.triggers.forEach(trigger => {
                    triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
                });
            }

            // Track unique check-in dates
            if (data.timestamp) {
                checkinDates.add(data.timestamp);
            }
        });

        // Calculate average intensity
        const avgIntensity = intensityCount > 0 
            ? parseFloat((totalIntensity / intensityCount).toFixed(1))
            : 0;

        // Find top trigger
        let topTrigger = null;
        let maxCount = 0;
        Object.entries(triggerCounts).forEach(([trigger, count]) => {
            if (count > maxCount) {
                maxCount = count;
                topTrigger = trigger;
            }
        });

        // Calculate current streak
        const currentStreak = await calculateStreak(userId);

        return {
            avgIntensity,
            topTrigger,
            topTriggerCount: maxCount,
            currentStreak,
            totalCheckins: filteredDocs.length,
            uniqueDays: checkinDates.size,
            period: `${days} days`
        };

    } catch (error) {
        console.error('Error getting summary stats:', error);
        throw error;
    }
}

/**
 * Get intensity trend over time
 * @param {string} userId - User ID
 * @param {number} days - Number of days to analyze (default: 7)
 * @param {string} enemy - Optional enemy filter
 * @returns {Array} Intensity trend data
 */
async function getIntensityTrend(userId, days = 7, enemy = null) {
    try {
        const startDate = daysAgoDate(days);
        const endDate = todayString();

        // Simple query without date filtering
        const query = db.collection('enemyCheckins')
            .where('userid', '==', userId);

        const snapshot = await query.get();
        
        // Filter by date and enemy in memory
        const filteredDocs = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const matchesDate = data.timestamp >= startDate && data.timestamp <= endDate;
            const matchesEnemy = !enemy || data.enemy === enemy;
            
            if (matchesDate && matchesEnemy) {
                filteredDocs.push(data);
            }
        });

        // Group by date and calculate average intensity
        const dateIntensity = {};
        
        filteredDocs.forEach(data => {
            const date = data.timestamp;
            
            if (!dateIntensity[date]) {
                dateIntensity[date] = { total: 0, count: 0 };
            }
            
            if (data.intensity) {
                dateIntensity[date].total += data.intensity;
                dateIntensity[date].count++;
            }
        });

        // Convert to array and calculate averages
        const trend = Object.entries(dateIntensity).map(([date, data]) => ({
            date,
            intensity: parseFloat((data.total / data.count).toFixed(1)),
            count: data.count
        }));

        // Sort by date
        trend.sort((a, b) => a.date.localeCompare(b.date));

        return trend;

    } catch (error) {
        console.error('Error getting intensity trend:', error);
        throw error;
    }
}

/**
 * Get trigger frequency analysis
 * @param {string} userId - User ID
 * @param {number} days - Number of days to analyze (default: 30)
 * @param {string} enemy - Optional enemy filter
 * @returns {Array} Trigger frequency data
 */
async function getTriggerAnalysis(userId, days = 30, enemy = null) {
    try {
        const startDate = daysAgoDate(days);
        const endDate = todayString();

        // Simple query without date filtering
        const query = db.collection('enemyCheckins')
            .where('userid', '==', userId);

        const snapshot = await query.get();
        
        // Filter by date and enemy in memory
        const filteredDocs = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const matchesDate = data.timestamp >= startDate && data.timestamp <= endDate;
            const matchesEnemy = !enemy || data.enemy === enemy;
            
            if (matchesDate && matchesEnemy) {
                filteredDocs.push(data);
            }
        });

        const triggerCounts = {};
        let totalTriggers = 0;

        filteredDocs.forEach(data => {
            
            if (data.triggers && Array.isArray(data.triggers)) {
                data.triggers.forEach(trigger => {
                    triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
                    totalTriggers++;
                });
            }
        });

        // Convert to array and calculate percentages
        const triggers = Object.entries(triggerCounts).map(([name, count]) => ({
            name,
            count,
            percentage: totalTriggers > 0 
                ? parseFloat(((count / totalTriggers) * 100).toFixed(1))
                : 0
        }));

        // Sort by count (descending)
        triggers.sort((a, b) => b.count - a.count);

        // Return top 10
        return triggers.slice(0, 10);

    } catch (error) {
        console.error('Error getting trigger analysis:', error);
        throw error;
    }
}

/**
 * Get time-of-day patterns
 * @param {string} userId - User ID
 * @param {number} days - Number of days to analyze (default: 30)
 * @param {string} enemy - Optional enemy filter
 * @returns {Object} Time pattern data
 */
async function getTimePatterns(userId, days = 30, enemy = null) {
    try {
        const startDate = daysAgoDate(days);
        const endDate = todayString();

        // Simple query without date filtering
        const checkinsRef = db.collection('enemyCheckins')
            .where('userid', '==', userId);

        const snapshot = await checkinsRef.get();
        
        // Filter by date and enemy in memory
        const filteredDocs = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const matchesDate = data.timestamp >= startDate && data.timestamp <= endDate;
            const matchesEnemy = !enemy || data.enemy === enemy;
            
            if (matchesDate && matchesEnemy) {
                filteredDocs.push(data);
            }
        });

        const timePatterns = {
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0
        };

        filteredDocs.forEach(data => {
            const timeOfDay = data.timeOfDay || 'unknown';
            
            if (timePatterns.hasOwnProperty(timeOfDay)) {
                timePatterns[timeOfDay]++;
            }
        });

        const total = Object.values(timePatterns).reduce((sum, count) => sum + count, 0);

        // Calculate percentages
        const patterns = Object.entries(timePatterns).map(([time, count]) => ({
            time,
            count,
            percentage: total > 0
                ? parseFloat(((count / total) * 100).toFixed(1))
                : 0
        }));

        return {
            patterns,
            total
        };

    } catch (error) {
        console.error('Error getting time patterns:', error);
        throw error;
    }
}

/**
 * Calculate current streak (consecutive days with check-ins)
 * @param {string} userId - User ID
 * @returns {number} Current streak in days
 */
async function calculateStreak(userId) {
    try {
        // Simplified query without orderBy to avoid index requirement
        const checkinsRef = db.collection('enemyCheckins')
            .where('userid', '==', userId);

        const snapshot = await checkinsRef.get();

        if (snapshot.empty) {
            return 0;
        }

        // Collect unique dates
        const uniqueDates = new Set();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.timestamp) {
                uniqueDates.add(data.timestamp);
            }
        });

        // Sort dates in descending order (newest first)
        const sortedDates = Array.from(uniqueDates).sort().reverse();
        
        let streak = 0;
        const today = todayString();
        
        // Check if there's a check-in today or yesterday
        if (sortedDates[0] !== today && sortedDates[0] !== daysAgoDate(1)) {
            return 0; // Streak broken
        }

        // Count consecutive days
        for (let i = 0; i < sortedDates.length; i++) {
            const expectedDate = daysAgoDate(i);
            if (sortedDates[i] === expectedDate) {
                streak++;
            } else {
                break;
            }
        }

        return streak;

    } catch (error) {
        console.error('Error calculating streak:', error);
        return 0;
    }
}

/**
 * Get comprehensive analytics for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Object} Complete analytics data
 */
async function getComprehensiveAnalytics(userId, options = {}) {
    const {
        summaryDays = 7,
        trendDays = 7,
        triggerDays = 30,
        timeDays = 30,
        enemy = null
    } = options;

    try {
        const [summary, trend, triggers, timePatterns] = await Promise.all([
            getSummaryStats(userId, summaryDays, enemy),
            getIntensityTrend(userId, trendDays, enemy),
            getTriggerAnalysis(userId, triggerDays, enemy),
            getTimePatterns(userId, timeDays, enemy)
        ]);

        return {
            summary,
            intensityTrend: trend,
            triggers,
            timePatterns,
            generatedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error getting comprehensive analytics:', error);
        throw error;
    }
}

module.exports = {
    getSummaryStats,
    getIntensityTrend,
    getTriggerAnalysis,
    getTimePatterns,
    calculateStreak,
    getComprehensiveAnalytics
};