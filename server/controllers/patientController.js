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

// Get All Patients
const getAllPatients = async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT * FROM patients ORDER BY patient_id ASC"
        );

        res.status(200).json(result.rows);

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

module.exports = {
    createPatient,
    getAllPatients,
    getPatientById
};
