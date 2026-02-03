const { GoogleGenerativeAI } = require("@google/generative-ai");



// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Safety settings to prevent harmful content
const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

// Generation config for concise responses
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 200, // Keep responses short (4-5 lines max)
};

/**
 * Generate weekly summary using Gemini AI
 * RULES:
 * - NEVER give life advice
 * - NEVER diagnose mental health
 * - NEVER predict future
 * - ONLY reflect user's own data
 * - If data insufficient, say so clearly
 * - Max 4-5 lines
 */
async function generateWeeklySummary(insightsData) {
  try {
    
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set. Returning fallback summary.");
      return generateFallbackSummary(insightsData);
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      safetySettings,
      generationConfig,
    });

    const prompt = buildWeeklySummaryPrompt(insightsData);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Validate response length (max 4-5 lines)
    const lines = text.trim().split('\n').filter(line => line.trim());
    if (lines.length > 5) {
      return lines.slice(0, 5).join('\n');
    }

    return text.trim();
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return generateFallbackSummary(insightsData);
  }
}

/**
 * Generate reflection questions based on user patterns
 */
async function generateReflectionQuestions(insightsData) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return generateFallbackQuestions(insightsData);
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      safetySettings,
      generationConfig: {
        ...generationConfig,
        maxOutputTokens: 150,
      },
    });

    const prompt = buildReflectionPrompt(insightsData);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse questions (expect 2-3 questions)
    const questions = text
      .split('\n')
      .filter(line => line.trim() && (line.includes('?') || line.match(/^\d+\./)))
      .slice(0, 3)
      .map(q => q.replace(/^\d+\.\s*/, '').trim());

    return questions.length > 0 ? questions : generateFallbackQuestions(insightsData);
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return generateFallbackQuestions(insightsData);
  }
}

/**
 * Build prompt for weekly summary
 */
function buildWeeklySummaryPrompt(data) {
  const {
    topEnemy,
    topEnemyCount,
    meditationDays,
    checkInDays,
    enemyReduction,
    meditationConsistency,
  } = data;

  const enemyNames = {
    'KAMA': 'craving',
    'KRODHA': 'anger',
    'LOBHA': 'greed',
    'MOHA': 'attachment',
    'MADA': 'ego',
    'MATSARYA': 'jealousy'
  };

  const enemyName = enemyNames[topEnemy] || 'inner obstacles';

  return `You are analyzing a user's self-awareness data. Be direct, factual, and concise (max 4 lines).

STRICT RULES:
- NEVER give advice or predictions
- NEVER diagnose or counsel
- ONLY state observed patterns from data
- If data is insufficient, say so clearly
- Be grounded and practical

USER DATA THIS WEEK:
- Primary challenge: ${enemyName} (appeared ${topEnemyCount} times)
- Check-ins: ${checkInDays} days
- Meditation: ${meditationDays} days (${meditationConsistency}% consistency)
- Impact: ${enemyReduction > 0 ? `${enemyReduction}% reduction on meditation days` : 'No clear pattern yet'}

Generate a 3-4 line summary that:
1. States what dominated this week
2. Notes meditation impact (if any)
3. Observes one pattern
4. NO advice, NO predictions, NO therapy talk`;
}

/**
 * Build prompt for reflection questions
 */
function buildReflectionPrompt(data) {
  const {
    topEnemy,
    meditationDays,
    enemyReduction,
  } = data;

  const enemyNames = {
    'KAMA': 'craving',
    'KRODHA': 'anger',
    'LOBHA': 'greed',
    'MOHA': 'attachment',
    'MADA': 'ego',
    'MATSARYA': 'jealousy'
  };

  const enemyName = enemyNames[topEnemy] || 'inner obstacles';

  return `Generate 2-3 reflection questions based on this data:
- Primary challenge: ${enemyName}
- Meditation days: ${meditationDays}
- Impact: ${enemyReduction > 0 ? `${enemyReduction}% reduction` : 'unclear'}

Questions should:
- Help user observe their own patterns
- Be specific to their data
- NOT give advice or solutions
- Be answerable from their experience

Format: One question per line, ending with ?`;
}

/**
 * Fallback summary when Gemini is unavailable
 */
function generateFallbackSummary(data) {
  const {
    topEnemy,
    topEnemyCount,
    meditationDays,
    enemyReduction,
  } = data;

  const enemyNames = {
    'KAMA': 'craving',
    'KRODHA': 'anger',
    'LOBHA': 'greed',
    'MOHA': 'attachment',
    'MADA': 'ego',
    'MATSARYA': 'jealousy'
  };

  const enemyName = enemyNames[topEnemy] || 'inner obstacles';

  if (meditationDays === 0) {
    return `This week, ${enemyName} appeared ${topEnemyCount} times. No meditation sessions recorded. Data shows patterns but needs more consistency to reveal deeper insights.`;
  }

  if (enemyReduction > 0) {
    return `This week, ${enemyName} dominated with ${topEnemyCount} occurrences. On ${meditationDays} meditation days, intensity reduced by ${enemyReduction}%. Your practice shows measurable impact.`;
  }

  return `This week, ${enemyName} appeared ${topEnemyCount} times. Meditated ${meditationDays} days. Patterns emerging but need more data to identify clear correlations.`;
}

/**
 * Fallback questions when Gemini is unavailable
 */
function generateFallbackQuestions(data) {
  const { topEnemy, meditationDays } = data;

  const enemyNames = {
    'KAMA': 'craving',
    'KRODHA': 'anger',
    'LOBHA': 'greed',
    'MOHA': 'attachment',
    'MADA': 'ego',
    'MATSARYA': 'jealousy'
  };

  const enemyName = enemyNames[topEnemy] || 'inner obstacles';

  const questions = [
    `What situations triggered ${enemyName} most this week?`,
    `On days you meditated, how did ${enemyName} feel different?`,
  ];

  if (meditationDays > 0) {
    questions.push(`What made you choose to meditate on those ${meditationDays} days?`);
  } else {
    questions.push(`What prevented you from meditating this week?`);
  }

  return questions;
}

/**
 * Validate Gemini API key
 */
function isGeminiConfigured() {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0;
}

module.exports = {
  generateWeeklySummary,
  generateReflectionQuestions,
  isGeminiConfigured,
};