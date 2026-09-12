const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middlewares/authMiddleware");

const authorizeRoles =
    require("../middlewares/roleMiddleware");

const validateMedicalRecord =
    require("../middlewares/medicalRecordValidation");

const {
    createMedicalRecord,
    getAllMedicalRecords,
    getMedicalRecordById,
    getPatientMedicalRecords,
    updateMedicalRecord,
    deleteMedicalRecord
} = require("../controllers/medicalRecordController");


// Get all medical records

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor"
    ),
    getAllMedicalRecords
);


// Get medical records by patient

router.get(
    "/patient/:patientId",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor"
    ),
    getPatientMedicalRecords
);


// Get medical record by ID

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor"
    ),
    getMedicalRecordById
);


// Create medical record

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "doctor",
        "admin"
    ),
    validateMedicalRecord,
    createMedicalRecord
);


// Update medical record

router.patch(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "doctor",
        "admin"
    ),
    validateMedicalRecord,
    updateMedicalRecord
);


// Delete medical record

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "admin"
    ),
    deleteMedicalRecord
);


module.exports = router;