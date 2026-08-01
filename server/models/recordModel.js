const db = require("../config/db");

// Create Medical Record
const createMedicalRecord = async (
    patient_id,
    doctor_id,
    diagnosis,
    prescription,
    allergies,
    notes
) => {

    const query = `
        INSERT INTO medical_records
        (
            patient_id,
            doctor_id,
            diagnosis,
            prescription,
            allergies,
            notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    const values = [
        patient_id,
        doctor_id,
        diagnosis,
        prescription,
        allergies,
        notes
    ];

    const result = await db.query(query, values);

    return result.rows[0];

};

// Get All Medical Records
const getAllMedicalRecords = async () => {

    const query = `
        SELECT *
        FROM medical_records
        ORDER BY created_at DESC;
    `;

    const result = await db.query(query);

    return result.rows;

};

// Get Medical Record By ID
const getMedicalRecordById = async (id) => {

    const query = `
        SELECT *
        FROM medical_records
        WHERE record_id = $1;
    `;

    const result = await db.query(query, [id]);

    return result.rows[0];

};

module.exports = {
    createMedicalRecord,
    getAllMedicalRecords,
    getMedicalRecordById
};