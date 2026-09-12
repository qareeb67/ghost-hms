const db = require("../config/db");

/*
==================================================
CREATE MEDICAL RECORD
==================================================
*/

const createMedicalRecord = async ({
    patient_id,
    doctor_id,

    chief_complaint,
    symptoms,
    history_of_present_illness,

    blood_pressure,
    temperature,
    pulse_rate,
    respiratory_rate,
    oxygen_saturation,
    weight,
    height,

    diagnosis,
    prescription,
    allergies,
    treatment_plan,
    investigation_notes,
    notes,

    visit_date,
    follow_up_date
}) => {

    const query = `
        INSERT INTO medical_records (

            patient_id,
            doctor_id,

            chief_complaint,
            symptoms,
            history_of_present_illness,

            blood_pressure,
            temperature,
            pulse_rate,
            respiratory_rate,
            oxygen_saturation,
            weight,
            height,

            diagnosis,
            prescription,
            allergies,
            treatment_plan,
            investigation_notes,
            notes,

            visit_date,
            follow_up_date

        )

        VALUES (

            $1,
            $2,

            $3,
            $4,
            $5,

            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,

            $13,
            $14,
            $15,
            $16,
            $17,
            $18,

            COALESCE($19, CURRENT_DATE),
            $20

        )

        RETURNING *;
    `;


    const values = [

        patient_id,
        doctor_id,

        chief_complaint || null,
        symptoms || null,
        history_of_present_illness || null,

        blood_pressure || null,
        temperature ?? null,
        pulse_rate ?? null,
        respiratory_rate ?? null,
        oxygen_saturation ?? null,
        weight ?? null,
        height ?? null,

        diagnosis,
        prescription || null,
        allergies || null,
        treatment_plan || null,
        investigation_notes || null,
        notes || null,

        visit_date || null,
        follow_up_date || null

    ];


    const result =
        await db.query(
            query,
            values
        );


    return result.rows[0];

};


/*
==================================================
GET ALL MEDICAL RECORDS
==================================================
*/

const getAllMedicalRecords = async () => {

    const query = `

        SELECT

            m.record_id,

            m.patient_id,
            m.doctor_id,

            p.first_name || ' ' || p.last_name
                AS patient_name,

            d.first_name || ' ' || d.last_name
                AS doctor_name,

            d.specialization,

            m.chief_complaint,
            m.symptoms,
            m.history_of_present_illness,

            m.blood_pressure,
            m.temperature,
            m.pulse_rate,
            m.respiratory_rate,
            m.oxygen_saturation,
            m.weight,
            m.height,

            m.diagnosis,
            m.prescription,
            m.allergies,
            m.treatment_plan,
            m.investigation_notes,
            m.notes,

            m.visit_date,
            m.follow_up_date,

            m.created_at,
            m.updated_at

        FROM medical_records m

        JOIN patients p
            ON m.patient_id = p.patient_id

        JOIN doctors d
            ON m.doctor_id = d.doctor_id

        ORDER BY
            m.visit_date DESC,
            m.created_at DESC;

    `;


    const result =
        await db.query(query);


    return result.rows;

};


/*
==================================================
GET MEDICAL RECORD BY ID
==================================================
*/

const getMedicalRecordById = async (
    record_id
) => {

    const query = `

        SELECT

            m.record_id,

            m.patient_id,
            m.doctor_id,

            p.first_name || ' ' || p.last_name
                AS patient_name,

            d.first_name || ' ' || d.last_name
                AS doctor_name,

            d.specialization,

            m.chief_complaint,
            m.symptoms,
            m.history_of_present_illness,

            m.blood_pressure,
            m.temperature,
            m.pulse_rate,
            m.respiratory_rate,
            m.oxygen_saturation,
            m.weight,
            m.height,

            m.diagnosis,
            m.prescription,
            m.allergies,
            m.treatment_plan,
            m.investigation_notes,
            m.notes,

            m.visit_date,
            m.follow_up_date,

            m.created_at,
            m.updated_at

        FROM medical_records m

        JOIN patients p
            ON m.patient_id = p.patient_id

        JOIN doctors d
            ON m.doctor_id = d.doctor_id

        WHERE m.record_id = $1;

    `;


    const result =
        await db.query(
            query,
            [record_id]
        );


    return result.rows[0];

};

/*
==================================================
GET MEDICAL RECORDS BY PATIENT
==================================================
*/

const getMedicalRecordsByPatient = async (
    patient_id
) => {

    const query = `
        SELECT
            m.record_id,
            m.patient_id,
            m.doctor_id,

            p.first_name || ' ' || p.last_name
                AS patient_name,

            d.first_name || ' ' || d.last_name
                AS doctor_name,

            d.specialization,

            m.chief_complaint,
            m.symptoms,
            m.history_of_present_illness,

            m.blood_pressure,
            m.temperature,
            m.pulse_rate,
            m.respiratory_rate,
            m.oxygen_saturation,
            m.weight,
            m.height,

            m.diagnosis,
            m.prescription,
            m.allergies,
            m.treatment_plan,
            m.investigation_notes,
            m.notes,

            m.visit_date,
            m.follow_up_date,
            m.created_at

        FROM medical_records m

        JOIN patients p
            ON m.patient_id = p.patient_id

        JOIN doctors d
            ON m.doctor_id = d.doctor_id

        WHERE m.patient_id = $1

        ORDER BY
            m.visit_date DESC,
            m.created_at DESC;
    `;


    const result =
        await db.query(
            query,
            [patient_id]
        );


    return result.rows;

};
/*
==================================================
UPDATE MEDICAL RECORD
==================================================
*/

const updateMedicalRecord = async (
    record_id,
    {
        patient_id,
        doctor_id,

        chief_complaint,
        symptoms,
        history_of_present_illness,

        blood_pressure,
        temperature,
        pulse_rate,
        respiratory_rate,
        oxygen_saturation,
        weight,
        height,

        diagnosis,
        prescription,
        allergies,
        treatment_plan,
        investigation_notes,
        notes,

        visit_date,
        follow_up_date
    }
) => {

    const query = `

        UPDATE medical_records

        SET

            patient_id = $1,
            doctor_id = $2,

            chief_complaint = $3,
            symptoms = $4,
            history_of_present_illness = $5,

            blood_pressure = $6,
            temperature = $7,
            pulse_rate = $8,
            respiratory_rate = $9,
            oxygen_saturation = $10,
            weight = $11,
            height = $12,

            diagnosis = $13,
            prescription = $14,
            allergies = $15,
            treatment_plan = $16,
            investigation_notes = $17,
            notes = $18,

            visit_date = COALESCE($19, visit_date),
            follow_up_date = $20,

            updated_at = CURRENT_TIMESTAMP

        WHERE record_id = $21

        RETURNING *;

    `;


    const values = [

        patient_id,
        doctor_id,

        chief_complaint || null,
        symptoms || null,
        history_of_present_illness || null,

        blood_pressure || null,
        temperature ?? null,
        pulse_rate ?? null,
        respiratory_rate ?? null,
        oxygen_saturation ?? null,
        weight ?? null,
        height ?? null,

        diagnosis,
        prescription || null,
        allergies || null,
        treatment_plan || null,
        investigation_notes || null,
        notes || null,

        visit_date || null,
        follow_up_date || null,

        record_id

    ];


    const result =
        await db.query(
            query,
            values
        );


    return result.rows[0];

};


/*
==================================================
DELETE MEDICAL RECORD
==================================================
*/

const deleteMedicalRecord = async (
    record_id
) => {

    const query = `

        DELETE FROM medical_records

        WHERE record_id = $1

        RETURNING *;

    `;


    const result =
        await db.query(
            query,
            [record_id]
        );


    return result.rows[0];

};


/*
==================================================
EXPORTS
==================================================
*/

module.exports = {

    createMedicalRecord,
    getAllMedicalRecords,
    getMedicalRecordsByPatient,
    getMedicalRecordById,
    updateMedicalRecord,
    deleteMedicalRecord

};