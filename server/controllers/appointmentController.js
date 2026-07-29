const appointmentModel = require("../models/appointmentModel");

// Create Appointment
const createAppointment = async (req, res) => {

    try {

        const {
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            status
        } = req.body;

        const appointment = await appointmentModel.createAppointment(
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            status
        );

        res.status(201).json(appointment);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

};

// Get All Appointments
const getAllAppointments = async (req, res) => {

    try {

        const appointments = await appointmentModel.getAllAppointments();

        res.status(200).json(appointments);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

};

// Get Appointment By ID
const getAppointmentById = async (req, res) => {

    try {

        const { id } = req.params;

        const appointment = await appointmentModel.getAppointmentById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        res.status(200).json(appointment);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

};

// Update Appointment
const updateAppointment = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            status
        } = req.body;

        const appointment = await appointmentModel.updateAppointment(
            id,
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            status
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        res.status(200).json(appointment);

    } catch (err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

};

const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;

       const appointment = await appointmentModel.deleteAppointment(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Appointment deleted successfully",
            appointment
        });

    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// Complete Appointment
const completeAppointment = async (req, res) => {

    try {

        const { id } = req.params;

        const appointment = await appointmentModel.completeAppointment(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Appointment completed successfully",
            appointment
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
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    completeAppointment
};