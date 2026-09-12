const db = require("../config/db");


// ==================================================
// EMERGENCY SELECT FIELDS
// ==================================================

const emergencySelectFields = `
    e.emergency_id,

    e.patient_id,

    e.temporary_name,

    CASE
        WHEN e.patient_id IS NOT NULL
        THEN p.first_name || ' ' || p.last_name
        ELSE e.temporary_name
    END AS patient_name,

    e.triage_level,

    e.assigned_doctor,

    CASE
        WHEN e.assigned_doctor IS NOT NULL
        THEN d.first_name || ' ' || d.last_name
        ELSE NULL
    END AS doctor_name,

    d.specialization,

    e.status,

    e.emergency_notes,

    e.arrival_time
`;


// ==================================================
// GET EMERGENCY CASE BY ID
// ==================================================

const getEmergencyCaseById = async (id) => {

    const query = `
        SELECT
            ${emergencySelectFields}

        FROM emergency_cases e

        LEFT JOIN patients p
            ON e.patient_id = p.patient_id

        LEFT JOIN doctors d
            ON e.assigned_doctor = d.doctor_id

        WHERE e.emergency_id = $1;
    `;

    const result = await db.query(
        query,
        [id]
    );

    return result.rows[0] || null;
};


// ==================================================
// CREATE EMERGENCY CASE
// ==================================================

const createEmergencyCase = async (
    patient_id,
    temporary_name,
    triage_level,
    assigned_doctor,
    status,
    emergency_notes
) => {

    const query = `
        INSERT INTO emergency_cases (
            patient_id,
            temporary_name,
            triage_level,
            assigned_doctor,
            status,
            emergency_notes
        )

        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
        )

        RETURNING emergency_id;
    `;

    const values = [
        patient_id ?? null,
        temporary_name?.trim() || null,
        triage_level,
        assigned_doctor ?? null,
        status || "Waiting",
        emergency_notes?.trim() || null
    ];

    const result = await db.query(
        query,
        values
    );

    return await getEmergencyCaseById(
        result.rows[0].emergency_id
    );
};


// ==================================================
// GET ALL EMERGENCY CASES
// ==================================================

const getAllEmergencyCases = async () => {

    const query = `
        SELECT
            ${emergencySelectFields}

        FROM emergency_cases e

        LEFT JOIN patients p
            ON e.patient_id = p.patient_id

        LEFT JOIN doctors d
            ON e.assigned_doctor = d.doctor_id

        ORDER BY

            CASE e.status
                WHEN 'Waiting' THEN 1
                WHEN 'In Treatment' THEN 2
                WHEN 'Completed' THEN 3
                ELSE 4
            END,

            CASE e.triage_level
                WHEN 'Critical' THEN 1
                WHEN 'High' THEN 2
                WHEN 'Medium' THEN 3
                WHEN 'Low' THEN 4
                ELSE 5
            END,

            e.arrival_time ASC;
    `;

    const result = await db.query(
        query
    );

    return result.rows;
};


// ==================================================
// UPDATE EMERGENCY CASE
// ==================================================

const updateEmergencyCase = async (
    emergency_id,
    patient_id,
    temporary_name,
    triage_level,
    assigned_doctor,
    status,
    emergency_notes
) => {

    const query = `
        UPDATE emergency_cases

        SET
            patient_id = $1,
            temporary_name = $2,
            triage_level = $3,
            assigned_doctor = $4,
            status = $5,
            emergency_notes = $6

        WHERE emergency_id = $7

        RETURNING emergency_id;
    `;

    const values = [
        patient_id ?? null,
        temporary_name?.trim() || null,
        triage_level,
        assigned_doctor ?? null,
        status || "Waiting",
        emergency_notes?.trim() || null,
        emergency_id
    ];

    const result = await db.query(
        query,
        values
    );

    if (!result.rows[0]) {
        return null;
    }

    return await getEmergencyCaseById(
        result.rows[0].emergency_id
    );
};


// ==================================================
// UPDATE EMERGENCY STATUS
// ==================================================

const updateEmergencyStatus = async (
    emergency_id,
    status
) => {

    const query = `
        UPDATE emergency_cases

        SET
            status = $1

        WHERE emergency_id = $2

        RETURNING emergency_id;
    `;

    const result = await db.query(
        query,
        [
            status,
            emergency_id
        ]
    );

    if (!result.rows[0]) {
        return null;
    }

    return await getEmergencyCaseById(
        result.rows[0].emergency_id
    );
};


// ==================================================
// ASSIGN / UNASSIGN DOCTOR
// ==================================================

const assignEmergencyDoctor = async (
    emergency_id,
    assigned_doctor
) => {

    const query = `
        UPDATE emergency_cases

        SET
            assigned_doctor = $1

        WHERE emergency_id = $2

        RETURNING emergency_id;
    `;

    const result = await db.query(
        query,
        [
            assigned_doctor ?? null,
            emergency_id
        ]
    );

    if (!result.rows[0]) {
        return null;
    }

    return await getEmergencyCaseById(
        result.rows[0].emergency_id
    );
};


// ==================================================
// DELETE EMERGENCY CASE
// ==================================================

const deleteEmergencyCase = async (
    emergency_id
) => {

    const emergency =
        await getEmergencyCaseById(
            emergency_id
        );

    if (!emergency) {
        return null;
    }

    await db.query(
        `
        DELETE FROM emergency_cases
        WHERE emergency_id = $1;
        `,
        [emergency_id]
    );

    return emergency;
};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    createEmergencyCase,

    getAllEmergencyCases,

    getEmergencyCaseById,

    updateEmergencyCase,

    updateEmergencyStatus,

    assignEmergencyDoctor,

    deleteEmergencyCase

};