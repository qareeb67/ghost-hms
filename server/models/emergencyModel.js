const db = require("../config/db");

// Create Emergency Case
const createEmergencyCase = async (
    patient_id,
    temporary_name,
    triage_level,
    assigned_doctor,
    status,
    emergency_notes
) => {

    const query = `
        INSERT INTO emergency_cases
        (
            patient_id,
            temporary_name,
            triage_level,
            assigned_doctor,
            status,
            emergency_notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    const values = [
        patient_id,
        temporary_name,
        triage_level,
        assigned_doctor,
        status,
        emergency_notes
    ];

    const result = await db.query(query, values);

    return result.rows[0];

};

// Get All Emergency Cases
const getAllEmergencyCases = async () => {

    const query = `
        SELECT *
        FROM emergency_cases
        ORDER BY arrival_time DESC;
    `;

    const result = await db.query(query);

    return result.rows;

};

// Get Emergency Case By ID
const getEmergencyCaseById = async (id) => {

    const query = `
        SELECT *
        FROM emergency_cases
        WHERE emergency_id = $1;
    `;

    const result = await db.query(query, [id]);

    return result.rows[0];

};

module.exports = {
    createEmergencyCase,
    getAllEmergencyCases,
    getEmergencyCaseById
};