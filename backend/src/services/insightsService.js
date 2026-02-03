const { db } = require("../config/firebase");
const { daysAgoDate, todayString } = require("../utils/dateUtils");
const { generateWeeklySummary, generateReflectionQuestions } = require("./geminiService");

/**
 * Generate weekly insights for a user
 * @param {string} userId - User ID
 * @returns {Object} Weekly insights data
 */
async function generateWeeklyInsights(userId) {
    try {
        const startDate = daysAgoDate(7);
        const endDate = todayString();

        // Fetch check-ins for the week from global enemyCheckins collection
        const checkinsSnapshot = await db.collection("enemyCheckins")
            .where("userid", "==", userId)
            .where("timestamp", ">=", startDate)
            .where("timestamp", "<=", endDate)
            .get();

        // If no check-ins, return null to show empty state
        if (checkinsSnapshot.empty) {
            return null;
        }

        // Fetch meditation sessions for the week
        const meditationSnapshot = await db.collection("users")
            .doc(userId)
            .collection("meditation")
            .where("timestamp", ">=", startDate)
            .where("timestamp", "<=", endDate)
            .get();

        // Process check-ins data
        const checkins = [];
        const enemyCount = {};
        const dailyCheckins = {};
        
        checkinsSnapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp ? data.timestamp.split('T')[0] : null;
            
            if (date) {
                checkins.push({
                    id: doc.id,
                    date: date,
                    enemy: data.enemy,
                    intensity: data.selfRating || 0,
                    timestamp: data.timestamp
                });
                
                // Count enemy occurrences
                if (data.enemy) {
                    enemyCount[data.enemy] = (enemyCount[data.enemy] || 0) + 1;
                }
                
                // Group by date for daily analysis
                if (!dailyCheckins[date]) {
                    dailyCheckins[date] = [];
                }
                dailyCheckins[date].push(data);
            }
        });

        // Process meditation data
        const meditationDays = new Set();
        let totalMeditationMinutes = 0;
        
        meditationSnapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp ? data.timestamp.split('T')[0] : doc.id;
            meditationDays.add(date);
            if (data.duration) {
                totalMeditationMinutes += data.duration;
            }
        });

        // Calculate insights
        const topEnemy = Object.keys(enemyCount).length > 0
            ? Object.entries(enemyCount).sort((a, b) => b[1] - a[1])[0][0]
            : null;

        const meditationConsistency = Math.round((meditationDays.size / 7) * 100);
        
        // Find best and worst days
        const daysWithScores = checkins.map(checkin => ({
            date: checkin.date,
            score: calculateDayScore(checkin)
        })).sort((a, b) => b.score - a.score);

        const bestDay = daysWithScores.length > 0 ? daysWithScores[0] : null;
        const worstDay = daysWithScores.length > 0 ? daysWithScores[daysWithScores.length - 1] : null;

        // Calculate enemy reduction on meditation days
        const enemyReduction = calculateEnemyReduction(checkins, meditationDays);

        // Prepare data for AI analysis
        const insightsData = {
            weekStart: startDate,
            weekEnd: endDate,
            topEnemy,
            topEnemyCount: enemyCount[topEnemy] || 0,
            bestDay: bestDay ? {
                date: bestDay.date,
                score: bestDay.score
            } : null,
            worstDay: worstDay ? {
                date: worstDay.date,
                score: worstDay.score
            } : null,
            meditationConsistency,
            meditationDays: meditationDays.size,
            totalMeditationMinutes,
            checkInDays: checkins.length,
            enemyReduction,
            enemyBreakdown: enemyCount
        };

        // Generate basic reflection (always available)
        const basicReflection = generateReflection({
            topEnemy,
            meditationConsistency,
            enemyReduction,
            totalDays: checkins.length,
            meditationDays: meditationDays.size
        });

        // Generate AI-powered summary and reflection questions
        let aiSummary = null;
        let reflectionQuestions = [];
        let aiGenerated = false;
        
        try {
            // Generate AI summary (with fallback)
            aiSummary = await generateWeeklySummary(insightsData);
            aiGenerated = true;
            
            // Generate reflection questions (with fallback)
            reflectionQuestions = await generateReflectionQuestions(insightsData);
        } catch (error) {
            console.error("Error generating AI insights:", error);
            // Use basic reflection as fallback
            aiSummary = basicReflection;
            aiGenerated = false;
        }

        return {
            ...insightsData,
            reflection: basicReflection,
            aiSummary,
            aiGenerated,
            reflectionQuestions
        };
    } catch (error) {
        console.error("Error generating weekly insights:", error);
        throw error;
    }
}

/**
 * Calculate a score for a day based on check-in data
 * Lower score = worse day (more negative emotions)
 */
function calculateDayScore(checkin) {
    let score = 50; // Base score
    
    // Adjust based on enemy intensity (selfRating scale of 1-10)
    if (checkin.intensity) {
        score -= checkin.intensity * 5;
    }
    
    return Math.max(0, Math.min(100, score));
}

/**
 * Calculate enemy reduction percentage on meditation days
 */
function calculateEnemyReduction(checkins, meditationDays) {
    const meditationDayCheckins = checkins.filter(c => meditationDays.has(c.date));
    const nonMeditationDayCheckins = checkins.filter(c => !meditationDays.has(c.date));
    
    if (meditationDayCheckins.length === 0 || nonMeditationDayCheckins.length === 0) {
        return 0;
    }
    
    const avgMeditationIntensity = meditationDayCheckins.reduce((sum, c) => 
        sum + (c.intensity || 0), 0) / meditationDayCheckins.length;
    
    const avgNonMeditationIntensity = nonMeditationDayCheckins.reduce((sum, c) => 
        sum + (c.intensity || 0), 0) / nonMeditationDayCheckins.length;
    
    if (avgNonMeditationIntensity === 0) return 0;
    
    const reduction = ((avgNonMeditationIntensity - avgMeditationIntensity) / avgNonMeditationIntensity) * 100;
    return Math.round(Math.max(0, reduction));
}

/**
 * Generate a reflection message based on insights
 */
function generateReflection({ topEnemy, meditationConsistency, enemyReduction, totalDays, meditationDays }) {
    const enemyNames = {
        'KAMA': 'desire',
        'KRODHA': 'anger',
        'LOBHA': 'greed',
        'MOHA': 'delusion',
        'MADA': 'pride',
        'MATSARYA': 'jealousy'
    };
    
    const enemyName = topEnemy ? enemyNames[topEnemy] || topEnemy.toLowerCase() : 'inner obstacles';
    
    if (meditationDays === 0) {
        return `This week, ${enemyName} appeared ${totalDays} times. Consider starting a meditation practice to build inner strength.`;
    }
    
    if (meditationConsistency >= 70 && enemyReduction > 0) {
        return `This week, ${enemyName} dominated ${totalDays} days. On days you meditated, it reduced by ${enemyReduction}%. Your practice is working.`;
    }
    
    if (meditationConsistency >= 70) {
        return `Strong meditation consistency this week (${meditationConsistency}%). ${enemyName} appeared ${totalDays} times. Keep observing the patterns.`;
    }
    
    if (enemyReduction > 0) {
        return `This week, ${enemyName} was most frequent. On meditation days, intensity dropped by ${enemyReduction}%. Consistency is key.`;
    }
    
    return `This week, ${enemyName} appeared ${totalDays} times. Meditation on ${meditationDays} days. Small steps lead to transformation.`;
}

module.exports = {
    generateWeeklyInsights
};