const { body } = require("express-validator");
const validateRequest = require("./validateRequest");

const validateAppointment = [

    body("patient_id")
        .isInt({ min: 1 })
        .withMessage("Valid patient ID is required"),

    body("doctor_id")
        .isInt({ min: 1 })
        .withMessage("Valid doctor ID is required"),

    body("appointment_date")
        .isDate()
        .withMessage("Please provide a valid appointment date"),

    body("appointment_time")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Appointment time must be in HH:MM format"),

    body("reason")
        .optional({ values: "falsy" })
        .isString()
        .withMessage("Reason must be a valid text"),

    body("status")
        .isIn([
            "Scheduled",
            "Completed",
            "Cancelled"
        ])
        .withMessage(
            "Status must be Scheduled, Completed, or Cancelled"
        ),

    validateRequest
];

module.exports = validateAppointment;