const medicineModel = require("../models/medicineModel");


/*
==================================================
HOSPITAL MANAGEMENT SYSTEM - MEDICINE CONTROLLER
==================================================

Responsibilities:
- Validate request-level input
- Call medicine model
- Return consistent API responses
- Handle missing resources
- Pass unexpected errors to error middleware

==================================================
*/


// ==================================================
// CREATE MEDICINE
// ==================================================

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


        // ------------------------------------------
        // BASIC VALIDATION
        // ------------------------------------------

        if (
            !medicine_name ||
            !String(medicine_name).trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Medicine name is required"
            });

        }


        if (
            quantity === undefined ||
            quantity === null ||
            quantity === ""
        ) {

            return res.status(400).json({
                success: false,
                message: "Medicine quantity is required"
            });

        }


        if (
            unit_price === undefined ||
            unit_price === null ||
            unit_price === ""
        ) {

            return res.status(400).json({
                success: false,
                message: "Medicine unit price is required"
            });

        }


        // ------------------------------------------
        // NORMALIZE VALUES
        // ------------------------------------------

        const normalizedMedicineName =
            String(medicine_name).trim();

        const normalizedCategory =
            category
                ? String(category).trim()
                : null;

        const normalizedManufacturer =
            manufacturer
                ? String(manufacturer).trim()
                : null;

        const normalizedQuantity =
            Number(quantity);

        const normalizedUnitPrice =
            Number(unit_price);


        // ------------------------------------------
        // NUMERIC VALIDATION
        // ------------------------------------------

        if (
            !Number.isFinite(normalizedQuantity) ||
            normalizedQuantity < 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Quantity must be a valid non-negative number"
            });

        }


        if (
            !Number.isFinite(normalizedUnitPrice) ||
            normalizedUnitPrice < 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Unit price must be a valid non-negative number"
            });

        }


        // ------------------------------------------
        // CREATE
        // ------------------------------------------

        const medicine =
            await medicineModel.createMedicine(
                normalizedMedicineName,
                normalizedCategory,
                normalizedQuantity,
                normalizedUnitPrice,
                expiry_date || null,
                normalizedManufacturer
            );


        return res.status(201).json({

            success: true,

            message:
                "Medicine added successfully",

            medicine

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// GET ALL MEDICINES
// ==================================================

const getAllMedicines = async (req, res, next) => {

    try {

        const medicines =
            await medicineModel.getAllMedicines();


        return res.status(200).json({

            success: true,

            message:
                "Medicines retrieved successfully",

            count:
                medicines.length,

            medicines

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// GET MEDICINE BY ID
// ==================================================

const getMedicineById = async (req, res, next) => {

    try {

        const {
            id
        } = req.params;


        const medicine =
            await medicineModel.getMedicineById(id);


        if (!medicine) {

            return res.status(404).json({

                success: false,

                message:
                    "Medicine not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Medicine retrieved successfully",

            medicine

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// UPDATE MEDICINE
// ==================================================

const updateMedicine = async (req, res, next) => {

    try {

        const {
            id
        } = req.params;


        const {
            medicine_name,
            category,
            quantity,
            unit_price,
            expiry_date,
            manufacturer
        } = req.body;


        // ------------------------------------------
        // REQUIRED FIELDS
        // ------------------------------------------

        if (
            !medicine_name ||
            !String(medicine_name).trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Medicine name is required"

            });

        }


        if (
            quantity === undefined ||
            quantity === null ||
            quantity === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Medicine quantity is required"

            });

        }


        if (
            unit_price === undefined ||
            unit_price === null ||
            unit_price === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Medicine unit price is required"

            });

        }


        // ------------------------------------------
        // NORMALIZE
        // ------------------------------------------

        const normalizedMedicineName =
            String(medicine_name).trim();

        const normalizedCategory =
            category
                ? String(category).trim()
                : null;

        const normalizedManufacturer =
            manufacturer
                ? String(manufacturer).trim()
                : null;

        const normalizedQuantity =
            Number(quantity);

        const normalizedUnitPrice =
            Number(unit_price);


        // ------------------------------------------
        // NUMERIC VALIDATION
        // ------------------------------------------

        if (
            !Number.isFinite(normalizedQuantity) ||
            normalizedQuantity < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Quantity must be a valid non-negative number"

            });

        }


        if (
            !Number.isFinite(normalizedUnitPrice) ||
            normalizedUnitPrice < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Unit price must be a valid non-negative number"

            });

        }


        // ------------------------------------------
        // UPDATE
        // ------------------------------------------

        const medicine =
            await medicineModel.updateMedicine(

                id,

                normalizedMedicineName,

                normalizedCategory,

                normalizedQuantity,

                normalizedUnitPrice,

                expiry_date || null,

                normalizedManufacturer

            );


        if (!medicine) {

            return res.status(404).json({

                success: false,

                message:
                    "Medicine not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Medicine updated successfully",

            medicine

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// DELETE MEDICINE
// ==================================================

const deleteMedicine = async (req, res, next) => {

    try {

        const {
            id
        } = req.params;


        const medicine =
            await medicineModel.deleteMedicine(id);


        if (!medicine) {

            return res.status(404).json({

                success: false,

                message:
                    "Medicine not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Medicine deleted successfully",

            medicine

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// SEARCH MEDICINES
// ==================================================

const searchMedicines = async (req, res, next) => {

    try {

        const keyword =
            String(
                req.query.keyword || ""
            ).trim();


        if (!keyword) {

            return res.status(400).json({

                success: false,

                message:
                    "Search keyword is required"

            });

        }


        const medicines =
            await medicineModel.searchMedicines(
                keyword
            );


        return res.status(200).json({

            success: true,

            message:
                medicines.length
                    ? "Medicines found successfully"
                    : "No medicines found",

            count:
                medicines.length,

            medicines

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    createMedicine,

    getAllMedicines,

    getMedicineById,

    updateMedicine,

    deleteMedicine,

    searchMedicines

};