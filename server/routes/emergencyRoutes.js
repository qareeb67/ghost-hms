const express = require("express");

const router = express.Router();


const authenticateToken =
    require("../middlewares/authMiddleware");

const authorizeRoles =
    require("../middlewares/roleMiddleware");


const {
    validateCreateEmergency,
    validateUpdateEmergency,
    validateEmergencyStatus,
    validateEmergencyDoctor,
    validateEmergencyId
} = require("../middlewares/emergencyValidation");


const {
    createEmergencyCase,
    getAllEmergencyCases,
    getEmergencyCaseById,
    updateEmergencyCase,
    updateEmergencyStatus,
    assignEmergencyDoctor,
    deleteEmergencyCase
} = require("../controllers/emergencyController");


// ==================================================
// GET ALL EMERGENCY CASES
// ==================================================

router.get(
    "/",

    authenticateToken,

    authorizeRoles(
        "admin",
        "doctor",
        "receptionist"
    ),

    getAllEmergencyCases
);


// ==================================================
// GET ONE EMERGENCY CASE
// ==================================================

router.get(
    "/:id",

    authenticateToken,

    authorizeRoles(
        "admin",
        "doctor",
        "receptionist"
    ),

    validateEmergencyId,

    getEmergencyCaseById
);


// ==================================================
// CREATE EMERGENCY CASE
// ==================================================

router.post(
    "/",

    authenticateToken,

    authorizeRoles(
        "admin",
        "doctor",
        "receptionist"
    ),

    validateCreateEmergency,

    createEmergencyCase
);


// ==================================================
// UPDATE EMERGENCY CASE
// ==================================================

router.patch(
    "/:id",

    authenticateToken,

    authorizeRoles(
        "admin",
        "doctor"
    ),

    validateUpdateEmergency,

    updateEmergencyCase
);


// ==================================================
// UPDATE STATUS
// ==================================================

router.patch(
    "/:id/status",

    authenticateToken,

    authorizeRoles(
        "admin",
        "doctor"
    ),

    validateEmergencyStatus,

    updateEmergencyStatus
);


// ==================================================
// ASSIGN / UNASSIGN DOCTOR
// ==================================================

router.patch(
    "/:id/doctor",

    authenticateToken,

    authorizeRoles(
        "admin",
        "doctor"
    ),

    validateEmergencyDoctor,

    assignEmergencyDoctor
);


// ==================================================
// DELETE
// ==================================================

router.delete(
    "/:id",

    authenticateToken,

    authorizeRoles(
        "admin"
    ),

    validateEmergencyId,

    deleteEmergencyCase
);


module.exports = router;