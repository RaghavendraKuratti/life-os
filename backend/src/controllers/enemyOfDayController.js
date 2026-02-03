const { getEnemyOfTheDay } = require("../data/enemyPractices");

/**
 * Get the enemy and practice for today
 */
async function getDailyEnemy(req, res) {
    try {
        const enemyOfDay = getEnemyOfTheDay();
        
        res.json({ 
            success: true, 
            data: enemyOfDay 
        });
    } catch (error) {
        console.error("Error fetching enemy of the day:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

module.exports = {
    getDailyEnemy
};