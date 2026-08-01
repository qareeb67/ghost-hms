const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const {
    getDashboardStats
} = require("../controllers/dashboardController");

// Dashboard Statistics
router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    getDashboardStats
);

module.exports = router;