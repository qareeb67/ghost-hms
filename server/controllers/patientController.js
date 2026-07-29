const patientModel = require("../models/patientModel");

// Create Patient
const createPatient = async (req, res) => {
    try {

        const {
            first_name,
            last_name,
            gender,
            phone,
            address,
            date_of_birth
        } = req.body;

   const patient = await patientModel.createPatient(
    first_name,
    last_name,
    gender,
    phone,
    address,
    date_of_birth
);

res.status(201).json(patient);

    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Get All Patients
const getAllPatients = async (req, res) => {
    try {

       const patients = await patientModel.getAllPatients();

res.status(200).json(patients);

    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
const getPatientById = async (req, res) => {

    try {

        const patient = await patientModel.getPatientById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        res.status(200).json(patient);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

};

const updatePatient = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            first_name,
            last_name,
            gender,
            phone,
            address,
            date_of_birth
        } = req.body;

        const patient = await patientModel.updatePatient(
            id,
            first_name,
            last_name,
            gender,
            phone,
            address,
            date_of_birth
        );

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        res.status(200).json(patient);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

};
// Delete Patient
const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;

       const patient = await patientModel.deletePatient(id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Patient deleted successfully",
            patient
        });

    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
// Search Patients
const searchPatients = async (req, res) => {

    try {

        const { q } = req.query;

        const patients = await patientModel.searchPatients(q);

        res.status(200).json(patients);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

};

module.exports = {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    searchPatients
};
