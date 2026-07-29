const pool = require("../config/db");

// Create Doctor
const createDoctor = async (
    first_name,
    last_name,
    specialization,
    phone,
    email,
    years_of_experience
) => {

    const result = await pool.query(
        `INSERT INTO doctors
        (
            first_name,
            last_name,
            specialization,
            phone,
            email,
            years_of_experience
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [
            first_name,
            last_name,
            specialization,
            phone,
            email,
            years_of_experience
        ]
    );

    return result.rows[0];
};

// Get All Doctors
const getAllDoctors = async () => {

    const result = await pool.query(
        "SELECT * FROM doctors ORDER BY doctor_id ASC"
    );

    return result.rows;
};

// Get Doctor by ID
const getDoctorById = async (id) => {

    const result = await pool.query(
        "SELECT * FROM doctors WHERE doctor_id = $1",
        [id]
    );

    return result.rows[0];
};

// Update Doctor
const updateDoctor = async (
    id,
    first_name,
    last_name,
    specialization,
    phone,
    email,
    years_of_experience
) => {

    const result = await pool.query(
        `UPDATE doctors
        SET
            first_name = $1,
            last_name = $2,
            specialization = $3,
            phone = $4,
            email = $5,
            years_of_experience = $6
        WHERE doctor_id = $7
        RETURNING *`,
        [
            first_name,
            last_name,
            specialization,
            phone,
            email,
            years_of_experience,
            id
        ]
    );

    return result.rows[0];
};

// Delete Doctor
const deleteDoctor = async (id) => {

    const result = await pool.query(
        "DELETE FROM doctors WHERE doctor_id = $1 RETURNING *",
        [id]
    );

    return result.rows[0];
};

// Search Doctors
const searchDoctors = async (searchTerm) => {

    const result = await pool.query(
        `SELECT *
         FROM doctors
         WHERE
            LOWER(first_name) LIKE LOWER($1)
            OR LOWER(last_name) LIKE LOWER($1)
            OR LOWER(specialization) LIKE LOWER($1)
            OR phone LIKE $1
         ORDER BY doctor_id ASC`,
        [`%${searchTerm}%`]
    );

    return result.rows;
};

module.exports = {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
    searchDoctors
};