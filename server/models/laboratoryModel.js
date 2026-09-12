
const db = require("../config/db");


/*
==================================================
LABORATORY SELECT FIELDS
==================================================
*/

const laboratorySelectFields = `
    l.test_id,

    l.patient_id,

    l.doctor_id,

    p.first_name || ' ' || p.last_name AS patient_name,

    d.first_name || ' ' || d.last_name AS doctor_name,

    d.specialization,

    l.test_name,

    l.status,

    l.result,

    l.requested_at,

    l.completed_at
`;


/*
==================================================
GET LABORATORY TEST BY ID
==================================================
*/

const getLaboratoryTestById = async (id) => {

    const query = `
        SELECT
            ${laboratorySelectFields}

        FROM laboratory_tests l

        JOIN patients p
            ON l.patient_id = p.patient_id

        JOIN doctors d
            ON l.doctor_id = d.doctor_id

        WHERE l.test_id = $1;
    `;

    const result = await db.query(
        query,
        [id]
    );

    return result.rows[0];

};


/*
==================================================
CREATE LABORATORY TEST
==================================================
*/

const createLaboratoryTest = async (
    patient_id,
    doctor_id,
    test_name
) => {

    const query = `
        INSERT INTO laboratory_tests
        (
            patient_id,
            doctor_id,
            test_name
        )
        VALUES
        (
            $1,
            $2,
            $3
        )
        RETURNING test_id;
    `;

    const values = [
        patient_id,
        doctor_id,
        test_name
    ];

    const result = await db.query(
        query,
        values
    );

    return await getLaboratoryTestById(
        result.rows[0].test_id
    );

};


/*
==================================================
GET ALL LABORATORY TESTS
==================================================
*/

const getAllLaboratoryTests = async () => {

    const query = `
        SELECT
            ${laboratorySelectFields}

        FROM laboratory_tests l

        JOIN patients p
            ON l.patient_id = p.patient_id

        JOIN doctors d
            ON l.doctor_id = d.doctor_id

        ORDER BY
            l.requested_at DESC;
    `;

    const result = await db.query(query);

    return result.rows;

};


/*
==================================================
UPDATE LABORATORY TEST
==================================================
*/

const updateLaboratoryTest = async (
    test_id,
    patient_id,
    doctor_id,
    test_name,
    status,
    result
) => {

    const query = `
        UPDATE laboratory_tests

        SET
            patient_id = COALESCE($1, patient_id),

            doctor_id = COALESCE($2, doctor_id),

            test_name = COALESCE($3, test_name),

            status = COALESCE($4, status),

            result = COALESCE($5, result),

            completed_at = CASE

                WHEN COALESCE($4, status) = 'Completed'

                THEN COALESCE(
                    completed_at,
                    CURRENT_TIMESTAMP
                )

                ELSE completed_at

            END

        WHERE test_id = $6

        RETURNING test_id;
    `;

    const values = [
        patient_id,
        doctor_id,
        test_name,
        status,
        result,
        test_id
    ];

    const resultData = await db.query(
        query,
        values
    );

    if (!resultData.rows[0]) {
        return null;
    }

    return await getLaboratoryTestById(
        resultData.rows[0].test_id
    );

};


/*
==================================================
COMPLETE LABORATORY TEST
==================================================
*/

const completeLaboratoryTest = async (
    test_id,
    result
) => {

    const query = `
        UPDATE laboratory_tests

        SET
            result = $1,

            status = 'Completed',

            completed_at = CURRENT_TIMESTAMP

        WHERE test_id = $2

        RETURNING test_id;
    `;

    const values = [
        result,
        test_id
    ];

    const resultData = await db.query(
        query,
        values
    );

    if (!resultData.rows[0]) {
        return null;
    }

    return await getLaboratoryTestById(
        resultData.rows[0].test_id
    );

};


/*
==================================================
DELETE LABORATORY TEST
==================================================
*/

const deleteLaboratoryTest = async (
    test_id
) => {

    /*
    Get the complete record BEFORE deletion
    so the API returns useful information.
    */

    const laboratoryTest =
        await getLaboratoryTestById(
            test_id
        );

    if (!laboratoryTest) {
        return null;
    }


    await db.query(
        `
        DELETE FROM laboratory_tests

        WHERE test_id = $1;
        `,
        [test_id]
    );


    return laboratoryTest;

};


/*
==================================================
EXPORTS
==================================================
*/

module.exports = {

    createLaboratoryTest,

    getAllLaboratoryTests,

    getLaboratoryTestById,

    updateLaboratoryTest,

    deleteLaboratoryTest,

    completeLaboratoryTest

};

