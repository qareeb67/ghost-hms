const doctorModel = require("../models/doctorModel");

// Create Doctor
const createDoctor = async (req, res) => {
    try {

        const {
            first_name,
            last_name,
            specialization,
            phone,
            email,
            years_of_experience
        } = req.body;

        const doctor = await doctorModel.createDoctor(
            first_name,
            last_name,
            specialization,
            phone,
            email,
            years_of_experience
        );

        res.status(201).json(doctor);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
};

// Get All Doctors
const getAllDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.getAllDoctors();

        res.status(200).json(doctors);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
};

// Get Doctor By ID
const getDoctorById = async (req, res) => {
    try {

        const doctor = await doctorModel.getDoctorById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.status(200).json(doctor);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
};

// Update Doctor
const updateDoctor = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            first_name,
            last_name,
            specialization,
            phone,
            email,
            years_of_experience
        } = req.body;

        const doctor = await doctorModel.updateDoctor(
            id,
            first_name,
            last_name,
            specialization,
            phone,
            email,
            years_of_experience
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.status(200).json(doctor);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
};

// Delete Doctor
const deleteDoctor = async (req, res) => {
    try {

        const doctor = await doctorModel.deleteDoctor(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Doctor deleted successfully",
            doctor
        });

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
};

module.exports = {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
};