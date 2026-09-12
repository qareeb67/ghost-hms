const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const validateMedicine = require("../middlewares/medicineValidation");

const {
    createMedicine,
    getAllMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine,
    searchMedicines
} = require("../controllers/medicineController");


// Get all medicines
router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),
    getAllMedicines
);


// Search medicines
router.get(
    "/search",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),
    searchMedicines
);


// Get medicine by ID
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),
    getMedicineById
);


// Create medicine
router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "admin",
        "staff"
    ),
    validateMedicine,
    createMedicine
);


// Update medicine
router.patch(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "admin",
        "staff"
    ),
    validateMedicine,
    updateMedicine
);


// Delete medicine
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "admin",
        "staff"
    ),
    deleteMedicine
);


module.exports = router;