/**
 * Common triggers for each enemy
 * Used to help users identify what causes their struggles
 */

const enemyTriggers = {
    KAMA: [
        'Social media scrolling',
        'Advertisements',
        'Shopping websites',
        'Food cravings',
        'Boredom',
        'Stress eating',
        'Peer pressure',
        'Emotional void',
        'Loneliness',
        'Celebration/reward'
    ],
    
    KRODHA: [
        'Traffic/commute',
        'Work stress',
        'Deadlines',
        'Meetings',
        'Email/messages',
        'Family conflict',
        'Social media arguments',
        'Injustice/unfairness',
        'Physical discomfort',
        'Hunger/tiredness',
        'Interruptions',
        'Technical issues'
    ],
    
    LOBHA: [
        'Sales/discounts',
        'Online shopping',
        'Comparison with others',
        'Social media',
        'Financial stress',
        'Peer pressure',
        'Status anxiety',
        'Fear of missing out',
        'Insecurity',
        'Advertisements'
    ],
    
    MOHA: [
        'Relationship issues',
        'Fear of loss',
        'Nostalgia',
        'Comfort zone',
        'Familiar routines',
        'Emotional dependency',
        'Past memories',
        'Resistance to change',
        'Attachment to outcomes',
        'Material possessions'
    ],
    
    MADA: [
        'Achievements',
        'Compliments/praise',
        'Social media likes',
        'Comparison with others',
        'Success at work',
        'Intellectual debates',
        'Showing off',
        'Being right',
        'Status symbols',
        'Recognition'
    ],
    
    MATSARYA: [
        'Social media posts',
        'Others\' success',
        'Promotions/achievements',
        'Material possessions',
        'Relationships',
        'Attention to others',
        'Comparison',
        'Feeling left out',
        'Insecurity',
        'Competition'
    ]
};

/**
 * Get triggers for a specific enemy
 * @param {string} enemy - Enemy key (KAMA, KRODHA, etc.)
 * @returns {Array<string>} List of common triggers
 */
function getTriggersForEnemy(enemy) {
    return enemyTriggers[enemy] || [];
}

/**
 * Get all triggers
 * @returns {Object} All enemy triggers
 */
function getAllTriggers() {
    return enemyTriggers;
}

module.exports = {
    enemyTriggers,
    getTriggersForEnemy,
    getAllTriggers
};