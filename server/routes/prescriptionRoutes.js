const express = require("express");

const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const {
    createPrescription,
    getAllPrescriptions,
    getPrescriptionById,
    getPrescriptionsByRecordId,
    updatePrescription,
    replacePrescriptionItems,
    deletePrescription,
} = require("../controllers/prescriptionController");

// ============================================================
// PRESCRIPTION ROUTES
// ============================================================

// All prescription routes require authentication.
router.use(authenticateToken);


// ------------------------------------------------------------
// GET ALL PRESCRIPTIONS
// ------------------------------------------------------------
// Admin and doctors can view prescriptions.
router.get(
    "/",
    authorizeRoles("admin", "doctor"),
    getAllPrescriptions
);


// ------------------------------------------------------------
// GET PRESCRIPTIONS BY MEDICAL RECORD
// ------------------------------------------------------------
router.get(
    "/record/:recordId",
    authorizeRoles("admin", "doctor"),
    getPrescriptionsByRecordId
);


// ------------------------------------------------------------
// GET SINGLE PRESCRIPTION
// ------------------------------------------------------------
router.get(
    "/:id",
    authorizeRoles("admin", "doctor"),
    getPrescriptionById
);


// ------------------------------------------------------------
// CREATE PRESCRIPTION
// ------------------------------------------------------------
// Doctors and admins can create prescriptions.
router.post(
    "/",
    authorizeRoles("admin", "doctor"),
    createPrescription
);


// ------------------------------------------------------------
// UPDATE PRESCRIPTION DETAILS
// ------------------------------------------------------------
// Only doctors/admins.
router.patch(
    "/:id",
    authorizeRoles("admin", "doctor"),
    updatePrescription
);


// ------------------------------------------------------------
// REPLACE PRESCRIPTION MEDICATION ITEMS
// ------------------------------------------------------------
router.patch(
    "/:id/items",
    authorizeRoles("admin", "doctor"),
    replacePrescriptionItems
);


// ------------------------------------------------------------
// DELETE PRESCRIPTION
// ------------------------------------------------------------
// Keep deletion restricted to admins.
router.delete(
    "/:id",
    authorizeRoles("admin"),
    deletePrescription
);


module.exports = router;