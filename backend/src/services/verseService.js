const { db } = require('../config/firebase');
const { todayString, yesterdayString } = require('../utils/dateUtils');

async function getTodaysVerse() {
    const today = todayString();
    
	const snapshot = await db.collection('verses')
    // .where('date', '==', today)
    .limit(1)
    .get();
    if (snapshot.empty) {
        return null;
    }
    return snapshot.docs[0].data();
}
module.exports = { getTodaysVerse };