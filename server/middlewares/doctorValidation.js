const { body } = require("express-validator");
const validateRequest = require("./validateRequest");

const validateDoctor = [

    body("first_name")
        .notEmpty()
        .withMessage("First name is required"),

    body("last_name")
        .notEmpty()
        .withMessage("Last name is required"),

    body("specialization")
        .notEmpty()
        .withMessage("Specialization is required"),

    body("phone")
        .notEmpty()
        .withMessage("Phone number is required"),

    body("email")
        .isEmail()
        .withMessage("Please provide a valid email"),

    body("years_of_experience")
        .isInt({ min: 0 })
        .withMessage("Years of experience must be a positive number"),

    validateRequest

];

module.exports = validateDoctor;

