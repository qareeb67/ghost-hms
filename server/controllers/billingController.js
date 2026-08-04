const billingModel = require("../models/billingModel");

// Create Bill
const createBill = async (req, res, next) => {

    try {

        const {
            patient_id,
            amount,
            service,
            payment_status,
            payment_method
        } = req.body;

        const bill = await billingModel.createBill(
            patient_id,
            amount,
            service,
            payment_status,
            payment_method
        );

        res.status(201).json({
            success: true,
            message: "Bill created successfully",
            bill
        });

    } catch (err) {

        next(err);

    }

};

// Get All Bills
const getAllBills = async (req, res, next) => {

    try {

        const bills = await billingModel.getAllBills();

        res.status(200).json({
            success: true,
            message: "Bills retrieved successfully",
            bills
        });

    } catch (err) {

        next(err);

    }

};

// Get Bill By ID
const getBillById = async (req, res, next) => {

    try {

        const { id } = req.params;

        const bill = await billingModel.getBillById(id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Bill retrieved successfully",
            bill
        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    createBill,
    getAllBills,
    getBillById
};