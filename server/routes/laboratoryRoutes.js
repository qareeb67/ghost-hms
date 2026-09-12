const express = require("express");
const router = express.Router();


const authenticateToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const validateLaboratoryTest = require("../middlewares/laboratoryValidation");
const validateLaboratoryCompletion =
    require("../middlewares/laboratoryCompletionValidation");

const {
    createLaboratoryTest,
    getAllLaboratoryTests,
    getLaboratoryTestById,
    updateLaboratoryTest,
    completeLaboratoryTest,
    deleteLaboratoryTest
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

// Complete laboratory test
router.patch(
    "/:id/complete",
    authenticateToken,
    authorizeRoles("doctor", "admin"),
    validateLaboratoryCompletion,
    completeLaboratoryTest
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

// Update laboratory test
router.patch(
    "/:id",
    authenticateToken,
    authorizeRoles("doctor", "admin"),
    validateLaboratoryTest,
    updateLaboratoryTest
);

// Delete laboratory test
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteLaboratoryTest
);

module.exports = router;