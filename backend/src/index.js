require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const versRoutes = require("./routes/verseRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const enemyRoutes = require("./routes/enemyRoutes");
const meditationRoutes = require("./routes/meditationRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const enemyOfDayRoutes = require("./routes/enemyOfDayRoutes");
const enemyAnalyticsRoutes = require("./routes/enemyAnalyticsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors())

app.use("/user", userRoutes);
app.use("/verse", versRoutes);
app.use("/checkin", checkinRoutes);
app.use("/enemy", enemyRoutes);
app.use("/meditation", meditationRoutes);
app.use("/insights", insightsRoutes);
app.use("/enemy-of-day", enemyOfDayRoutes);
app.use("/enemy-analytics", enemyAnalyticsRoutes);
app.use("/analytics", analyticsRoutes);

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));