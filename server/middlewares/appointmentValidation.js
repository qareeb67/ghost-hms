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
        .notEmpty()
        .withMessage("Appointment time is required"),

    body("reason")
        .notEmpty()
        .withMessage("Reason for appointment is required"),

    body("status")
        .isIn(["Scheduled", "Completed", "Cancelled"])
        .withMessage("Status must be Scheduled, Completed, or Cancelled"),

    validateRequest

];

module.exports = validateAppointment;