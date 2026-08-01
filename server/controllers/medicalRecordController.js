
const recordModel = require("../models/recordModel");

console.log(recordModel);
// Create Medical Record
const createMedicalRecord = async (req, res, next) => {

    try {

        const {
            patient_id,
            doctor_id,
            diagnosis,
            prescription,
            allergies,
            notes
        } = req.body;

        const record = await recordModel.createMedicalRecord(
            patient_id,
            doctor_id,
            diagnosis,
            prescription,
            allergies,
            notes
        );

        res.status(201).json({
            success: true,
            message: "Medical record created successfully",
            record
        });

    } catch (err) {

        next(err);

    }

};

// Get All Medical Records
const getAllMedicalRecords = async (req, res, next) => {

    try {

        const records = await recordModel.getAllMedicalRecords();

        res.status(200).json({
            success: true,
            records
        });

    } catch (err) {

        next(err);

    }

};

// Get Medical Record By ID
const getMedicalRecordById = async (req, res, next) => {

    try {

        const { id } = req.params;

        const record = await recordModel.getMedicalRecordById(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Medical record not found"
            });
        }

        res.status(200).json({
            success: true,
            record
        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    createMedicalRecord,
    getAllMedicalRecords,
    getMedicalRecordById
};