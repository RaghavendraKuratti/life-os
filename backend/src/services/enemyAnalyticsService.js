const { db } = require("../config/firebase");
const { daysAgoDate, todayString, todayISO } = require("../utils/dateUtils");

/**
 * Get enemy analytics for a user over a specified period
 * @param {string} userId - User ID
 * @param {number} days - Number of days to analyze (default: 30)
 * @returns {Object} Enemy analytics data
 */
async function getEnemyAnalytics(userId, days = 30) {
    try {
        const startDate = daysAgoDate(days);
        const endDate = todayString();

        // Fetch check-ins for the period
        const checkinsSnapshot = await db.collection("enemyCheckins")
            .where("userid", "==", userId)
            .where("timestamp", ">=", startDate)
            .where("timestamp", "<=", endDate)
            .get();

        if (checkinsSnapshot.empty) {
            return {
                period: { start: startDate, end: endDate, days },
                totalCheckins: 0,
                enemyFrequency: {},
                enemyIntensity: {},
                trends: {},
                insights: []
            };
        }

        // Process check-ins
        const checkins = [];
        const enemyFrequency = {};
        const enemyIntensitySum = {};
        const enemyIntensityCount = {};
        const dailyData = {};

        checkinsSnapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp ? data.timestamp.split('T')[0] : null;
            
            if (date && data.enemy) {
                checkins.push({
                    id: doc.id,
                    date,
                    enemy: data.enemy,
                    intensity: data.selfRating || 0,
                    timestamp: data.timestamp
                });

                // Count frequency
                enemyFrequency[data.enemy] = (enemyFrequency[data.enemy] || 0) + 1;

                // Sum intensity for average calculation
                if (data.selfRating) {
                    enemyIntensitySum[data.enemy] = (enemyIntensitySum[data.enemy] || 0) + data.selfRating;
                    enemyIntensityCount[data.enemy] = (enemyIntensityCount[data.enemy] || 0) + 1;
                }

                // Group by date
                if (!dailyData[date]) {
                    dailyData[date] = [];
                }
                dailyData[date].push(data);
            }
        });

        // Calculate average intensity per enemy
        const enemyIntensity = {};
        Object.keys(enemyIntensitySum).forEach(enemy => {
            enemyIntensity[enemy] = {
                average: Math.round((enemyIntensitySum[enemy] / enemyIntensityCount[enemy]) * 10) / 10,
                total: enemyIntensitySum[enemy],
                count: enemyIntensityCount[enemy]
            };
        });

        // Calculate trends (compare first half vs second half of period)
        const trends = calculateTrends(checkins, days);

        // Generate insights
        const insights = generateInsights(enemyFrequency, enemyIntensity, trends, checkins.length);

        return {
            period: { start: startDate, end: endDate, days },
            totalCheckins: checkins.length,
            enemyFrequency,
            enemyIntensity,
            trends,
            insights,
            dailyBreakdown: Object.keys(dailyData).length
        };
    } catch (error) {
        console.error("Error getting enemy analytics:", error);
        throw error;
    }
}

/**
 * Calculate trends by comparing first half vs second half of period
 */
function calculateTrends(checkins, days) {
    const midpoint = Math.floor(days / 2);
    const cutoffDate = daysAgoDate(midpoint);

    const firstHalf = {};
    const secondHalf = {};

    checkins.forEach(checkin => {
        const enemy = checkin.enemy;
        if (checkin.date < cutoffDate) {
            firstHalf[enemy] = (firstHalf[enemy] || 0) + 1;
        } else {
            secondHalf[enemy] = (secondHalf[enemy] || 0) + 1;
        }
    });

    const trends = {};
    const allEnemies = new Set([...Object.keys(firstHalf), ...Object.keys(secondHalf)]);

    allEnemies.forEach(enemy => {
        const first = firstHalf[enemy] || 0;
        const second = secondHalf[enemy] || 0;
        
        let trend = 'stable';
        let change = 0;

        if (first > 0) {
            change = Math.round(((second - first) / first) * 100);
            if (change > 20) trend = 'increasing';
            else if (change < -20) trend = 'decreasing';
        } else if (second > 0) {
            trend = 'new';
        }

        trends[enemy] = {
            trend,
            change,
            firstHalfCount: first,
            secondHalfCount: second
        };
    });

    return trends;
}

/**
 * Generate actionable insights from analytics
 */
function generateInsights(frequency, intensity, trends, totalCheckins) {
    const insights = [];

    if (totalCheckins === 0) {
        insights.push({
            type: 'info',
            message: 'Start tracking your inner obstacles to see patterns emerge.'
        });
        return insights;
    }

    // Most frequent enemy
    const sortedByFrequency = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1]);
    
    if (sortedByFrequency.length > 0) {
        const [topEnemy, count] = sortedByFrequency[0];
        const percentage = Math.round((count / totalCheckins) * 100);
        insights.push({
            type: 'primary',
            enemy: topEnemy,
            message: `${getEnemyName(topEnemy)} appeared ${count} times (${percentage}% of check-ins).`,
            metric: { count, percentage }
        });
    }

    // Highest intensity enemy
    const sortedByIntensity = Object.entries(intensity)
        .sort((a, b) => b[1].average - a[1].average);
    
    if (sortedByIntensity.length > 0) {
        const [enemy, data] = sortedByIntensity[0];
        if (data.average >= 7) {
            insights.push({
                type: 'warning',
                enemy,
                message: `${getEnemyName(enemy)} shows high intensity (avg: ${data.average}/10).`,
                metric: { average: data.average }
            });
        }
    }

    // Trending enemies
    Object.entries(trends).forEach(([enemy, data]) => {
        if (data.trend === 'increasing' && data.change > 50) {
            insights.push({
                type: 'alert',
                enemy,
                message: `${getEnemyName(enemy)} increased by ${data.change}% recently.`,
                metric: { change: data.change }
            });
        } else if (data.trend === 'decreasing' && data.change < -50) {
            insights.push({
                type: 'positive',
                enemy,
                message: `${getEnemyName(enemy)} decreased by ${Math.abs(data.change)}% recently.`,
                metric: { change: data.change }
            });
        }
    });

    // Multiple enemies
    if (Object.keys(frequency).length >= 4) {
        insights.push({
            type: 'info',
            message: `${Object.keys(frequency).length} different obstacles tracked. Focus on the primary one first.`
        });
    }

    return insights;
}

/**
 * Get weekly enemy breakdown
 */
async function getWeeklyEnemyBreakdown(userId) {
    try {
        const startDate = daysAgoDate(7);
        const endDate = todayString();

        const checkinsSnapshot = await db.collection("enemyCheckins")
            .where("userid", "==", userId)
            .where("timestamp", ">=", startDate)
            .where("timestamp", "<=", endDate)
            .get();

        const weeklyData = {
            period: { start: startDate, end: endDate },
            byDay: {},
            byEnemy: {},
            totalCheckins: 0
        };

        checkinsSnapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp ? data.timestamp.split('T')[0] : null;
            
            if (date && data.enemy) {
                weeklyData.totalCheckins++;

                // By day
                if (!weeklyData.byDay[date]) {
                    weeklyData.byDay[date] = {};
                }
                weeklyData.byDay[date][data.enemy] = (weeklyData.byDay[date][data.enemy] || 0) + 1;

                // By enemy
                if (!weeklyData.byEnemy[data.enemy]) {
                    weeklyData.byEnemy[data.enemy] = {
                        count: 0,
                        intensities: []
                    };
                }
                weeklyData.byEnemy[data.enemy].count++;
                if (data.selfRating) {
                    weeklyData.byEnemy[data.enemy].intensities.push(data.selfRating);
                }
            }
        });

        // Calculate averages
        Object.keys(weeklyData.byEnemy).forEach(enemy => {
            const intensities = weeklyData.byEnemy[enemy].intensities;
            if (intensities.length > 0) {
                const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length;
                weeklyData.byEnemy[enemy].averageIntensity = Math.round(avg * 10) / 10;
            }
        });

        return weeklyData;
    } catch (error) {
        console.error("Error getting weekly enemy breakdown:", error);
        throw error;
    }
}

/**
 * Get enemy name in readable format
 */
function getEnemyName(enemyKey) {
    const names = {
        'KAMA': 'Craving',
        'KRODHA': 'Anger',
        'LOBHA': 'Greed',
        'MOHA': 'Attachment',
        'MADA': 'Ego',
        'MATSARYA': 'Jealousy'
    };
    return names[enemyKey] || enemyKey;
}

module.exports = {
    getEnemyAnalytics,
    getWeeklyEnemyBreakdown
};