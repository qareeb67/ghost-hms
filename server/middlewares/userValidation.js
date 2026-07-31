const { body } = require("express-validator");
const validateRequest = require("./validateRequest");

const validateUser = [

    body("username")
        .notEmpty()
        .withMessage("Username is required"),

    body("email")
        .isEmail()
        .withMessage("Please provide a valid email"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("role")
        .optional()
        .isIn(["admin", "doctor", "receptionist", "staff"])
        .withMessage("Invalid role"),

    validateRequest

];

module.exports = validateUser;