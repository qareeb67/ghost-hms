const { body } = require("express-validator");
const validateRequest = require("./validateRequest");

const validateMedicine = [

    body("medicine_name")
        .notEmpty()
        .withMessage("Medicine name is required"),

    body("quantity")
        .isInt({ min: 0 })
        .withMessage("Quantity must be 0 or greater"),

    body("unit_price")
        .isFloat({ min: 0 })
        .withMessage("Unit price must be a positive number"),

    body("expiry_date")
        .optional()
        .isISO8601()
        .withMessage("Expiry date must be a valid date"),

    validateRequest

];

module.exports = validateMedicine;