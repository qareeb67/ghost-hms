const { body } = require("express-validator");
const validateRequest = require("./validateRequest");

const validateBill = [

    body("patient_id")
        .isInt({ min: 1 })
        .withMessage("Valid patient ID is required"),

    body("amount")
        .isFloat({ min: 0 })
        .withMessage("Valid amount is required"),

    body("service")
        .notEmpty()
        .withMessage("Service is required"),

    body("payment_status")
        .optional()
        .isIn(["Pending", "Paid"])
        .withMessage("Payment status must be Pending or Paid"),

    body("payment_method")
        .optional()
        .isIn(["Cash", "Card", "Transfer", "Insurance"])
        .withMessage("Invalid payment method"),

    validateRequest

];

module.exports = validateBill;