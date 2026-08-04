const db = require("../config/db");

// Create Laboratory Test
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
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

    const values = [
        patient_id,
        doctor_id,
        test_name
    ];

    const result = await db.query(query, values);

    return result.rows[0];

};

// Get All Laboratory Tests
const getAllLaboratoryTests = async () => {

    const query = `
        SELECT *
        FROM laboratory_tests
        ORDER BY requested_at DESC;
    `;

    const result = await db.query(query);

    return result.rows;

};

// Get Laboratory Test By ID
const getLaboratoryTestById = async (id) => {

    const query = `
        SELECT *
        FROM laboratory_tests
        WHERE test_id = $1;
    `;

    const result = await db.query(query, [id]);

    return result.rows[0];

};

module.exports = {
    createLaboratoryTest,
    getAllLaboratoryTests,
    getLaboratoryTestById
};