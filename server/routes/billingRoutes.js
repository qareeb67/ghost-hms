const express = require("express");

const router =
    express.Router();


const authenticateToken =
    require("../middlewares/authMiddleware");


const {
    requirePermission
} = require("../middlewares/permissionMiddleware");


const {
    validateBill
} = require("../middlewares/billingValidation");


const {

    createBill,

    getAllBills,

    getBillById,

    updateBill,

    deleteBill,

    getBillingSummary

} = require("../controllers/billingController");


// ==================================================
// HOSPITAL MANAGEMENT SYSTEM — BILLING ROUTES
// ==================================================
//
// Billing handles:
// - money owed
// - bills
// - bill status
// - billing summaries
//
// Payments are handled separately by:
// /payments/bills/:billId
//
// ==================================================


// ==================================================
// GET BILLING SUMMARY
// ==================================================

router.get(

    "/summary",

    authenticateToken,

    requirePermission(
        "billing.view"
    ),

    getBillingSummary

);


// ==================================================
// GET ALL BILLS
// ==================================================

router.get(

    "/",

    authenticateToken,

    requirePermission(
        "billing.view"
    ),

    getAllBills

);


// ==================================================
// GET BILL BY ID
// ==================================================

router.get(

    "/:id",

    authenticateToken,

    requirePermission(
        "billing.view"
    ),

    getBillById

);


// ==================================================
// CREATE BILL
// ==================================================

router.post(

    "/",

    authenticateToken,

    requirePermission(
        "billing.create"
    ),

    validateBill,

    createBill

);


// ==================================================
// UPDATE BILL
// ==================================================

router.patch(

    "/:id",

    authenticateToken,

    requirePermission(
        "billing.update"
    ),

    validateBill,

    updateBill

);


// ==================================================
// DELETE BILL
// ==================================================

router.delete(

    "/:id",

    authenticateToken,

    requirePermission(
        "billing.delete"
    ),

    deleteBill

);


// ==================================================
// EXPORT
// ==================================================

module.exports = router;