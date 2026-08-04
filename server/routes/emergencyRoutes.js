const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const validateEmergency = require("../middlewares/emergencyValidation");

const {
    createEmergencyCase,
    getAllEmergencyCases,
    getEmergencyCaseById
} = require("../controllers/emergencyController");

// Get all emergency cases
router.get(
    "/",
    authenticateToken,
    getAllEmergencyCases
);

// Get emergency case by ID
router.get(
    "/:id",
    authenticateToken,
    getEmergencyCaseById
);

// Create emergency case
router.post(
    "/",
    authenticateToken,
    authorizeRoles("doctor", "admin", "receptionist"),
    validateEmergency,
    createEmergencyCase
);

module.exports = router;