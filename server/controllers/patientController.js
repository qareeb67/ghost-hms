const patientModel = require("../models/patientModel");

// Create Patient
const createPatient = async (req, res, next) => {
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

res.status(201).json({
    success: true,
    message: "Patient created successfully",
    patient
});

    }catch (err) {

    next(err);

}
};

// Get All Patients
const getAllPatients = async (req, res, next) => {
    try {

       const patients = await patientModel.getAllPatients();

res.status(200).json({
    success: true,
    message: "Patients retrieved successfully",
    patients
});

    } catch (err) {

    next(err);

}
};
const getPatientById = async (req, res, next) => {

    try {

        const patient = await patientModel.getPatientById(req.params.id);

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

const updatePatient = async (req, res, next) => {

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

        res.status(200).json({
    success: true,
    message: "Patient updated successfully",
    patient
});

    }catch (err) {

    next(err);

}

};
// Delete Patient
const deletePatient = async (req, res, next) => {
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

    next(err);

}
};
// Search Patients
const searchPatients = async (req, res, next) => {

    try {

        const { q } = req.query;

        const patients = await patientModel.searchPatients(q);

        res.status(200).json({
    success: true,
    message: "Patients retrieved successfully",
    patients
});

    } catch (err) {

    next(err);

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
