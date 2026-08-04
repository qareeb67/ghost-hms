const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const validateBill = require("../middlewares/billingValidation");

const {
    createBill,
    getAllBills,
    getBillById
} = require("../controllers/billingController");

// Get all bills
router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin", "staff"),
    getAllBills
);

// Get bill by ID
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "staff"),
    getBillById
);

// Create bill
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "staff"),
    validateBill,
    createBill
);

module.exports = router;