const { db } = require("./src/config/firebase");
const { saveUserAverages } = require("./src/services/streakService");
const { todayString } = require("./src/utils/dateUtils");

const enemies = {
  KAMA: 'KAMA',
  KRODHA: 'KRODHA',
  LOBHA: 'LOBHA',
  MOHA: 'MOHA',
  MADA: 'MADA',
  MATSARYA: 'MATSARYA'
}
async function seedVerse() {
    await db.collection("verses")
    .doc("verse_20250827")
    .set({
        chapter: 2,
        shloka: 47,
        text: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
        translation: "You have a right to perform your prescribed duties, but never to the fruits of your actions.",
        date: todayString(),
    });
    console.log("Seeded verse!", todayString());
}
async function seedEnemyList() {

  sixEnemies = [
    {name: 'Kama (Desire)', key: "KAMA", progress: 0.8, icon: 'heart-outline'},
    {name: 'Krodha (Anger)', key: "KRODHA", progress: 0.6, icon: 'flame-outline'},
    {name: 'Lobha (Greed)', key: "LOBHA", progress: 0.5, icon: 'cash-outline'},
    {name: 'Moha (Delusion)', key: "MOHA", progress: 0.7, icon: 'link-outline'},
    {name: 'Mada (Pride)', key: "MADA", progress: 0.3, icon: 'ribbon-outline'},
    {name: 'Matsarya (Envy)', key: "MATSARYA", progress: 0.4, icon: 'eye-outline'}
  ]
  sixEnemies.forEach(async (enemy) => {
    await db.collection("enemyList")
    .add({
      name: enemy.name,
      key: enemy.key,
      icon: enemy.icon
    });
  });
  console.log("Seeded enemy list!");
}


async function updateDailyScores() {
  const checinSnap = await db.collection("enemyCheckins").get();
  checinSnap.forEach(snap => {
    const data = snap.data();
    console.log("updateDailyScores", data);
    saveUserAverages(data.userid, data.selfRating, data.enemy)
  })
}


async function saveCheckin() {
  let keys = Object.keys(enemies);
  try {
      // const userRef = db.collection('users').doc(userid);
      const checkInRef = await db.collection('enemyCheckins')
      .where('timestamp', ">=", todayString())
      .get();
      let result = [];
      checkInRef.forEach(checkin => {
        let data = checkin.data();
        result.push(data.enemy);
      });
      result = [...new Set(result)];
      console.log(keys.filter(enemy => !result.includes(enemy)));
  } catch(e) {
      console.log("error", e);
      throw e;
  }
}

// Seed enhanced check-in data for analytics testing
async function seedEnhancedCheckins() {
  const { admin } = require("./src/config/firebase");
  const { daysAgoDate } = require("./src/utils/dateUtils");
  
  // Sample user ID (replace with your actual user ID)
  const userId = "SdjEknwehpgOrH6DOLyio06weHp1";
  
  // Trigger data for each enemy
  const triggersByEnemy = {
    KRODHA: ["Work stress", "Traffic", "Deadlines", "Meetings", "Interruptions"],
    KAMA: ["Social media", "Advertisements", "Food cravings", "Boredom", "Stress"],
    LOBHA: ["Sales", "Online shopping", "Comparison", "FOMO", "Advertisements"],
    MOHA: ["Relationships", "Nostalgia", "Comfort zone", "Routine", "Fear"],
    MADA: ["Achievements", "Compliments", "Social media likes", "Success", "Recognition"],
    MATSARYA: ["Others' success", "Social media", "Comparison", "Competition", "Achievements"]
  };
  
  const timeOfDayOptions = ["morning", "afternoon", "evening", "night"];
  const enemies = Object.keys(triggersByEnemy);
  
  console.log("Starting to seed enhanced check-in data...");
  
  // Create check-ins for the last 14 days
  for (let daysAgo = 0; daysAgo < 14; daysAgo++) {
    const date = daysAgoDate(daysAgo);
    
    // Create 1-3 check-ins per day for random enemies
    const checkinsToday = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < checkinsToday; i++) {
      const enemy = enemies[Math.floor(Math.random() * enemies.length)];
      const triggers = triggersByEnemy[enemy];
      
      // Random intensity (1-5, weighted towards middle values)
      const intensityWeights = [1, 2, 3, 3, 4, 4, 3, 2, 1];
      const intensity = intensityWeights[Math.floor(Math.random() * intensityWeights.length)];
      
      // Map intensity to old rating (0-2)
      const selfRating = intensity <= 2 ? 0 : intensity === 3 ? 1 : 2;
      
      // Select 1-3 random triggers
      const numTriggers = Math.floor(Math.random() * 3) + 1;
      const selectedTriggers = [];
      for (let t = 0; t < numTriggers; t++) {
        const trigger = triggers[Math.floor(Math.random() * triggers.length)];
        if (!selectedTriggers.includes(trigger)) {
          selectedTriggers.push(trigger);
        }
      }
      
      // Random time of day
      const timeOfDay = timeOfDayOptions[Math.floor(Math.random() * timeOfDayOptions.length)];
      
      // Sample notes
      const notes = intensity >= 4
        ? "Had a challenging moment today"
        : intensity === 3
        ? "Managed to stay aware"
        : "Feeling good about my progress";
      
      const checkinData = {
        enemy,
        userid: userId,
        selfRating,
        intensity,
        triggers: selectedTriggers,
        notes,
        timeOfDay,
        timestamp: date,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('enemyCheckins').add(checkinData);
      console.log(`✓ Added check-in for ${enemy} on ${date} (intensity: ${intensity})`);
    }
  }
  
  console.log("\n✅ Successfully seeded enhanced check-in data!");
  console.log(`📊 Created check-ins for user: ${userId}`);
  console.log(`📅 Date range: Last 14 days`);
  console.log(`\n🔍 To view analytics, use userId: ${userId}`);
  console.log(`   Or update the userId in this seed function to match your actual user ID\n`);
}

// Uncomment to run the seed functions
// seedVerse();
// seedEnemyList();
// seedEnhancedCheckins();

// Export for manual execution
module.exports = {
  seedVerse,
  seedEnemyList,
  seedEnhancedCheckins,
  updateDailyScores,
  saveCheckin
};