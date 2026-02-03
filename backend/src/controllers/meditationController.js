const { db } = require("../config/firebase");
const { updateMeditationStreak } = require("../services/streakService");
const { todayISO } = require("../utils/dateUtils");



async function saveMeditation(req, res) {
    try {
        const {userId, enemy, mantra, duration} = req.body;
        if (!userId || !enemy) {
            res.status(400).json({ 
                success: false, 
                error: "Missing required fields." 
            })
        }
        const meditationData = {
            enemy,
            mantra,
            duration: duration || 0,
            timestamp: todayISO()
        }

        const ref = await db.collection("users")
                      .doc(userId)
                      .collection('meditationHistory')
                      .add(meditationData);
        
        const streak = await updateMeditationStreak(userId);

        res.status(201).json({ 
            success: true,
            message: "Meditation saved successfully",
            data: ref.id,
            streak
        })
    } catch(ex) {
        res.status(500).json({ success: false, error: error.message })
    }
}

async function fetchMeditation(req, res) {
    try {
        const { userId } = req.params;
        const { enemy, pageSize = 1, lastDocId } = req.query;
        
        if (!userId) {
            res.status(400).json({ 
                success: false, 
                error: "Missing required fields." 
            })
        }
        let query = db.collection("users")
                      .doc(userId)
                      .collection('meditationHistory')
                      .orderBy("timestamp", "desc")
                      .limit(Number(pageSize));
        if (enemy) {
            query = query.where("enemy", "==", enemy);
        }
        if (lastDocId) {
            query = query.startAfter(lastDocId);
        }
        const snapShot = await query.get();
        
        if (snapShot.empty) {
            return res.status(200).json({
                success: true,
                message: "No data found",
                data: [],
            });
        }
        const data = snapShot.docs.map(doc => {
            return {
                id: doc.id,
                ...doc.data()
            }
        });
        const lastDoc = snapShot.docs[snapShot.docs.length - 1];
        return res.status(200).json({
            success: true,
            message: "Meditation fetched successfully",
            data,
            nextPageToken: lastDoc ? lastDoc.id : null,
        });
    } catch(ex) {
        throw ex;
    }
}

module.exports = { saveMeditation, fetchMeditation } 

