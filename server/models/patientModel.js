const pool = require("../config/db");

// Create Patient
const createPatient = async (
    first_name,
    last_name,
    gender,
    phone,
    address,
    date_of_birth
) => {

    const result = await pool.query(
        `INSERT INTO patients
        (first_name, last_name, gender, phone, address, date_of_birth)
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [
            first_name,
            last_name,
            gender,
            phone,
            address,
            date_of_birth
        ]
    );

    return result.rows[0];
};

// Get All Patients
const getAllPatients = async () => {

    const result = await pool.query(
        "SELECT * FROM patients ORDER BY patient_id ASC"
    );

    return result.rows;
};

// Get Patient by ID
const getPatientById = async (id) => {

    const result = await pool.query(
        "SELECT * FROM patients WHERE patient_id = $1",
        [id]
    );

    return result.rows[0];
};

// Update Patient
const updatePatient = async (
    id,
    first_name,
    last_name,
    gender,
    phone,
    address,
    date_of_birth
) => {

    const result = await pool.query(
        `UPDATE patients
        SET
            first_name = $1,
            last_name = $2,
            gender = $3,
            phone = $4,
            address = $5,
            date_of_birth = $6
        WHERE patient_id = $7
        RETURNING *`,
        [
            first_name,
            last_name,
            gender,
            phone,
            address,
            date_of_birth,
            id
        ]
    );

    return result.rows[0];
};

// Delete Patient
const deletePatient = async (id) => {

    const result = await pool.query(
        "DELETE FROM patients WHERE patient_id = $1 RETURNING *",
        [id]
    );

    return result.rows[0];

};

// Search Patients
const searchPatients = async (searchTerm) => {

    const result = await pool.query(
        `SELECT *
         FROM patients
         WHERE
            LOWER(first_name) LIKE LOWER($1)
            OR LOWER(last_name) LIKE LOWER($1)
            OR phone LIKE $1
         ORDER BY patient_id ASC`,
        [`%${searchTerm}%`]
    );

    return result.rows;
};

module.exports = {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    searchPatients
};