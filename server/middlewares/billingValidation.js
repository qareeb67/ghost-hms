const {
    body
} = require("express-validator");

const validateRequest =
    require("./validateRequest");


// ==================================================
// VALIDATE BILL
// ==================================================

const validateBill = [

    body("patient_id")
        .isInt({ min: 1 })
        .withMessage(
            "Valid patient ID is required"
        ),

    body("amount")
        .isFloat({ min: 0 })
        .withMessage(
            "Valid amount is required"
        ),

    body("service")
        .trim()
        .notEmpty()
        .withMessage(
            "Service is required"
        ),

    validateRequest

];


// ==================================================
// VALIDATE PAYMENT
// ==================================================

const validatePayment = [

    body("payment_method")

        .notEmpty()
        .withMessage(
            "Payment method is required"
        )

        .isIn([

            "Cash",

            "Card",

            "Transfer",

            "Insurance"

        ])

        .withMessage(
            "Invalid payment method"
        ),

    validateRequest

];


module.exports = {

    validateBill,

    validatePayment

};