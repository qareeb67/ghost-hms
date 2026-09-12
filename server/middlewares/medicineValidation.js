const { body } = require("express-validator");
const validateRequest = require("./validateRequest");

const validateMedicine = [

    body("medicine_name")
        .trim()
        .notEmpty()
        .withMessage("Medicine name is required"),

    body("category")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("Category cannot be empty"),

    body("quantity")
        .isInt({ min: 0 })
        .withMessage("Quantity must be 0 or greater"),

    body("unit_price")
        .isFloat({ min: 0 })
        .withMessage("Unit price must be 0 or greater"),

    body("expiry_date")
        .optional()
        .isISO8601()
        .withMessage("Expiry date must be a valid date"),

    body("manufacturer")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("Manufacturer cannot be empty"),

    validateRequest

];

module.exports = validateMedicine;