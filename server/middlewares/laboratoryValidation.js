const { body } = require("express-validator");
const validateRequest = require("./validateRequest");

const validateLaboratoryTest = [

    body("patient_id")
        .isInt({ min: 1 })
        .withMessage("Valid patient ID is required"),

    body("doctor_id")
        .isInt({ min: 1 })
        .withMessage("Valid doctor ID is required"),

    body("test_name")
        .notEmpty()
        .withMessage("Test name is required"),

    validateRequest

];

module.exports = validateLaboratoryTest;