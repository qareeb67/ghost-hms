const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const validateMedicalRecord = require("../middlewares/medicalRecordValidation");

const {
    createMedicalRecord,
    getAllMedicalRecords,
    getMedicalRecordById
} = require("../controllers/medicalRecordController");

// Get all medical records
router.get(
    "/",
    authenticateToken,
    getAllMedicalRecords
);

// Get medical record by ID
router.get(
    "/:id",
    authenticateToken,
    getMedicalRecordById
);

// Create medical record
router.post(
    "/",
    authenticateToken,
    authorizeRoles("doctor", "admin"),
    validateMedicalRecord,
    createMedicalRecord
);

module.exports = router;