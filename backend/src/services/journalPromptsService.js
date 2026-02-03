/**
 * Journal Prompts Service
 * Provides contextual prompts based on the enemy faced
 */

const journalPrompts = {
    KAMA: [
        "What triggered this craving today?",
        "What were you seeking when this desire arose?",
        "How did your body feel when the craving appeared?",
        "What would satisfy you beyond this immediate want?",
        "When did you first notice this pattern today?"
    ],
    KRODHA: [
        "What situation sparked this anger?",
        "What boundary felt violated?",
        "How did anger show up in your body?",
        "What were you protecting when anger arose?",
        "What would you say if anger could speak clearly?"
    ],
    LOBHA: [
        "What made you feel you needed more today?",
        "What fear underlies this wanting?",
        "When did 'enough' stop feeling like enough?",
        "What are you actually hungry for?",
        "How would you feel if you had what you wanted?"
    ],
    MOHA: [
        "What are you clinging to right now?",
        "What would happen if you let go?",
        "Where does this attachment live in your body?",
        "What truth are you avoiding?",
        "What would freedom from this feel like?"
    ],
    MADA: [
        "When did you need to be right today?",
        "What were you trying to prove?",
        "How did pride protect you?",
        "What would humility reveal?",
        "Where does ego feel threatened?"
    ],
    MATSARYA: [
        "Who triggered this comparison?",
        "What do you believe they have that you lack?",
        "How does jealousy serve you?",
        "What would you do if comparison disappeared?",
        "What gift of yours goes unnoticed?"
    ]
};

/**
 * Get a random prompt for a specific enemy
 */
function getPromptForEnemy(enemy) {
    const prompts = journalPrompts[enemy];
    if (!prompts || prompts.length === 0) {
        return "What did you notice about yourself today?";
    }
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
}

/**
 * Get multiple prompts for an enemy
 */
function getPromptsForEnemy(enemy, count = 3) {
    const prompts = journalPrompts[enemy];
    if (!prompts || prompts.length === 0) {
        return ["What did you notice about yourself today?"];
    }
    
    // Shuffle and return requested count
    const shuffled = [...prompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, prompts.length));
}

/**
 * Get a general reflection prompt (not enemy-specific)
 */
function getGeneralPrompt() {
    const generalPrompts = [
        "What pattern did you notice in yourself today?",
        "What moment today revealed something about you?",
        "What would you tell your future self about today?",
        "What did you learn by observing yourself?",
        "What surprised you about your reactions today?"
    ];
    const randomIndex = Math.floor(Math.random() * generalPrompts.length);
    return generalPrompts[randomIndex];
}

/**
 * Validate journal entry
 */
function validateJournalEntry(entry) {
    const errors = [];
    
    if (!entry.note || entry.note.trim().length === 0) {
        errors.push("Journal entry cannot be empty");
    }
    
    if (entry.note && entry.note.length < 10) {
        errors.push("Journal entry should be at least 10 characters");
    }
    
    if (entry.note && entry.note.length > 5000) {
        errors.push("Journal entry is too long (max 5000 characters)");
    }
    
    if (entry.tags && !Array.isArray(entry.tags)) {
        errors.push("Tags must be an array");
    }
    
    if (entry.tags && entry.tags.length > 10) {
        errors.push("Maximum 10 tags allowed");
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = {
    getPromptForEnemy,
    getPromptsForEnemy,
    getGeneralPrompt,
    validateJournalEntry
};