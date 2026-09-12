require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const pool = require("./config/db");

const {
    securityHeaders,
    corsOrigin,
    validateRequiredEnv
} = require("./middlewares/security");
const errorHandler = require("./middlewares/errorHandler");

validateRequiredEnv();

const app = express();

app.disable("x-powered-by");

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

app.use(securityHeaders);
app.use(
    cors({
        origin: corsOrigin,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
        maxAge: 86400
    })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const departmentRoutes =
    require("./routes/departmentRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const laboratoryRoutes = require("./routes/laboratoryRoutes");
const billingRoutes = require("./routes/billingRoutes");
const syncRoutes = require("./routes/syncRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const doctorQualificationRoutes = require("./routes/doctorQualificationRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");

app.use("/patients", patientRoutes);
app.use("/users", userRoutes);
app.use("/notifications", notificationRoutes);
app.use("/doctors", doctorRoutes);
app.use(
    "/departments",
    departmentRoutes
);
app.use("/prescriptions", prescriptionRoutes);
app.use("/doctors", doctorQualificationRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/medical-records", medicalRecordRoutes);

if (
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_API_DOCS === "true"
) {
    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec)
    );
}

app.use("/emergency", emergencyRoutes);
app.use("/medicines", medicineRoutes);
app.use("/laboratory", laboratoryRoutes);
app.use("/billing", billingRoutes);
app.use("/payments", paymentRoutes);
app.use("/sync", syncRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hospital Management System API"
    });
});

if (process.env.NODE_ENV !== "production") {
    app.get("/test-db", async (req, res, next) => {
        try {
            const result = await pool.query("SELECT NOW()");
            res.json(result.rows);
        } catch (err) {
            next(err);
        }
    });
}

// Consistent API response for unknown endpoints.
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
