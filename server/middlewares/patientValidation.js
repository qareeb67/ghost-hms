const { body } = require("express-validator");
const validateRequest = require("./validateRequest");

// Validation Rules
const validatePatient = [

    body("first_name")
        .notEmpty()
        .withMessage("First name is required"),

    body("last_name")
        .notEmpty()
        .withMessage("Last name is required"),

    body("gender")
        .isIn(["Male", "Female", "Other"])
        .withMessage("Gender must be Male, Female, or Other"),

    body("phone")
        .notEmpty()
        .withMessage("Phone number is required"),

    body("email")
        .isEmail()
        .withMessage("Please provide a valid email"),

    body("date_of_birth")
        .isDate()
        .withMessage("Please provide a valid date"),

    body("address")
        .notEmpty()
        .withMessage("Address is required"),

    validateRequest

];

module.exports = validatePatient;