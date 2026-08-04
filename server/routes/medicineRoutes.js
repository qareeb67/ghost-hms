const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const validateMedicine = require("../middlewares/medicineValidation");

const {
    createMedicine,
    getAllMedicines,
    getMedicineById
} = require("../controllers/medicineController");

// Get all medicines
router.get(
    "/",
    authenticateToken,
    getAllMedicines
);

// Get medicine by ID
router.get(
    "/:id",
    authenticateToken,
    getMedicineById
);

// Create medicine
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "staff"),
    validateMedicine,
    createMedicine
);

module.exports = router;