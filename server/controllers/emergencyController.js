const emergencyModel = require("../models/emergencyModel");

// Create Emergency Case
const createEmergencyCase = async (req, res, next) => {

    try {

        const {
            patient_id,
            temporary_name,
            triage_level,
            assigned_doctor,
            status,
            emergency_notes
        } = req.body;

        const emergency = await emergencyModel.createEmergencyCase(
            patient_id,
            temporary_name,
            triage_level,
            assigned_doctor,
            status,
            emergency_notes
        );

        res.status(201).json({
            success: true,
            message: "Emergency case created successfully",
            emergency
        });

    } catch (err) {

        next(err);

    }

};

// Get All Emergency Cases
const getAllEmergencyCases = async (req, res, next) => {

    try {

        const emergencies = await emergencyModel.getAllEmergencyCases();

        res.status(200).json({
            success: true,
            emergencies
        });

    } catch (err) {

        next(err);

    }

};

// Get Emergency Case By ID
const getEmergencyCaseById = async (req, res, next) => {

    try {

        const { id } = req.params;

        const emergency = await emergencyModel.getEmergencyCaseById(id);

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency case not found"
            });
        }

        res.status(200).json({
            success: true,
            emergency
        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    createEmergencyCase,
    getAllEmergencyCases,
    getEmergencyCaseById
};