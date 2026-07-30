const appointmentModel = require("../models/appointmentModel");

// Create Appointment
const createAppointment = async (req, res, next) => {

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

    next(err);

}

};

// Get All Appointments
const getAllAppointments = async (req, res, next) => {

    try {

        const appointments = await appointmentModel.getAllAppointments();

        res.status(200).json(appointments);

    } catch (err) {

    next(err);

}

};

// Get Appointment By ID
const getAppointmentById = async (req, res, next) => {

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

    next(err);

}

};

// Update Appointment
const updateAppointment = async (req, res, next) => {

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

    next(err);

}

};

const deleteAppointment = async (req, res, next) => {
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

    }catch (err) {

    next(err);

}
};

// Complete Appointment
const completeAppointment = async (req, res, next) => {

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

    next(err);

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