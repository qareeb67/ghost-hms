const pool = require("../config/db");


// =====================================================
// CREATE PATIENT
// =====================================================

const createPatient = async (
    first_name,
    last_name,
    gender,
    email,
    phone,
    address,
    date_of_birth,
    blood_group,
    genotype,
    marital_status,
    occupation,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship,
    allergies,
    medical_history,
    nationality = "Nigeria",
    state_of_origin = null,
    lga = null,
    patient_status = "Active"
) => {

    const result = await pool.query(
        `
        INSERT INTO patients
        (
            first_name,
            last_name,
            gender,
            email,
            phone,
            address,
            date_of_birth,
            blood_group,
            genotype,
            marital_status,
            occupation,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            allergies,
            medical_history,
            nationality,
            state_of_origin,
            lga,
            patient_status,
            registration_date
        )
        VALUES
        (
            $1, $2, $3, $4,
            $5, $6, $7, $8,
            $9, $10, $11, $12,
            $13, $14, $15, $16,
            $17, $18, $19, $20,
            CURRENT_DATE
        )
        RETURNING *
        `,
        [
            first_name,
            last_name,
            gender,
            email,
            phone,
            address,
            date_of_birth,
            blood_group,
            genotype,
            marital_status,
            occupation,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            allergies,
            medical_history,
            nationality,
            state_of_origin,
            lga,
            patient_status
        ]
    );

    return result.rows[0];

};


// =====================================================
// GET ALL PATIENTS
// =====================================================

const getAllPatients = async () => {

    const result = await pool.query(
        `
        SELECT *
        FROM patients
        ORDER BY patient_id ASC
        `
    );

    return result.rows;

};


// =====================================================
// GET PATIENT BY ID
// =====================================================

const getPatientById = async (id) => {

    const result = await pool.query(
        `
        SELECT *
        FROM patients
        WHERE patient_id = $1
        `,
        [id]
    );

    return result.rows[0];

};


// =====================================================
// GET PATIENT BY PATIENT NUMBER
// =====================================================

const getPatientByNumber = async (patient_number) => {

    const result = await pool.query(
        `
        SELECT *
        FROM patients
        WHERE patient_number = $1
        `,
        [patient_number]
    );

    return result.rows[0];

};


// =====================================================
// UPDATE PATIENT
// =====================================================

const updatePatient = async (
    id,
    first_name,
    last_name,
    gender,
    email,
    phone,
    address,
    date_of_birth,
    blood_group,
    genotype,
    marital_status,
    occupation,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship,
    allergies,
    medical_history,
    nationality,
    state_of_origin,
    lga,
    patient_status
) => {

    const result = await pool.query(
        `
        UPDATE patients
        SET
            first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            gender = COALESCE($3, gender),
            email = COALESCE($4, email),
            phone = COALESCE($5, phone),
            address = COALESCE($6, address),
            date_of_birth = COALESCE($7, date_of_birth),
            blood_group = COALESCE($8, blood_group),
            genotype = COALESCE($9, genotype),
            marital_status = COALESCE($10, marital_status),
            occupation = COALESCE($11, occupation),
            emergency_contact_name = COALESCE($12, emergency_contact_name),
            emergency_contact_phone = COALESCE($13, emergency_contact_phone),
            emergency_contact_relationship =
                COALESCE($14, emergency_contact_relationship),
            allergies = COALESCE($15, allergies),
            medical_history = COALESCE($16, medical_history),
            nationality = COALESCE($17, nationality),
            state_of_origin = COALESCE($18, state_of_origin),
            lga = COALESCE($19, lga),
            patient_status = COALESCE($20, patient_status),
            updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = $21
        RETURNING *
        `,
        [
            first_name ?? null,
            last_name ?? null,
            gender ?? null,
            email ?? null,
            phone ?? null,
            address ?? null,
            date_of_birth ?? null,
            blood_group ?? null,
            genotype ?? null,
            marital_status ?? null,
            occupation ?? null,
            emergency_contact_name ?? null,
            emergency_contact_phone ?? null,
            emergency_contact_relationship ?? null,
            allergies ?? null,
            medical_history ?? null,
            nationality ?? null,
            state_of_origin ?? null,
            lga ?? null,
            patient_status ?? null,
            id
        ]
    );

    return result.rows[0];

};


// =====================================================
// UPDATE PATIENT STATUS
// =====================================================

const updatePatientStatus = async (
    id,
    patient_status
) => {

    const result = await pool.query(
        `
        UPDATE patients
        SET
            patient_status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = $2
        RETURNING *
        `,
        [
            patient_status,
            id
        ]
    );

    return result.rows[0];

};


// =====================================================
// DELETE PATIENT
// =====================================================

const deletePatient = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM patients
        WHERE patient_id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];

};


// =====================================================
// SEARCH PATIENTS
// =====================================================

const searchPatients = async (
    searchTerm
) => {

    const result = await pool.query(
        `
        SELECT *
        FROM patients
        WHERE
            LOWER(patient_number) LIKE LOWER($1)
            OR LOWER(first_name) LIKE LOWER($1)
            OR LOWER(last_name) LIKE LOWER($1)
            OR LOWER(email) LIKE LOWER($1)
            OR phone LIKE $1
        ORDER BY patient_id ASC
        `,
        [
            `%${searchTerm}%`
        ]
    );

    return result.rows;

};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    createPatient,
    getAllPatients,
    getPatientById,
    getPatientByNumber,
    updatePatient,
    updatePatientStatus,
    deletePatient,
    searchPatients
};