const appointmentModel =
    require("../models/appointmentModel");

const notificationModel =
    require("../models/notificationModel");

const pool =
    require("../config/db");


// ==================================================
// CREATE APPOINTMENT
// ==================================================

const createAppointment = async (
    req,
    res,
    next
) => {

    try {

        const {

            patient_id,

            doctor_id,

            appointment_date,

            appointment_time,

            reason,

            status

        } = req.body;


        // ==========================================
        // CREATE APPOINTMENT
        // ==========================================

        const appointment =
            await appointmentModel.createAppointment(

                patient_id,

                doctor_id,

                appointment_date,

                appointment_time,

                reason,

                status

            );


        // ==========================================
        // NOTIFICATION MESSAGE
        // ==========================================

        const notificationTitle =
            "New Appointment Created";


        const notificationMessage =
            `Appointment created for ${appointment.patient_name} ` +
            `with ${appointment.doctor_name} ` +
            `on ${appointment.appointment_date} ` +
            `at ${appointment.appointment_time}.`;


        // ==========================================
        // COLLECT NOTIFICATION RECIPIENTS
        // ==========================================

        const recipientIds =
            new Set();


        // ==========================================
        // 1. CURRENT USER
        // ==========================================

        const currentUserId =
            Number(req.user.userId);


        if (currentUserId) {

            recipientIds.add(
                currentUserId
            );

        }


        // ==========================================
        // 2. FIND ASSIGNED DOCTOR USER
        // ==========================================
        //
        // We connect the doctor record to the
        // doctor login account using email.
        //
        // Example:
        //
        // doctors.email
        //       ↓
        // users.email
        //
        // ==========================================

        if (appointment.doctor_email) {

            const doctorUser =
                await pool.query(
                    `
                    SELECT user_id

                    FROM users

                    WHERE
                        LOWER(email) =
                        LOWER($1)

                        AND role = 'doctor'

                    LIMIT 1
                    `,
                    [
                        appointment.doctor_email
                    ]
                );


            if (
                doctorUser.rows.length > 0
            ) {

                recipientIds.add(
                    Number(
                        doctorUser.rows[0].user_id
                    )
                );

            }

        }


        // ==========================================
        // 3. FIND ALL ADMIN USERS
        // ==========================================

        const admins =
            await pool.query(
                `
                SELECT user_id

                FROM users

                WHERE role = 'admin'
                `
            );


        for (
            const admin of admins.rows
        ) {

            recipientIds.add(
                Number(admin.user_id)
            );

        }


        // ==========================================
        // 4. CREATE NOTIFICATIONS
        // ==========================================

        for (
            const recipientId
            of recipientIds
        ) {

            await notificationModel
                .createNotification(

                    recipientId,

                    "appointment",

                    notificationTitle,

                    notificationMessage

                );

        }


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(201).json({

            success: true,

            message:
                "Appointment created successfully",

            appointment

        });


    } catch (err) {

        next(err);

    }

};


// ==================================================
// GET ALL APPOINTMENTS
// ==================================================

const getAllAppointments = async (
    req,
    res,
    next
) => {

    try {

        const appointments =
            await appointmentModel
                .getAllAppointments();


        res.status(200).json({

            success: true,

            message:
                "Appointments retrieved successfully",

            appointments

        });


    } catch (err) {

        next(err);

    }

};


// ==================================================
// GET APPOINTMENT BY ID
// ==================================================

const getAppointmentById = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;


        const appointment =
            await appointmentModel
                .getAppointmentById(id);


        if (!appointment) {

            return res.status(404).json({

                success: false,

                message:
                    "Appointment not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Appointment retrieved successfully",

            appointment

        });


    } catch (err) {

        next(err);

    }

};


// ==================================================
// UPDATE APPOINTMENT
// ==================================================

const updateAppointment = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;


        const {

            patient_id,

            doctor_id,

            appointment_date,

            appointment_time,

            reason,

            status

        } = req.body;


        const appointment =
            await appointmentModel
                .updateAppointment(

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

                message:
                    "Appointment not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Appointment updated successfully",

            appointment

        });


    } catch (err) {

        next(err);

    }

};


// ==================================================
// DELETE APPOINTMENT
// ==================================================

const deleteAppointment = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;


        const appointment =
            await appointmentModel
                .deleteAppointment(id);


        if (!appointment) {

            return res.status(404).json({

                success: false,

                message:
                    "Appointment not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Appointment deleted successfully",

            appointment

        });


    } catch (err) {

        next(err);

    }

};


// ==================================================
// COMPLETE APPOINTMENT
// ==================================================

const completeAppointment = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;


        const appointment =
            await appointmentModel
                .completeAppointment(id);


        if (!appointment) {

            return res.status(404).json({

                success: false,

                message:
                    "Appointment not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Appointment completed successfully",

            appointment

        });


    } catch (err) {

        next(err);

    }

};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    createAppointment,

    getAllAppointments,

    getAppointmentById,

    updateAppointment,

    deleteAppointment,

    completeAppointment

};