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

module.exports = {
    createPatient,
    getAllPatients,
    getPatientById
};