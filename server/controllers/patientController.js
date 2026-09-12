
const patientModel = require("../models/patientModel");


// =====================================================
// CREATE PATIENT
// =====================================================

const createPatient = async (req, res, next) => {

    try {

        const {
            first_name,
            last_name,
            gender,
            email,
            phone,
            address,
            date_of_birth,
            blood_group,
            genotype,
            marital_status,
            occupation,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            allergies,
            medical_history,
            nationality,
            state_of_origin,
            lga,
            patient_status
        } = req.body;

        const patient = await patientModel.createPatient(
            first_name,
            last_name,
            gender,
            email,
            phone,
            address,
            date_of_birth,
            blood_group,
            genotype,
            marital_status,
            occupation,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            allergies,
            medical_history,
            nationality,
            state_of_origin,
            lga,
            patient_status
        );


        res.status(201).json({
            success: true,
            message: "Patient registered successfully",
            patient
        });

    } catch (err) {

        next(err);

    }

};


// =====================================================
// GET ALL PATIENTS
// =====================================================

const getAllPatients = async (req, res, next) => {

    try {

        const patients = await patientModel.getAllPatients();


        res.status(200).json({
            success: true,
            message: "Patients retrieved successfully",
            count: patients.length,
            patients
        });

    } catch (err) {

        next(err);

    }

};


// =====================================================
// GET PATIENT BY ID
// =====================================================

const getPatientById = async (req, res, next) => {

    try {

        const patient = await patientModel.getPatientById(
            req.params.id
        );


        if (!patient) {

            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });

        }


        res.status(200).json({
            success: true,
            message: "Patient retrieved successfully",
            patient
        });

    } catch (err) {

        next(err);

    }

};


// =====================================================
// GET PATIENT BY PATIENT NUMBER
// =====================================================

const getPatientByNumber = async (req, res, next) => {

    try {

        const { patient_number } = req.params;


        const patient =
            await patientModel.getPatientByNumber(
                patient_number
            );


        if (!patient) {

            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });

        }


        res.status(200).json({
            success: true,
            message: "Patient retrieved successfully",
            patient
        });

    } catch (err) {

        next(err);

    }

};


// =====================================================
// UPDATE PATIENT
// =====================================================

const updatePatient = async (req, res, next) => {

    try {

        const { id } = req.params;


        const {
            first_name,
            last_name,
            gender,
            email,
            phone,
            address,
            date_of_birth,
            blood_group,
            genotype,
            marital_status,
            occupation,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            allergies,
            medical_history,
            nationality,
            state_of_origin,
            lga,
            patient_status
        } = req.body;


        const patient =
            await patientModel.updatePatient(
                id,
                first_name,
                last_name,
                gender,
                email,
                phone,
                address,
                date_of_birth,
                blood_group,
                genotype,
                marital_status,
                occupation,
                emergency_contact_name,
                emergency_contact_phone,
                emergency_contact_relationship,
                allergies,
                medical_history,
                nationality,
                state_of_origin,
                lga,
                patient_status
            );


        if (!patient) {

            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });

        }


        res.status(200).json({
            success: true,
            message: "Patient updated successfully",
            patient
        });

    } catch (err) {

        next(err);

    }

};


// =====================================================
// UPDATE PATIENT STATUS
// =====================================================

const updatePatientStatus = async (req, res, next) => {

    try {

        const { id } = req.params;
        const { patient_status } = req.body;


        const patient =
            await patientModel.updatePatientStatus(
                id,
                patient_status
            );


        if (!patient) {

            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });

        }


        res.status(200).json({
            success: true,
            message: "Patient status updated successfully",
            patient
        });

    } catch (err) {

        next(err);

    }

};


// =====================================================
// DELETE PATIENT
// =====================================================

const deletePatient = async (req, res, next) => {

    try {

        const { id } = req.params;


        const patient =
            await patientModel.deletePatient(id);


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

        next(err);

    }

};


// =====================================================
// SEARCH PATIENTS
// =====================================================

const searchPatients = async (req, res, next) => {

    try {

        const { q } = req.query;


        if (!q || !q.trim()) {

            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });

        }


        const patients =
            await patientModel.searchPatients(q.trim());


        res.status(200).json({
            success: true,
            message: "Patients retrieved successfully",
            count: patients.length,
            patients
        });

    } catch (err) {

        next(err);

    }

};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    createPatient,
    getAllPatients,
    getPatientById,
    getPatientByNumber,
    updatePatient,
    updatePatientStatus,
    deletePatient,
    searchPatients
};

