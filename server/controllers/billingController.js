const billingModel = require("../models/billingModel");


// ==================================================
// HOSPITAL MANAGEMENT SYSTEM — BILLING CONTROLLER
// ==================================================
//
// Billing = money owed.
//
// Payments = money received.
//
// Payment records are handled by paymentController.
// Bill payment status is updated by paymentModel.
//
// ==================================================


// ==================================================
// CREATE BILL
// ==================================================

const createBill = async (req, res, next) => {

    try {

        const {
            patient_id,
            amount,
            service
        } = req.body;


        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


        if (
            !patient_id ||
            amount === undefined ||
            !service
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Patient, amount and service are required."

            });

        }


        const createdBy =
            req.user.userId;


        const bill =
            await billingModel.createBill(

                patient_id,

                amount,

                service.trim(),

                createdBy

            );


        res.status(201).json({

            success: true,

            message:
                "Bill created successfully",

            bill

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// GET ALL BILLS
// ==================================================

const getAllBills = async (req, res, next) => {

    try {

        const bills =
            await billingModel.getAllBills();


        res.status(200).json({

            success: true,

            message:
                "Bills retrieved successfully",

            bills

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// GET BILL BY ID
// ==================================================

const getBillById = async (req, res, next) => {

    try {

        const {
            id
        } = req.params;


        const bill =
            await billingModel.getBillById(id);


        if (!bill) {

            return res.status(404).json({

                success: false,

                message:
                    "Bill not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Bill retrieved successfully",

            bill

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// UPDATE BILL
// ==================================================

const updateBill = async (req, res, next) => {

    try {

        const {
            id
        } = req.params;


        const {
            patient_id,
            amount,
            service
        } = req.body;


        const existingBill =
            await billingModel.getBillById(id);


        if (!existingBill) {

            return res.status(404).json({

                success: false,

                message:
                    "Bill not found"

            });

        }


        // ==========================================
        // PROTECT BILLS WITH PAYMENTS
        // ==========================================

        if (
            Number(existingBill.total_paid || 0) > 0
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "A bill with recorded payments cannot be modified."

            });

        }


        const bill =
            await billingModel.updateBill(

                id,

                patient_id,

                amount,

                service.trim()

            );


        res.status(200).json({

            success: true,

            message:
                "Bill updated successfully",

            bill

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// DELETE BILL
// ==================================================

const deleteBill = async (req, res, next) => {

    try {

        const {
            id
        } = req.params;


        const existingBill =
            await billingModel.getBillById(id);


        if (!existingBill) {

            return res.status(404).json({

                success: false,

                message:
                    "Bill not found"

            });

        }


        // ==========================================
        // PROTECT BILLS WITH PAYMENTS
        // ==========================================

        if (
            Number(existingBill.total_paid || 0) > 0
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "A bill with recorded payments cannot be deleted."

            });

        }


        const bill =
            await billingModel.deleteBill(id);


        res.status(200).json({

            success: true,

            message:
                "Bill deleted successfully",

            bill

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// GET BILLING SUMMARY
// ==================================================

const getBillingSummary = async (req, res, next) => {

    try {

        const summary =
            await billingModel.getBillingSummary();


        res.status(200).json({

            success: true,

            message:
                "Billing summary retrieved successfully",

            summary

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    createBill,

    getAllBills,

    getBillById,

    updateBill,

    deleteBill,

    getBillingSummary

};