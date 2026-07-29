
require("dotenv").config();
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const express = require("express");
const pool = require("./config/db");
const patientRoutes = require("./routes/patientRoutes");
const app = express();

app.use(express.json());
app.use("/patients", patientRoutes);
app.use("/doctors", doctorRoutes);
app.use("/appointments", appointmentRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("🔥 THIS IS THE NEW GHOST HMS SERVER 🔥");
});

// Database Test
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    }catch (err) {
    console.error("Database Error:");
    console.error(err.message);

    res.status(500).json({
        success: false,
        error: err.message
    });
}
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});