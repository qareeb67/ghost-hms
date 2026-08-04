require("dotenv").config();

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const express = require("express");
const app = express();

const pool = require("./config/db");

const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const errorHandler = require("./middlewares/errorHandler");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const laboratoryRoutes = require("./routes/laboratoryRoutes");
const billingRoutes = require("./routes/billingRoutes");
const syncRoutes = require("./routes/syncRoutes");

// Middleware
app.use(express.json());

// Routes
app.use("/patients", patientRoutes);
app.use("/users", userRoutes);
app.use("/doctors", doctorRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/medical-records", medicalRecordRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/emergency", emergencyRoutes);
app.use("/medicines", medicineRoutes);
app.use("/laboratory", laboratoryRoutes);
app.use("/billing", billingRoutes);
app.use("/sync", syncRoutes);



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