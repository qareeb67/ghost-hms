const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const validateLaboratoryTest = require("../middlewares/laboratoryValidation");

const {
    createLaboratoryTest,
    getAllLaboratoryTests,
    getLaboratoryTestById
} = require("../controllers/laboratoryController");

// Get all laboratory tests
router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor"
    ),
    getAllLaboratoryTests
);

// Get laboratory test by ID
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor"
    ),
    getLaboratoryTestById
);

// Create laboratory test request
router.post(
    "/",
    authenticateToken,
    authorizeRoles("doctor", "admin"),
    validateLaboratoryTest,
    createLaboratoryTest
);

module.exports = router;