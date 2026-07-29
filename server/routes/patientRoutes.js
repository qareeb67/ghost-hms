const express = require("express");
const router = express.Router();

const {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    searchPatients
} = require("../controllers/patientController");

// Get all patients
router.get("/", getAllPatients);

// Search patients
router.get("/search", searchPatients);

// Get one patient by ID
router.get("/:id", getPatientById);

// Create a patient
router.post("/", createPatient);

// Update a patient
router.put("/:id", updatePatient);

// Delete a patient
router.delete("/:id", deletePatient);

module.exports = router;