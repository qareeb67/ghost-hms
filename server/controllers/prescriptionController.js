const prescriptionModel = require("../models/prescriptionModel");

/**
 * Create a new prescription
 */
const createPrescription = async (req, res) => {
    try {
        const {
            record_id,
            patient_id,
            doctor_id,
            prescription_date,
            notes,
            status,
            items,
        } = req.body;

        // ---------------------------------------------------------
        // Basic validation
        // ---------------------------------------------------------
        if (!record_id) {
            return res.status(400).json({
                success: false,
                message: "record_id is required.",
            });
        }

        if (!patient_id) {
            return res.status(400).json({
                success: false,
                message: "patient_id is required.",
            });
        }

        if (!doctor_id) {
            return res.status(400).json({
                success: false,
                message: "doctor_id is required.",
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one medication item is required.",
            });
        }

        // ---------------------------------------------------------
        // Validate medication items
        // ---------------------------------------------------------
        for (const item of items) {
            if (!item.medicine_id) {
                return res.status(400).json({
                    success: false,
                    message: "Every medication item must have a medicine_id.",
                });
            }
        }

        // ---------------------------------------------------------
        // Create prescription
        // ---------------------------------------------------------
        const prescription =
            await prescriptionModel.createPrescription({
                record_id,
                patient_id,
                doctor_id,
                prescription_date,
                notes,
                status,
                items,
            });

        return res.status(201).json({
            success: true,
            message: "Prescription created successfully.",
            prescription,
        });
    } catch (error) {
        console.error(
            "Create prescription error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create prescription.",
            error: error.message,
        });
    }
};


/**
 * Get all prescriptions
 */
const getAllPrescriptions = async (req, res) => {
    try {
        const prescriptions =
            await prescriptionModel.getAllPrescriptions();

        return res.status(200).json({
            success: true,
            count: prescriptions.length,
            prescriptions,
        });
    } catch (error) {
        console.error(
            "Get prescriptions error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve prescriptions.",
            error: error.message,
        });
    }
};


/**
 * Get prescription by ID
 */
const getPrescriptionById = async (req, res) => {
    try {
        const { id } = req.params;

        const prescription =
            await prescriptionModel.getPrescriptionById(id);

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found.",
            });
        }

        return res.status(200).json({
            success: true,
            prescription,
        });
    } catch (error) {
        console.error(
            "Get prescription by ID error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve prescription.",
            error: error.message,
        });
    }
};


/**
 * Get prescriptions by medical record
 */
const getPrescriptionsByRecordId = async (req, res) => {
    try {
        const { recordId } = req.params;

        const prescriptions =
            await prescriptionModel.getPrescriptionsByRecordId(
                recordId
            );

        return res.status(200).json({
            success: true,
            record_id: Number(recordId),
            count: prescriptions.length,
            prescriptions,
        });
    } catch (error) {
        console.error(
            "Get prescriptions by record error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve prescriptions for this medical record.",
            error: error.message,
        });
    }
};


/**
 * Update prescription
 */
const updatePrescription = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            prescription_date,
            notes,
            status,
        } = req.body;

        // ---------------------------------------------------------
        // Validate status if supplied
        // ---------------------------------------------------------
        if (
            status &&
            !["active", "dispensed", "cancelled"].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid prescription status. Use active, dispensed, or cancelled.",
            });
        }

        const prescription =
            await prescriptionModel.updatePrescription(
                id,
                {
                    prescription_date,
                    notes,
                    status,
                }
            );

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Prescription updated successfully.",
            prescription,
        });
    } catch (error) {
        console.error(
            "Update prescription error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update prescription.",
            error: error.message,
        });
    }
};


/**
 * Replace prescription medication items
 */
const replacePrescriptionItems = async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "At least one medication item is required.",
            });
        }

        // ---------------------------------------------------------
        // Validate medication items
        // ---------------------------------------------------------
        for (const item of items) {
            if (!item.medicine_id) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Every medication item must have a medicine_id.",
                });
            }
        }

        const updatedItems =
            await prescriptionModel.replacePrescriptionItems(
                id,
                items
            );

        return res.status(200).json({
            success: true,
            message:
                "Prescription medication items updated successfully.",
            items: updatedItems,
        });
    } catch (error) {
        console.error(
            "Replace prescription items error:",
            error
        );

        if (error.message === "Prescription not found.") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to update prescription medication items.",
            error: error.message,
        });
    }
};


/**
 * Delete prescription
 */
const deletePrescription = async (req, res) => {
    try {
        const { id } = req.params;

        const prescription =
            await prescriptionModel.deletePrescription(id);

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Prescription deleted successfully.",
            prescription,
        });
    } catch (error) {
        console.error(
            "Delete prescription error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete prescription.",
            error: error.message,
        });
    }
};


module.exports = {
    createPrescription,
    getAllPrescriptions,
    getPrescriptionById,
    getPrescriptionsByRecordId,
    updatePrescription,
    replacePrescriptionItems,
    deletePrescription,
};