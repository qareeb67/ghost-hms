const medicineModel = require("../models/medicineModel");

// Create Medicine
const createMedicine = async (req, res, next) => {

    try {

        const {
            medicine_name,
            category,
            quantity,
            unit_price,
            expiry_date,
            manufacturer
        } = req.body;

        const medicine = await medicineModel.createMedicine(
            medicine_name,
            category,
            quantity,
            unit_price,
            expiry_date,
            manufacturer
        );

        res.status(201).json({
            success: true,
            message: "Medicine added successfully",
            medicine
        });

    } catch (err) {

        next(err);

    }

};

// Get All Medicines
const getAllMedicines = async (req, res, next) => {

    try {

        const medicines = await medicineModel.getAllMedicines();

        res.status(200).json({
            success: true,
            medicines
        });

    } catch (err) {

        next(err);

    }

};

// Get Medicine By ID
const getMedicineById = async (req, res, next) => {

    try {

        const { id } = req.params;

        const medicine = await medicineModel.getMedicineById(id);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }

        res.status(200).json({
            success: true,
            medicine
        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    createMedicine,
    getAllMedicines,
    getMedicineById
};