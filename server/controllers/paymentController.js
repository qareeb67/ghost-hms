
const paymentModel = require("../models/paymentModel");


// ==================================================
// HOSPITAL MANAGEMENT SYSTEM — PAYMENT CONTROLLER
// ==================================================
//
// Payments represent actual money received.
//
// Billing = what the patient owes.
// Payments = what the hospital actually received.
//
// Security:
//
// - Payment permissions are enforced at route level.
// - received_by comes from the authenticated user.
// - The frontend never controls who received money.
//
// ==================================================


// ==================================================
// VALID PAYMENT METHODS
// ==================================================

const VALID_PAYMENT_METHODS = [

    "Cash",

    "Card",

    "Transfer",

    "Insurance"

];


// ==================================================
// RECORD PAYMENT
// ==================================================

const recordPayment = async (
    req,
    res,
    next
) => {

    try {

        const {
            billId: billIdParam
        } = req.params;


        const {
            amount,
            payment_method,
            transaction_reference
        } = req.body;


        // ==========================================
        // VALIDATE BILL ID
        // ==========================================

        const billId =
            Number(billIdParam);


        if (
            !Number.isInteger(billId) ||
            billId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid bill ID."

            });

        }


        // ==========================================
        // VALIDATE AMOUNT
        // ==========================================

        const paymentAmount =
            Number(amount);


        if (
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment amount must be greater than zero."

            });

        }


        // ==========================================
        // VALIDATE PAYMENT METHOD
        // ==========================================

        if (
            !VALID_PAYMENT_METHODS.includes(
                payment_method
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment method."

            });

        }


        // ==========================================
        // VALIDATE TRANSACTION REFERENCE
        // ==========================================

        let transactionReference =
            transaction_reference || null;


        if (
            transactionReference !== null
        ) {

            transactionReference =
                String(
                    transactionReference
                ).trim();


            if (
                transactionReference.length === 0
            ) {

                transactionReference = null;

            }


            if (
                transactionReference &&
                transactionReference.length > 100
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Transaction reference cannot exceed 100 characters."

                });

            }

        }


        // ==========================================
        // AUTHENTICATED USER
        // ==========================================

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


        const receivedBy =
            req.user.userId;


        // ==========================================
        // RECORD PAYMENT
        // ==========================================

        const result =
            await paymentModel.createPayment(

                billId,

                paymentAmount,

                payment_method,

                transactionReference,

                receivedBy

            );


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                "Payment recorded successfully.",

            payment:
                result.payment,

            billing: {

                bill_amount:
                    result.bill_amount,

                total_paid:
                    result.total_paid,

                amount_due:
                    result.amount_due,

                payment_status:
                    result.payment_status

            }

        });

    } catch (err) {

        next(err);

    }

};

// ==================================================
// GET PAYMENT BY ID
// ==================================================

const getPaymentById = async (
    req,
    res,
    next
) => {

    try {

        const paymentId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(paymentId) ||
            paymentId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment ID."

            });

        }


        const payment =
            await paymentModel.getPaymentById(
                paymentId
            );


        if (!payment) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment not found."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Payment retrieved successfully.",

            payment

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// GET PAYMENTS FOR BILL
// ==================================================

const getPaymentsByBill = async (
    req,
    res,
    next
) => {

    try {

        const billId =
            Number(
                req.params.billId
            );


        if (
            !Number.isInteger(billId) ||
            billId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid bill ID."

            });

        }


        const payments =
            await paymentModel.getPaymentsByBill(
                billId
            );


        return res.status(200).json({

            success: true,

            message:
                "Payment history retrieved successfully.",

            payments

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// GET ALL PAYMENTS
// ==================================================

const getAllPayments = async (
    req,
    res,
    next
) => {

    try {

        const payments =
            await paymentModel.getAllPayments();


        return res.status(200).json({

            success: true,

            message:
                "Payments retrieved successfully.",

            payments

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// PAYMENT SUMMARY
// ==================================================

const getPaymentSummary = async (
    req,
    res,
    next
) => {

    try {

        const summary =
            await paymentModel.getPaymentSummary();


        return res.status(200).json({

            success: true,

            message:
                "Payment summary retrieved successfully.",

            summary

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// GET PAYMENTS BY DATE
// ==================================================

const getPaymentsByDate = async (
    req,
    res,
    next
) => {

    try {

        const {

            start_date,

            end_date

        } = req.query;


        // ==========================================
        // VALIDATE REQUIRED DATES
        // ==========================================

        if (
            !start_date ||
            !end_date
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "start_date and end_date are required."

            });

        }


        const startDate =
            new Date(start_date);


        const endDate =
            new Date(end_date);


        // ==========================================
        // VALIDATE DATES
        // ==========================================

        if (
            Number.isNaN(
                startDate.getTime()
            ) ||
            Number.isNaN(
                endDate.getTime()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid date range."

            });

        }


        if (
            startDate > endDate
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "start_date cannot be later than end_date."

            });

        }


        // ==========================================
        // MAKE END DATE INCLUSIVE
        // ==========================================
        //
        // Example:
        //
        // 2026-08-01 → 2026-08-01
        //
        // becomes:
        //
        // 2026-08-01 00:00:00
        // ≤ payment_date <
        // 2026-08-02 00:00:00
        //
        // ==========================================

        endDate.setDate(
            endDate.getDate() + 1
        );


        // ==========================================
        // GET PAYMENTS
        // ==========================================

        const payments =
            await paymentModel.getPaymentsByDate(

                startDate,

                endDate

            );


        return res.status(200).json({

            success: true,

            message:
                "Payments retrieved successfully.",

            payments

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    recordPayment,

    getPaymentById,

    getPaymentsByBill,

    getAllPayments,

    getPaymentSummary,

    getPaymentsByDate

};

