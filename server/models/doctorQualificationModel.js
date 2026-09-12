const pool = require("../config/db");


/*
==================================================
CREATE DOCTOR QUALIFICATION
==================================================
*/

const createQualification = async (
    doctorId,
    qualificationData
) => {

    const {
        qualification,
        institution,
        year_obtained
    } = qualificationData;


    const result = await pool.query(
        `
        INSERT INTO doctor_qualifications
        (
            doctor_id,
            qualification,
            institution,
            year_obtained
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4
        )

        RETURNING *
        `,
        [
            doctorId,
            qualification,
            institution || null,
            year_obtained || null
        ]
    );


    return result.rows[0];

};


/*
==================================================
GET ALL QUALIFICATIONS FOR DOCTOR
==================================================
*/

const getDoctorQualifications = async (
    doctorId
) => {

    const result = await pool.query(
        `
        SELECT
            qualification_id,
            doctor_id,
            qualification,
            institution,
            year_obtained

        FROM doctor_qualifications

        WHERE doctor_id = $1

        ORDER BY
            year_obtained DESC NULLS LAST,
            qualification_id ASC
        `,
        [
            doctorId
        ]
    );


    return result.rows;

};


/*
==================================================
GET SINGLE QUALIFICATION
==================================================
*/

const getQualificationById = async (
    doctorId,
    qualificationId
) => {

    const result = await pool.query(
        `
        SELECT
            qualification_id,
            doctor_id,
            qualification,
            institution,
            year_obtained

        FROM doctor_qualifications

        WHERE
            doctor_id = $1
            AND qualification_id = $2
        `,
        [
            doctorId,
            qualificationId
        ]
    );


    return result.rows[0];

};


/*
==================================================
UPDATE QUALIFICATION
==================================================
*/

const updateQualification = async (
    doctorId,
    qualificationId,
    qualificationData
) => {

    const {
        qualification,
        institution,
        year_obtained
    } = qualificationData;


    const result = await pool.query(
        `
        UPDATE doctor_qualifications

        SET
            qualification = $1,
            institution = $2,
            year_obtained = $3

        WHERE
            doctor_id = $4
            AND qualification_id = $5

        RETURNING *
        `,
        [
            qualification,
            institution || null,
            year_obtained || null,
            doctorId,
            qualificationId
        ]
    );


    return result.rows[0];

};


/*
==================================================
DELETE QUALIFICATION
==================================================
*/

const deleteQualification = async (
    doctorId,
    qualificationId
) => {

    const result = await pool.query(
        `
        DELETE FROM doctor_qualifications

        WHERE
            doctor_id = $1
            AND qualification_id = $2

        RETURNING *
        `,
        [
            doctorId,
            qualificationId
        ]
    );


    return result.rows[0];

};


/*
==================================================
EXPORTS
==================================================
*/

module.exports = {

    createQualification,

    getDoctorQualifications,

    getQualificationById,

    updateQualification,

    deleteQualification

};