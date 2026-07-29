const pool = require("../config/db");

// Create Appointment
const createAppointment = async (
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    reason,
    status
) => {

    const result = await pool.query(
        `INSERT INTO appointments
        (
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            status
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason,
            status
        ]
    );

    return result.rows[0];
};

// Get All Appointments
const getAllAppointments = async () => {

    const result = await pool.query(
        `
        SELECT
            a.appointment_id,

            p.first_name || ' ' || p.last_name AS patient_name,

            d.first_name || ' ' || d.last_name AS doctor_name,

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

        ORDER BY a.appointment_date,
                 a.appointment_time
        `
    );

    return result.rows;
};
// Get Appointment By ID
const getAppointmentById = async (appointment_id) => {

    const result = await pool.query(
        `
        SELECT
            a.appointment_id,

            p.first_name || ' ' || p.last_name AS patient_name,

            d.first_name || ' ' || d.last_name AS doctor_name,

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

// Update Appointment
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

const deleteAppointment = async (id) => {

    const result = await pool.query(
        "DELETE FROM appointments WHERE appointment_id = $1 RETURNING *",
        [id]
    );

    return result.rows[0];

};

// Complete Appointment
const completeAppointment = async (appointment_id) => {

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

module.exports = {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    completeAppointment
};
