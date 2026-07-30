require("dotenv").config();

const express = require("express");
const app = express();

const pool = require("./config/db");

const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const errorHandler = require("./middlewares/errorHandler");

// Middleware
app.use(express.json());

// Routes
app.use("/patients", patientRoutes);
app.use("/doctors", doctorRoutes);
app.use("/appointments", appointmentRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("🔥 THIS IS THE NEW GHOST HMS SERVER 🔥");
});

// Database Test
app.get("/test-db", async (req, res, next) => {

    try {

        const result = await pool.query("SELECT NOW()");

        res.json(result.rows);

    } catch (err) {

        next(err);

    }

});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});