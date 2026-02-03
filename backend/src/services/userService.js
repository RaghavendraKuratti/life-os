const { FieldPath } = require("firebase-admin/firestore");
const { db } = require("../config/firebase");
const { todayString, daysAgoDate, todayISO } = require("../utils/dateUtils");


async function createUserInfo(body) {
    try {
        const {
            uid,
            displayName,
            email,
            photoURL,
            providerData,
            phoneNumber,
            intent,
            defaultEnemy,
            primaryEnemies,
            dailyReminder,
            reminderTime,
            onboardingCompleted,
            onboardingDate
         } = body;
        const defaultUserProfile = {
            contact: phoneNumber || '',
            email: email,
            dailyReminder: dailyReminder !== undefined ? dailyReminder : false,
            darkMode: false,
            defaultEnemy: defaultEnemy || "",
            primaryEnemies: primaryEnemies || [],
            intent: intent || "",
            firstName: displayName ? displayName.split(" ")[0] : "",
            journalingReminder: false,
            lastName: displayName ? displayName.split(" ")[1] : "",
            meditationSound: "silence",
            meditationStreaks: {
              checkinDays: 0,
              highestScore: 0,
              lastCheckin: todayISO(),
            },
            notifications: false,
            profilePic: photoURL || "",
            reminderTime: reminderTime || "",
            streaks: {
              checkinDays: 1,
              highestScore: 1,
              lastCheckin: todayISO(),
            },
            provider: providerData[0]?.providerId,
            onboardingCompleted: onboardingCompleted || false,
            onboardingDate: onboardingDate || null
          };

          const userRef = db.collection('users').doc(uid);;
          const userSnap = await userRef.get();
          if (!userSnap.exists) {
            await userRef.set(defaultUserProfile);
            console.log("New User Created:", uid);
          } else {
            console.log("User already exist:", uid);
          }
          return {success: true, uid};
    } catch(ex) {
        throw ex;
    }
}
// export enum ProgressReq {
//     WEEKLY = 0,
//     MONTHLY = 1,
//     HALF_YEARLY = 2,
//     YEARLY = 3
// }

async function progress(userId, key, startDate, endDate) {
    // Query from new global enemyCheckins collection
    // Using only userid to avoid composite index requirement
    // Then filter by enemy and timestamp in memory
    const ref = db.collection("enemyCheckins")
        .where("userid", "==", userId);

    const snapShot = await ref.get();

    if (snapShot.empty) {
        return [];
    }

    const results = [];
    snapShot.forEach(doc => {
        const data = doc.data();
        // Extract date from full ISO timestamp for comparison
        const checkInDate = data.timestamp ? data.timestamp.split('T')[0] : null;
        
        // Filter by enemy and date range in memory
        if (data.enemy === key &&
            checkInDate &&
            checkInDate >= startDate &&
            checkInDate <= endDate) {
            results.push({
                date: data.timestamp,
                rating: data.intensity || 0,  // Use intensity for rating
                intensity: data.intensity || 0,
                ...data
            });
        }
    });
    return results;
}

async function dailyProgress(userId, key, date) {
    // Query from new global enemyCheckins collection for today
    // Since timestamp is stored as full ISO string, we need to filter by date prefix
    const ref = db.collection("enemyCheckins")
        .where("userid", "==", userId)
        .where("enemy", "==", key);
    
    const snap = await ref.get();
    
    if (snap.empty) {
        return { average: 0, count: 0, total: 0 };
    }
    
    let total = 0;
    let count = 0;
    
    snap.forEach(doc => {
        const data = doc.data();
        // Filter by date in memory since timestamp is full ISO string
        if (data.timestamp && data.timestamp.startsWith(date)) {
            // Use intensity (1-5 scale) for progress calculation
            total += data.intensity || 0;
            count++;
        }
    });
    
    const average = count > 0 ? total / count : 0;
    
    return { average, count, total };
}

async function fetchProgress(userId, key, progressReq = 0) {
    switch (progressReq) {
        case 0:
            // Today's progress
            return dailyProgress(userId, key, todayString()).then(data => {
                return data;
            })
        case 1:
            // Last 7 days average
            return progress(userId, key, daysAgoDate(7), todayString()).then(data => {
                return computeAverage(data);
            })
        case 2:
            // Last 30 days average
            return progress(userId, key, daysAgoDate(30), todayString()).then(data => {
                return computeAverage(data);
            })
        case 3:
            // Last 180 days average
            return progress(userId, key, daysAgoDate(180), todayString()).then(data => {
                return computeAverage(data);
            })
        default:
            // Last 365 days average
            return progress(userId, key, daysAgoDate(365), todayString()).then(data => {
                return computeAverage(data);
            })
    }
}

function computeAverage(data) {
    if (data.length === 0) {
        return { average: 0, count: 0, total: 0 };
    }

    // Calculate average from selfRating (0-2 scale)
    const total = data.reduce((sum, d) => sum + (d.rating || 0), 0);
    const count = data.length;
    const average = count > 0 ? total / count : 0;
    
    return {
        total,
        count,
        average
    };
}

async function saveUserInfo(uid, info) {
    try {
        if (!uid) {
            throw new Error("User id required");
        }
        const userRef = db.collection('users').doc(uid);
        const userSnap = await userRef.get();
        
        // If user doesn't exist, create with default values first
        if (!userSnap.exists) {
            console.log(`User ${uid} not found, creating default profile...`);
            const defaultProfile = {
                contact: '',
                email: info.email || '',
                dailyReminder: false,
                darkMode: false,
                defaultEnemy: "",
                primaryEnemies: [],
                intent: "",
                firstName: "",
                journalingReminder: false,
                lastName: "",
                meditationSound: "silence",
                meditationStreaks: {
                    checkinDays: 0,
                    highestScore: 0,
                    lastCheckin: new Date().toISOString(),
                },
                notifications: false,
                profilePic: "",
                reminderTime: "",
                streaks: {
                    checkinDays: 1,
                    highestScore: 1,
                    lastCheckin: new Date().toISOString(),
                },
                onboardingCompleted: false,
                onboardingDate: null
            };
            await userRef.set(defaultProfile);
            console.log(`Default profile created for user ${uid}`);
        }

        const updateData = {};

        // Only add fields that are provided (not undefined or null)
        if (info["firstName"] !== undefined && info["firstName"] !== null) updateData.firstName = info["firstName"];
        if (info["lastName"] !== undefined && info["lastName"] !== null) updateData.lastName = info["lastName"];
        if (info["contact"] !== undefined && info["contact"] !== null) updateData.contact = info["contact"];
        if (info["profilePic"] !== undefined && info["profilePic"] !== null) updateData.profilePic = info["profilePic"];
        if (info["dailyReminder"] !== undefined && info["dailyReminder"] !== null) updateData.dailyReminder = info["dailyReminder"];
        if (info["reminderTime"] !== undefined && info["reminderTime"] !== null) updateData.reminderTime = info["reminderTime"];
        if (info["jounralingReminder"] !== undefined && info["jounralingReminder"] !== null) updateData.jounralingReminder = info["jounralingReminder"];
        if (info["defaultEnemy"] !== undefined && info["defaultEnemy"] !== null) updateData.defaultEnemy = info["defaultEnemy"];
        if (info["darkMode"] !== undefined && info["darkMode"] !== null) updateData.darkMode = info["darkMode"];
        if (info["notifications"] !== undefined && info["notifications"] !== null) updateData.notifications = info["notifications"];
        if (info["meditationSound"] !== undefined && info["meditationSound"] !== null) updateData.meditationSound = info["meditationSound"];
        if (info["primaryEnemies"] !== undefined && info["primaryEnemies"] !== null) updateData.primaryEnemies = info["primaryEnemies"];
        if (info["intent"] !== undefined && info["intent"] !== null) updateData.intent = info["intent"];
        if (info["onboardingCompleted"] !== undefined && info["onboardingCompleted"] !== null) updateData.onboardingCompleted = info["onboardingCompleted"];
        if (info["onboardingDate"] !== undefined && info["onboardingDate"] !== null) updateData.onboardingDate = info["onboardingDate"];
        if (info["email"] !== undefined && info["email"] !== null) updateData.email = info["email"];

        // Only update if there's data to update
        if (Object.keys(updateData).length === 0) {
            return {
                success: true,
                message: "No changes to update",
                data: userRef.id,
            }
        }

        await userRef.update(updateData);
        console.log(`User ${uid} updated with:`, updateData);
        
        return {
            success: true,
            message: "User info saved successfully",
            data: userRef.id,
        }
    } catch(ex) {
        console.error("Error in saveUserInfo:", ex);
        throw ex;
    }

}

async function getUserInfo(userId) {
    try {
        if (!userId) {
            throw new Error("User id required");
        }
        const userRef = db.collection('users').doc(userId);
        const userSnap = await userRef.get();
        return userSnap.data();
    } catch(ex) {
        throw ex;
    }
}


module.exports = { progress, dailyProgress, fetchProgress, saveUserInfo, getUserInfo, createUserInfo }

