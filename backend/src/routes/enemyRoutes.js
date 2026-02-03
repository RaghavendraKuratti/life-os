const { db } = require('../config/firebase');
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try{
        const snapshot =  await db.collection("enemyList").get();
        const enemyList = snapshot.docs.map(doc => { return {id: doc.id, ...doc.data()}});
        return res.json(enemyList);
    } catch(ex) {
        res.status(500).json({error: "Something went wrong!"})
    }
});
router.get("/:enemy", async (req, res) => {
    try{
        const { enemy } = req.params;
        console.log("enemyDetails", enemy);
        const snapshot =  await db.collection("enemyList")
        .where('key', '==', enemy)
        .limit(1)
        .get();
        const enemyDetails = snapshot.docs[0].data();
        console.log("enemyDetails", enemyDetails);
        
        return res.json(enemyDetails);
    } catch(ex) {
        res.status(500).json({error: "Something went wrong!", ex: ex.message})
    }
});

module.exports = router;
