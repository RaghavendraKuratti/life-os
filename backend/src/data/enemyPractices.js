/**
 * Daily micro-practices for each of the 6 enemies (Shadripu)
 * Each enemy has 7 practices (one for each day of the week)
 */

const enemyPractices = {
  KAMA: [
    {
      day: 0, // Sunday
      practice: "Observe desires without acting on them. Notice the gap between wanting and needing.",
      duration: "1 minute"
    },
    {
      day: 1, // Monday
      practice: "Practice gratitude for what you have. List 3 things you're grateful for today.",
      duration: "2 minutes"
    },
    {
      day: 2, // Tuesday
      practice: "When a desire arises, pause and breathe three times before responding.",
      duration: "Throughout the day"
    },
    {
      day: 3, // Wednesday
      practice: "Identify one desire that doesn't serve your growth. Consciously let it go.",
      duration: "1 minute"
    },
    {
      day: 4, // Thursday
      practice: "Practice contentment. Spend 5 minutes appreciating the present moment.",
      duration: "5 minutes"
    },
    {
      day: 5, // Friday
      practice: "Notice the difference between pleasure and happiness. Journal your observations.",
      duration: "3 minutes"
    },
    {
      day: 6, // Saturday
      practice: "Practice delayed gratification. Wait 10 minutes before fulfilling a desire.",
      duration: "Throughout the day"
    }
  ],
  KRODHA: [
    {
      day: 0,
      practice: "When anger arises, pause and take 5 deep breaths before responding.",
      duration: "1 minute"
    },
    {
      day: 1,
      practice: "Practice compassion. Try to understand the perspective of someone who upset you.",
      duration: "2 minutes"
    },
    {
      day: 2,
      practice: "Notice your anger triggers. Write down what situations make you angry.",
      duration: "3 minutes"
    },
    {
      day: 3,
      practice: "Before reacting, ask yourself: 'Will this matter in 5 years?'",
      duration: "Throughout the day"
    },
    {
      day: 4,
      practice: "Practice forgiveness. Let go of one grudge you've been holding.",
      duration: "5 minutes"
    },
    {
      day: 5,
      practice: "When frustrated, count to 10 slowly before speaking or acting.",
      duration: "Throughout the day"
    },
    {
      day: 6,
      practice: "Reflect on a time anger helped vs. harmed you. What did you learn?",
      duration: "3 minutes"
    }
  ],
  LOBHA: [
    {
      day: 0,
      practice: "Practice generosity. Give something away without expecting anything back.",
      duration: "Throughout the day"
    },
    {
      day: 1,
      practice: "Notice when you compare yourself to others. Shift focus to your own journey.",
      duration: "Throughout the day"
    },
    {
      day: 2,
      practice: "Identify one thing you want but don't need. Consciously choose not to pursue it.",
      duration: "1 minute"
    },
    {
      day: 3,
      practice: "Practice abundance mindset. List 5 ways you already have enough.",
      duration: "2 minutes"
    },
    {
      day: 4,
      practice: "Before making a purchase, wait 24 hours. Notice if the desire fades.",
      duration: "Throughout the day"
    },
    {
      day: 5,
      practice: "Share your knowledge or skills freely with someone today.",
      duration: "Throughout the day"
    },
    {
      day: 6,
      practice: "Reflect: What would 'enough' look like for you? Journal your thoughts.",
      duration: "5 minutes"
    }
  ],
  MOHA: [
    {
      day: 0,
      practice: "Practice detachment. Observe your thoughts without identifying with them.",
      duration: "3 minutes"
    },
    {
      day: 1,
      practice: "Notice one attachment causing you suffering. Gently loosen your grip on it.",
      duration: "Throughout the day"
    },
    {
      day: 2,
      practice: "Meditate on impermanence. Everything changes, including this moment.",
      duration: "5 minutes"
    },
    {
      day: 3,
      practice: "Practice seeing clearly. Question one assumption you've been holding.",
      duration: "2 minutes"
    },
    {
      day: 4,
      practice: "Let go of one expectation today. Notice how it feels to release control.",
      duration: "Throughout the day"
    },
    {
      day: 5,
      practice: "Observe your attachments to outcomes. Can you act without attachment to results?",
      duration: "Throughout the day"
    },
    {
      day: 6,
      practice: "Reflect on what truly matters. Write down your core values.",
      duration: "5 minutes"
    }
  ],
  MADA: [
    {
      day: 0,
      practice: "Practice humility. Acknowledge one mistake you made and what you learned.",
      duration: "2 minutes"
    },
    {
      day: 1,
      practice: "Listen more than you speak today. Truly hear others without planning your response.",
      duration: "Throughout the day"
    },
    {
      day: 2,
      practice: "Notice when ego arises. Ask: 'Am I trying to prove something?'",
      duration: "Throughout the day"
    },
    {
      day: 3,
      practice: "Celebrate someone else's success genuinely, without comparison.",
      duration: "Throughout the day"
    },
    {
      day: 4,
      practice: "Practice beginner's mind. Approach something familiar as if for the first time.",
      duration: "Throughout the day"
    },
    {
      day: 5,
      practice: "Ask for help with something today. Notice any resistance to asking.",
      duration: "Throughout the day"
    },
    {
      day: 6,
      practice: "Reflect: What would you do differently if no one was watching?",
      duration: "3 minutes"
    }
  ],
  MATSARYA: [
    {
      day: 0,
      practice: "Practice mudita (sympathetic joy). Genuinely celebrate someone's good fortune.",
      duration: "Throughout the day"
    },
    {
      day: 1,
      practice: "Notice jealousy when it arises. What unmet need is it pointing to?",
      duration: "Throughout the day"
    },
    {
      day: 2,
      practice: "Compliment someone you feel envious of. Notice how it shifts your energy.",
      duration: "Throughout the day"
    },
    {
      day: 3,
      practice: "Focus on your unique gifts. List 3 things you're good at.",
      duration: "2 minutes"
    },
    {
      day: 4,
      practice: "Practice abundance. There's enough success for everyone, including you.",
      duration: "Throughout the day"
    },
    {
      day: 5,
      practice: "Transform comparison into inspiration. How can their success guide your path?",
      duration: "3 minutes"
    },
    {
      day: 6,
      practice: "Reflect: What would you pursue if comparison didn't exist?",
      duration: "5 minutes"
    }
  ]
};

/**
 * Get the enemy and practice for today
 * Rotates through enemies based on day of year
 */
function getEnemyOfTheDay() {
  const enemies = Object.keys(enemyPractices);
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0-6 (Sunday-Saturday)
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  // Rotate through enemies based on day of year
  const enemyIndex = dayOfYear % enemies.length;
  const enemy = enemies[enemyIndex];
  
  // Get practice for current day of week
  const practice = enemyPractices[enemy][dayOfWeek];
  
  return {
    enemy,
    ...practice,
    date: today.toISOString().split('T')[0]
  };
}

module.exports = {
  enemyPractices,
  getEnemyOfTheDay
};