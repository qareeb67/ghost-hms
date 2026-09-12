const pool = require("../config/db");


// ==================================================
// CREATE APPOINTMENT
// ==================================================

const createAppointment = async (
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    reason,
    status
) => {

    const result = await pool.query(
        `
        INSERT INTO appointments
        (
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            status
        ]
    );


    const appointment = result.rows[0];


    // ==================================================
    // GET PATIENT AND DOCTOR INFORMATION
    // ==================================================

    const details = await pool.query(
        `
        SELECT

            p.first_name || ' ' || p.last_name
                AS patient_name,

            p.first_name AS patient_first_name,

            p.last_name AS patient_last_name,

            d.first_name || ' ' || d.last_name
                AS doctor_name,

            d.first_name AS doctor_first_name,

            d.last_name AS doctor_last_name,

            d.specialization,

            d.email AS doctor_email

        FROM patients p

        JOIN doctors d
            ON d.doctor_id = $2

        WHERE p.patient_id = $1
        `,
        [
            patient_id,
            doctor_id
        ]
    );


    if (details.rows.length > 0) {

        return {

            ...appointment,

            patient_name:
                details.rows[0].patient_name,

            patient_first_name:
                details.rows[0].patient_first_name,

            patient_last_name:
                details.rows[0].patient_last_name,

            doctor_name:
                details.rows[0].doctor_name,

            doctor_first_name:
                details.rows[0].doctor_first_name,

            doctor_last_name:
                details.rows[0].doctor_last_name,

            specialization:
                details.rows[0].specialization,

            doctor_email:
                details.rows[0].doctor_email

        };

    }


    return appointment;

};


// ==================================================
// GET ALL APPOINTMENTS
// ==================================================

const getAllAppointments = async () => {

    const result = await pool.query(
        `
        SELECT
            a.appointment_id,

            a.patient_id,

            a.doctor_id,

            p.first_name || ' ' || p.last_name
                AS patient_name,

            d.first_name || ' ' || d.last_name
                AS doctor_name,

            d.specialization,

            a.appointment_date,

            a.appointment_time,

            a.reason,

            a.status

        FROM appointments a

        JOIN patients p
            ON a.patient_id = p.patient_id

        JOIN doctors d
            ON a.doctor_id = d.doctor_id

        ORDER BY
            a.appointment_date,
            a.appointment_time
        `
    );

    return result.rows;

};


// ==================================================
// GET APPOINTMENT BY ID
// ==================================================

const getAppointmentById = async (
    appointment_id
) => {

    const result = await pool.query(
        `
        SELECT

            a.appointment_id,

            a.patient_id,

            a.doctor_id,

            p.first_name || ' ' || p.last_name
                AS patient_name,

            d.first_name || ' ' || d.last_name
                AS doctor_name,

            d.specialization,

            a.appointment_date,

            a.appointment_time,

            a.reason,

            a.status

        FROM appointments a

        JOIN patients p
            ON a.patient_id = p.patient_id

        JOIN doctors d
            ON a.doctor_id = d.doctor_id

        WHERE a.appointment_id = $1
        `,
        [appointment_id]
    );

    return result.rows[0];

};


// ==================================================
// UPDATE APPOINTMENT
// ==================================================

const updateAppointment = async (
    appointment_id,
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    reason,
    status
) => {

    const result = await pool.query(
        `
        UPDATE appointments

        SET

            patient_id = $1,

            doctor_id = $2,

            appointment_date = $3,

            appointment_time = $4,

            reason = $5,

            status = $6

        WHERE appointment_id = $7

        RETURNING *
        `,
        [
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            status,
            appointment_id
        ]
    );

    return result.rows[0];

};


// ==================================================
// DELETE APPOINTMENT
// ==================================================

const deleteAppointment = async (
    id
) => {

    const result = await pool.query(
        `
        DELETE FROM appointments

        WHERE appointment_id = $1

        RETURNING *
        `,
        [id]
    );

    return result.rows[0];

};


// ==================================================
// COMPLETE APPOINTMENT
// ==================================================

const completeAppointment = async (
    appointment_id
) => {

    const result = await pool.query(
        `
        UPDATE appointments

        SET status = 'Completed'

        WHERE appointment_id = $1

        RETURNING *
        `,
        [appointment_id]
    );

    return result.rows[0];

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