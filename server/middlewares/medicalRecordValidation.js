const { body } = require("express-validator");
const validateRequest = require("./validateRequest");

const validateMedicalRecord = [

    body("patient_id")
        .notEmpty()
        .withMessage("Patient ID is required")
        .isInt()
        .withMessage("Patient ID must be an integer"),

    body("doctor_id")
        .notEmpty()
        .withMessage("Doctor ID is required")
        .isInt()
        .withMessage("Doctor ID must be an integer"),

    body("diagnosis")
        .notEmpty()
        .withMessage("Diagnosis is required"),

    body("prescription")
        .optional()
        .isString()
        .withMessage("Prescription must be text"),

    body("allergies")
        .optional()
        .isString()
        .withMessage("Allergies must be text"),

    body("notes")
        .optional()
        .isString()
        .withMessage("Notes must be text"),

    validateRequest

];

module.exports = validateMedicalRecord;