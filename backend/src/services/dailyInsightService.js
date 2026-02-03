const { db } = require('../config/firebase');
const { todayString } = require('../utils/dateUtils');

/**
 * Modern insights for each enemy (non-spiritual, practical)
 */
const modernInsights = {
    KAMA: [
        "Desire isn't the enemy. Unconscious desire is. Notice it before it drives you.",
        "What you crave reveals what you believe you lack. Question that belief.",
        "The gap between wanting and having creates suffering. Observe the gap itself.",
        "Craving promises fulfillment but delivers only more craving. Break the loop.",
        "Your wants are valid. Your attachment to them is optional."
    ],
    KRODHA: [
        "Anger is information. It tells you a boundary was crossed. Listen, then decide.",
        "Rage is fear wearing armor. What are you protecting?",
        "You can't think clearly while angry. Feel it, then think.",
        "Anger at others is often anger at yourself, redirected.",
        "The person who angers you controls you. Take back control."
    ],
    LOBHA: [
        "Enough is a decision, not an amount.",
        "Greed grows from scarcity thinking. Abundance is a mindset, not a bank balance.",
        "What you chase runs from you. What you release comes to you.",
        "More doesn't mean better. Better means better.",
        "The richest person isn't who has the most, but who needs the least."
    ],
    MOHA: [
        "Attachment creates the illusion of permanence in an impermanent world.",
        "Clinging to outcomes guarantees disappointment. Hold loosely.",
        "Love doesn't require attachment. Attachment isn't love.",
        "What you can't let go of, owns you.",
        "Freedom isn't having everything. It's needing nothing."
    ],
    MADA: [
        "Ego protects you from truth. Truth doesn't need protection.",
        "Being right feels good. Being free feels better.",
        "Pride is fear of being ordinary. Ordinary is underrated.",
        "The loudest voice in the room is often the most insecure.",
        "Humility isn't thinking less of yourself. It's thinking of yourself less."
    ],
    MATSARYA: [
        "Comparison is the thief of joy. Stop comparing.",
        "Their success doesn't diminish yours. Abundance isn't finite.",
        "Jealousy reveals what you value. Use it as data, not poison.",
        "You're competing with who you were yesterday, not with them.",
        "Celebrate others' wins. It trains your mind to see possibility."
    ]
};

/**
 * Get daily insight based on user's primary enemy
 */
async function getDailyInsight(userId, preferenceType = 'mixed') {
    try {
        // Get user's primary enemy
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const primaryEnemy = userData?.defaultEnemy || 'KAMA';

        let insight = {};

        // Determine what type of insight to provide
        if (preferenceType === 'verse' || (preferenceType === 'mixed' && Math.random() > 0.5)) {
            // Get Bhagavad Gita verse
            insight = await getGitaVerse();
            insight.type = 'verse';
            insight.source = 'Bhagavad Gita';
        } else {
            // Get modern insight
            insight = getModernInsight(primaryEnemy);
            insight.type = 'modern';
            insight.source = 'Practical Wisdom';
        }

        insight.enemy = primaryEnemy;
        insight.date = todayString();

        return insight;
    } catch (error) {
        console.error("Error getting daily insight:", error);
        // Fallback to modern insight
        return {
            ...getModernInsight('KAMA'),
            type: 'modern',
            source: 'Practical Wisdom',
            date: todayString()
        };
    }
}

/**
 * Get a Bhagavad Gita verse
 */
async function getGitaVerse() {
    try {
        const snapshot = await db.collection('verses')
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            return {
                text: "The mind is restless and difficult to restrain, but it is subdued by practice.",
                translation: "Through consistent practice and detachment, the mind can be controlled.",
                chapter: 6,
                verse: 35
            };
        }

        return snapshot.docs[0].data();
    } catch (error) {
        console.error("Error fetching Gita verse:", error);
        return {
            text: "The mind is restless and difficult to restrain, but it is subdued by practice.",
            translation: "Through consistent practice and detachment, the mind can be controlled.",
            chapter: 6,
            verse: 35
        };
    }
}

/**
 * Get a modern insight for a specific enemy
 */
function getModernInsight(enemy) {
    const insights = modernInsights[enemy] || modernInsights.KAMA;
    const randomIndex = Math.floor(Math.random() * insights.length);
    
    return {
        text: insights[randomIndex],
        enemy: enemy,
        enemyName: getEnemyName(enemy)
    };
}

/**
 * Get contextual insight based on recent check-ins
 */
async function getContextualInsight(userId) {
    try {
        // Get last 7 days of check-ins
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const startDate = sevenDaysAgo.toISOString().split('T')[0];

        const checkinsSnapshot = await db.collection("enemyCheckins")
            .where("userid", "==", userId)
            .where("timestamp", ">=", startDate)
            .get();

        if (checkinsSnapshot.empty) {
            return getDailyInsight(userId);
        }

        // Count enemy frequency
        const enemyCount = {};
        checkinsSnapshot.forEach(doc => {
            const enemy = doc.data().enemy;
            enemyCount[enemy] = (enemyCount[enemy] || 0) + 1;
        });

        // Get most frequent enemy
        const mostFrequent = Object.entries(enemyCount)
            .sort((a, b) => b[1] - a[1])[0][0];

        // Get insight for most frequent enemy
        const insight = getModernInsight(mostFrequent);
        insight.type = 'contextual';
        insight.source = 'Based on your patterns';
        insight.date = todayString();
        insight.context = `This week, ${getEnemyName(mostFrequent)} appeared ${enemyCount[mostFrequent]} times.`;

        return insight;
    } catch (error) {
        console.error("Error getting contextual insight:", error);
        return getDailyInsight(userId);
    }
}

/**
 * Get enemy name in readable format
 */
function getEnemyName(enemyKey) {
    const names = {
        'KAMA': 'craving',
        'KRODHA': 'anger',
        'LOBHA': 'greed',
        'MOHA': 'attachment',
        'MADA': 'ego',
        'MATSARYA': 'jealousy'
    };
    return names[enemyKey] || enemyKey.toLowerCase();
}

module.exports = {
    getDailyInsight,
    getContextualInsight,
    getModernInsight,
    getGitaVerse
};