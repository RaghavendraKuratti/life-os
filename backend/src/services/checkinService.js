const { db, admin } =  require("../config/firebase");
const { todayString, daysAgoTS, todayISO } = require("../utils/dateUtils");
const enemies = {
    KAMA: 'KAMA',
    KRODHA: 'KRODHA',
    LOBHA: 'LOBHA',
    MOHA: 'MOHA',
    MADA: 'MADA',
    MATSARYA: 'MATSARYA'
}
// async function saveCheckin(userid, responses) {
//     const total = Object.values(responses).reduce((t,i)  => t + (+i || 0), 0);
//     // const now = todayString();
//     const now = daysAgoTS(7);
//     const id = `${userid}_${now}`;
//     await db.collection("enemyCheckins").doc(id).set({
//         userid,
//         date: now,
//         responses,
//         totalScore: total,
//         timestamp: serverTimestamp()
//     }, {merge: true});
// }
async function saveCheckin(userid, enemy, checkinData) {
    let keys = Object.keys(enemies);
    try {
        const checkInRef = db.collection('enemyCheckins');
        
        // Extract data with defaults
        const {
            intensity = null,
            triggers = [],
            notes = '',
            timeOfDay = getTimeOfDay()
        } = checkinData;
        
        // Create checkin document
        const checkinDoc = {
            enemy,
            userid,
            intensity,
            triggers,
            notes,
            timeOfDay,
            timestamp: todayISO(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Remove null values to keep database clean
        Object.keys(checkinDoc).forEach(key => {
            if (checkinDoc[key] === null || checkinDoc[key] === undefined) {
                delete checkinDoc[key];
            }
        });
        
        await checkInRef.add(checkinDoc);
        return fetchRemaining();
    } catch(e) {
        console.log("error", e);
        throw e;
    }
}

// Helper function to determine time of day
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
}

async function fetchRemaining() {
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
        return keys.filter(enemy => !result.includes(enemy));
    } catch(e) {
        console.log("error", e);
        throw e;
    }
}

async function saveJournel(userId, tags, reflection, moodBefore = null, moodAfter = null) {
    try {
        const journelRef = db.collection("journels");
        const journalData = {
            userId,
            note: reflection,
            tags,
            createdAt: todayISO(),
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Add mood data if provided
        if (moodBefore) journalData.moodBefore = moodBefore;
        if (moodAfter) journalData.moodAfter = moodAfter;
        
        // Add metadata
        journalData.wordCount = reflection.trim().split(/\s+/).length;
        journalData.characterCount = reflection.length;
        
        await journelRef.add(journalData);
    } catch(ex) {
        throw ex;
    }
}

/**
 * Get journal entries for a user with optional filters
 */
async function getJournalEntries(userId, options = {}) {
    try {
        const {
            limit = 50,
            startDate = null,
            endDate = null,
            enemy = null
        } = options;
        
        let query = db.collection("journels")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc");
        
        if (limit) {
            query = query.limit(limit);
        }
        
        const snapshot = await query.get();
        let entries = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            entries.push({
                id: doc.id,
                ...data
            });
        });
        
        // Filter in memory to avoid index requirements
        if (startDate) {
            entries = entries.filter(e => e.createdAt >= startDate);
        }
        if (endDate) {
            entries = entries.filter(e => e.createdAt <= endDate);
        }
        if (enemy) {
            entries = entries.filter(e => e.tags && e.tags.includes(enemy));
        }
        
        return entries;
    } catch(ex) {
        throw ex;
    }
}

/**
 * Get journal analytics for a user
 */
async function getJournalAnalytics(userId, days = 30) {
    try {
        const startDate = daysAgoTS(days);
        const entries = await getJournalEntries(userId, { startDate });
        
        // Calculate analytics
        const analytics = {
            totalEntries: entries.length,
            averageWordCount: 0,
            averageCharacterCount: 0,
            enemyDistribution: {},
            moodTrends: {
                before: {},
                after: {},
                improvement: 0
            },
            writingFrequency: {},
            longestEntry: 0,
            shortestEntry: Infinity,
            streak: 0
        };
        
        if (entries.length === 0) {
            return analytics;
        }
        
        let totalWords = 0;
        let totalChars = 0;
        let moodImprovementCount = 0;
        let moodComparisonCount = 0;
        
        // Process each entry
        entries.forEach(entry => {
            // Word and character counts
            totalWords += entry.wordCount || 0;
            totalChars += entry.characterCount || 0;
            
            // Track longest/shortest
            if (entry.wordCount > analytics.longestEntry) {
                analytics.longestEntry = entry.wordCount;
            }
            if (entry.wordCount < analytics.shortestEntry && entry.wordCount > 0) {
                analytics.shortestEntry = entry.wordCount;
            }
            
            // Enemy distribution
            if (entry.tags && Array.isArray(entry.tags)) {
                entry.tags.forEach(tag => {
                    analytics.enemyDistribution[tag] = (analytics.enemyDistribution[tag] || 0) + 1;
                });
            }
            
            // Mood tracking
            if (entry.moodBefore) {
                analytics.moodTrends.before[entry.moodBefore] =
                    (analytics.moodTrends.before[entry.moodBefore] || 0) + 1;
            }
            if (entry.moodAfter) {
                analytics.moodTrends.after[entry.moodAfter] =
                    (analytics.moodTrends.after[entry.moodAfter] || 0) + 1;
            }
            
            // Mood improvement (if both moods recorded)
            if (entry.moodBefore && entry.moodAfter) {
                const moodValues = { sad: 1, neutral: 2, happy: 3 };
                if (moodValues[entry.moodAfter] > moodValues[entry.moodBefore]) {
                    moodImprovementCount++;
                }
                moodComparisonCount++;
            }
            
            // Writing frequency by day
            const date = entry.createdAt.split('T')[0];
            analytics.writingFrequency[date] = (analytics.writingFrequency[date] || 0) + 1;
        });
        
        // Calculate averages
        analytics.averageWordCount = Math.round(totalWords / entries.length);
        analytics.averageCharacterCount = Math.round(totalChars / entries.length);
        
        // Calculate mood improvement percentage
        if (moodComparisonCount > 0) {
            analytics.moodTrends.improvement =
                Math.round((moodImprovementCount / moodComparisonCount) * 100);
        }
        
        // Calculate streak
        analytics.streak = calculateJournalStreak(entries);
        
        return analytics;
    } catch(ex) {
        throw ex;
    }
}

/**
 * Calculate consecutive days of journaling
 */
function calculateJournalStreak(entries) {
    if (entries.length === 0) return 0;
    
    // Get unique dates, sorted descending
    const dates = [...new Set(entries.map(e => e.createdAt.split('T')[0]))].sort().reverse();
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);
    
    for (const date of dates) {
        const entryDate = new Date(date);
        const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

async function aggregateWeekly(userId, startTs, endTs) {
    const ref = db.collection("enemyCheckins")
    
    .where("userid", "==", userId)
    .where("timestamp", ">=", startTs)
    .where("timestamp", "<=", endTs);
    console.log("aggregateWeekly", userId, startTs, endTs);
    
    const snaps = await ref.get();
    const sums = {}, counts = {};
    
    Object.keys(enemies).forEach(enemy => {
       if (!sums[enemy]) sums[enemy] = 0;
       if (!counts[enemy]) counts[enemy] = 0;
    })
    // console.log("aggregateWeekly", snaps);
    snaps.forEach(d => {
        const r = d.data().responses || {};
        console.log("aggregateWeekly 42", r);
        Object.keys(sums).forEach(k => {
            if (typeof r[k] === "number") {
                sums[k] += r[k];
                counts[k]++;
            }
        })
    })

    console.log("sums", sums);
    console.log("counts", counts);
    const averages = {};
    Object.keys(sums).forEach(k => {
        averages[k] = counts[k] ? (sums[k]/counts[k]) : 0;
    })
    console.log("averages", averages);
    return averages;
}

module.exports = {
    saveCheckin,
    aggregateWeekly,
    saveJournel,
    getJournalEntries,
    getJournalAnalytics
}