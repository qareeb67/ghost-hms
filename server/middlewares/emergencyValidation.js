const { body } = require("express-validator");
const validateRequest = require("./validateRequest");

const validateEmergency = [

    body("triage_level")
        .notEmpty()
        .withMessage("Triage level is required")
        .isIn(["Critical", "High", "Medium", "Low"])
        .withMessage("Invalid triage level"),

    body("status")
        .optional()
        .isIn(["Waiting", "In Treatment", "Completed"])
        .withMessage("Invalid status"),

    validateRequest

];

module.exports = validateEmergency;