const { body, param } = require("express-validator");

const validateRequest =
    require("./validateRequest");

const VALID_ROLES = [
    "admin",
    "doctor",
    "nurse",
    "receptionist",
    "cashier",
    "accountant",
    "pharmacist",
    "lab_technician",
    "staff"
];

const validateUser = [
    body("username")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage(
            "Username must be between 2 and 100 characters"
        ),

    body("email")
        .trim()
        .isEmail()
        .withMessage(
            "Please provide a valid email"
        )
        .normalizeEmail(),

    body("password")
        .isLength({ min: 8, max: 128 })
        .withMessage(
            "Password must be between 8 and 128 characters"
        ),

    body("role")
        .optional()
        .isIn(VALID_ROLES)
        .withMessage("Invalid user role"),

    validateRequest
];

const validateAdminUserUpdate = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid user ID"),

    body("username")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage(
            "Username must be between 2 and 100 characters"
        ),

    body("email")
        .trim()
        .isEmail()
        .withMessage(
            "Please provide a valid email"
        )
        .normalizeEmail(),

    body("role")
        .isIn(VALID_ROLES)
        .withMessage("Invalid user role"),

    validateRequest
];

const validateProfileUpdate = [
    body("username")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage(
            "Username must be between 2 and 100 characters"
        ),

    body("email")
        .trim()
        .isEmail()
        .withMessage(
            "Please provide a valid email"
        )
        .normalizeEmail(),

    validateRequest
];

const validatePasswordChange = [
    body("currentPassword")
        .isLength({ min: 1, max: 128 })
        .withMessage("Current password is required"),

    body("newPassword")
        .isLength({ min: 8, max: 128 })
        .withMessage(
            "New password must be between 8 and 128 characters"
        ),

    validateRequest
];

const validateLogin = [
    body("email")
        .trim()
        .isEmail()
        .withMessage(
            "Please provide a valid email"
        )
        .normalizeEmail(),

    body("password")
        .isLength({ min: 1, max: 128 })
        .withMessage("Password is required"),

    validateRequest
];

module.exports = {
    VALID_ROLES,
    validateUser,
    validateAdminUserUpdate,
    validateProfileUpdate,
    validatePasswordChange,
    validateLogin
};
