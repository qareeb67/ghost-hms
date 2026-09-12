
const express = require("express");

const router = express.Router();


// ==================================================
// HOSPITAL MANAGEMENT SYSTEM — PAYMENT ROUTES
// ==================================================
//
// Payments are actual financial transactions.
//
// Billing = money owed.
// Payments = money received.
//
// Every route requires authentication.
//
// Permission checks ensure that hospital staff
// can only perform the financial operation allowed
// for their role.
//
// ==================================================


const authenticateToken =
    require("../middlewares/authMiddleware");


const {
    requirePermission
} = require("../middlewares/permissionMiddleware");


const {

    recordPayment,

    getPaymentById,

    getPaymentsByBill,

    getAllPayments,

    getPaymentSummary,

    getPaymentsByDate

} = require("../controllers/paymentController");


// ==================================================
// RECORD PAYMENT
// ==================================================
//
// POST /payments/bills/:billId
//
// Example:
//
// POST /payments/bills/25
//
// Body:
//
// {
//     "amount": 50000,
//     "payment_method": "Transfer",
//     "transaction_reference": "GTB-ABC123"
// }
//
// Only users with payments.record can record
// money received by the hospital.
//
// ==================================================

router.post(

    "/bills/:billId",

    authenticateToken,

    requirePermission(
        "payments.record"
    ),

    recordPayment

);


// ==================================================
// GET PAYMENTS FOR A BILL
// ==================================================
//
// IMPORTANT:
// This route is declared before /:id.
//
// ==================================================

router.get(

    "/bills/:billId",

    authenticateToken,

    requirePermission(
        "payments.view"
    ),

    getPaymentsByBill

);


// ==================================================
// PAYMENT SUMMARY
// ==================================================
//
// GET /payments/summary
//
// IMPORTANT:
// This route MUST come before /:id.
//
// ==================================================

router.get(

    "/summary",

    authenticateToken,

    requirePermission(
        "payments.view"
    ),

    getPaymentSummary

);


// ==================================================
// PAYMENTS BY DATE
// ==================================================
//
// GET /payments/by-date
//
// Example:
//
// /payments/by-date?start_date=2026-08-01&end_date=2026-08-24
//
// ==================================================

router.get(

    "/by-date",

    authenticateToken,

    requirePermission(
        "payments.view"
    ),

    getPaymentsByDate

);


// ==================================================
// GET ALL PAYMENTS
// ==================================================
//
// GET /payments
//
// Used by authorized financial/cashier users
// to view payment history.
//
// ==================================================

router.get(

    "/",

    authenticateToken,

    requirePermission(
        "payments.view"
    ),

    getAllPayments

);


// ==================================================
// GET PAYMENT BY ID
// ==================================================
//
// IMPORTANT:
//
// This dynamic route MUST come AFTER all routes
// containing fixed path names such as:
//
// /summary
// /by-date
// /bills/:billId
//
// ==================================================

router.get(

    "/:id",

    authenticateToken,

    requirePermission(
        "payments.view"
    ),

    getPaymentById

);


// ==================================================
// EXPORT ROUTER
// ==================================================

module.exports = router;

