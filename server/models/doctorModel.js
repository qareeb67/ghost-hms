const pool = require("../config/db");


/*
==================================================
CREATE DOCTOR
==================================================
*/

const createDoctor = async (doctorData) => {

    const {
        first_name,
        middle_name,
        last_name,
        gender,

        specialization,
        specialization_id,

        department_id,

        phone,
        email,

        years_of_experience,

        mdcn_number,
        mdcn_status,

        employment_type,
        employment_start_date,
        employment_end_date,
        employment_status,

        license_expiry_date,

        address
    } = doctorData;


    /*
    ==============================================
    CHECK IF DOCTOR EMAIL ALREADY EXISTS
    ==============================================
    */

    if (email) {

        const existingDoctor = await pool.query(
            `
            SELECT doctor_id
            FROM doctors
            WHERE LOWER(email) = LOWER($1)
            `,
            [email]
        );


        if (existingDoctor.rows.length > 0) {

            const error = new Error(
                "Doctor with this email already exists"
            );

            error.code = "DOCTOR_EMAIL_EXISTS";

            throw error;

        }

    }


    /*
    ==============================================
    CHECK MDCN NUMBER IF PROVIDED
    ==============================================
    */

    if (mdcn_number) {

        const existingMDCN = await pool.query(
            `
            SELECT doctor_id
            FROM doctors
            WHERE mdcn_number = $1
            `,
            [mdcn_number]
        );


        if (existingMDCN.rows.length > 0) {

            const error = new Error(
                "A doctor with this MDCN number already exists"
            );

            error.code = "MDCN_NUMBER_EXISTS";

            throw error;

        }

    }


    /*
    ==============================================
    CHECK IF USER EXISTS WITH SAME EMAIL
    ==============================================
    */

    let userId = null;


    if (email) {

        const existingUser = await pool.query(
            `
            SELECT
                user_id,
                email,
                role

            FROM users

            WHERE LOWER(email) = LOWER($1)
            `,
            [email]
        );


        /*
        ==========================================
        LINK USER ONLY IF ROLE IS DOCTOR
        ==========================================
        */

        if (
            existingUser.rows.length > 0 &&
            existingUser.rows[0].role === "doctor"
        ) {

            userId =
                existingUser.rows[0].user_id;

        }

    }


    /*
    ==============================================
    CREATE DOCTOR

    doctor_number is generated automatically
    by PostgreSQL trigger
    ==============================================
    */

    const result = await pool.query(
        `
        INSERT INTO doctors
        (
            first_name,
            middle_name,
            last_name,
            gender,

            specialization,
            specialization_id,

            department_id,

            phone,
            email,

            years_of_experience,

            mdcn_number,
            mdcn_status,

            employment_type,
            employment_start_date,
            employment_end_date,
            employment_status,

            license_expiry_date,

            address,

            user_id
        )

        VALUES
        (
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

            $19
        )

        RETURNING *
        `,
        [
            first_name,
            middle_name || null,
            last_name,
            gender || null,

            specialization,
            specialization_id || null,

            department_id || null,

            phone || null,
            email || null,

            years_of_experience || null,

            mdcn_number || null,
            mdcn_status || null,

            employment_type || null,
            employment_start_date || null,
            employment_end_date || null,
            employment_status || null,

            license_expiry_date || null,

            address || null,

            userId
        ]
    );


    return result.rows[0];

};


/*
==================================================
GET ALL DOCTORS

Includes:

Doctor details
Department
Specialization
==================================================
*/

const getAllDoctors = async () => {

    const result = await pool.query(
        `
        SELECT

            d.*,

            dep.department_code,

            dep.department_name,

            s.specialization_code,

            s.specialization_name


        FROM doctors d


        LEFT JOIN departments dep
        ON d.department_id = dep.department_id


        LEFT JOIN specializations s
        ON d.specialization_id =
            s.specialization_id


        ORDER BY
            d.doctor_id ASC
        `
    );


    return result.rows;

};


/*
==================================================
GET DOCTOR BY ID
==================================================
*/

const getDoctorById = async (id) => {

    const doctorResult = await pool.query(
        `
        SELECT

            d.*,

            dep.department_code,

            dep.department_name,

            s.specialization_code,

            s.specialization_name


        FROM doctors d


        LEFT JOIN departments dep
        ON d.department_id = dep.department_id


        LEFT JOIN specializations s
        ON d.specialization_id =
            s.specialization_id


        WHERE d.doctor_id = $1
        `,
        [id]
    );


    const doctor =
        doctorResult.rows[0];


    if (!doctor) {

        return null;

    }


    /*
    ==============================================
    GET DOCTOR QUALIFICATIONS
    ==============================================
    */

    const qualificationsResult =
        await pool.query(
            `
            SELECT
                qualification_id,
                qualification,
                institution,
                year_obtained

            FROM doctor_qualifications

            WHERE doctor_id = $1

            ORDER BY
                year_obtained DESC NULLS LAST,
                qualification_id ASC
            `,
            [id]
        );


    doctor.qualifications =
        qualificationsResult.rows;


    return doctor;

};


/*
==================================================
UPDATE DOCTOR
==================================================
*/

const updateDoctor = async (
    id,
    doctorData
) => {

    const {
        first_name,
        middle_name,
        last_name,
        gender,

        specialization,
        specialization_id,

        department_id,

        phone,
        email,

        years_of_experience,

        mdcn_number,
        mdcn_status,

        employment_type,
        employment_start_date,
        employment_end_date,
        employment_status,

        license_expiry_date,

        address
    } = doctorData;


    /*
    ==============================================
    CHECK EMAIL CONFLICT
    ==============================================
    */

    if (email) {

        const existingDoctor = await pool.query(
            `
            SELECT doctor_id

            FROM doctors

            WHERE LOWER(email) = LOWER($1)

            AND doctor_id != $2
            `,
            [
                email,
                id
            ]
        );


        if (existingDoctor.rows.length > 0) {

            const error = new Error(
                "Another doctor already uses this email"
            );

            error.code = "DOCTOR_EMAIL_EXISTS";

            throw error;

        }

    }


    /*
    ==============================================
    CHECK MDCN CONFLICT
    ==============================================
    */

    if (mdcn_number) {

        const existingMDCN = await pool.query(
            `
            SELECT doctor_id

            FROM doctors

            WHERE mdcn_number = $1

            AND doctor_id != $2
            `,
            [
                mdcn_number,
                id
            ]
        );


        if (existingMDCN.rows.length > 0) {

            const error = new Error(
                "Another doctor already uses this MDCN number"
            );

            error.code = "MDCN_NUMBER_EXISTS";

            throw error;

        }

    }


    /*
    ==============================================
    UPDATE DOCTOR
    ==============================================
    */

    const result = await pool.query(
        `
        UPDATE doctors

        SET

            first_name = $1,

            middle_name = $2,

            last_name = $3,

            gender = $4,


            specialization = $5,

            specialization_id = $6,


            department_id = $7,


            phone = $8,

            email = $9,


            years_of_experience = $10,


            mdcn_number = $11,

            mdcn_status = $12,


            employment_type = $13,

            employment_start_date = $14,

            employment_end_date = $15,

            employment_status = $16,


            license_expiry_date = $17,


            address = $18,


            updated_at = CURRENT_TIMESTAMP


        WHERE doctor_id = $19


        RETURNING *
        `,
        [
            first_name,
            middle_name || null,
            last_name,
            gender || null,

            specialization,
            specialization_id || null,

            department_id || null,

            phone || null,
            email || null,

            years_of_experience || null,

            mdcn_number || null,
            mdcn_status || null,

            employment_type || null,
            employment_start_date || null,
            employment_end_date || null,
            employment_status || null,

            license_expiry_date || null,

            address || null,

            id
        ]
    );


    return result.rows[0];

};


/*
==================================================
DELETE DOCTOR
==================================================
*/

const deleteDoctor = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM doctors

        WHERE doctor_id = $1

        RETURNING *
        `,
        [id]
    );


    return result.rows[0];

};


/*
==================================================
SEARCH DOCTORS

Searches by:

Doctor number
Name
Specialization
Department
Email
Phone
MDCN number
==================================================
*/

const searchDoctors = async (
    searchTerm
) => {

    const result = await pool.query(
        `
        SELECT

            d.*,

            dep.department_name,

            s.specialization_name


        FROM doctors d


        LEFT JOIN departments dep
        ON d.department_id =
            dep.department_id


        LEFT JOIN specializations s
        ON d.specialization_id =
            s.specialization_id


        WHERE

            LOWER(
                COALESCE(
                    d.doctor_number,
                    ''
                )
            )
            LIKE LOWER($1)


            OR LOWER(d.first_name)
            LIKE LOWER($1)


            OR LOWER(d.last_name)
            LIKE LOWER($1)


            OR LOWER(
                COALESCE(
                    d.middle_name,
                    ''
                )
            )
            LIKE LOWER($1)


            OR LOWER(
                COALESCE(
                    s.specialization_name,
                    d.specialization,
                    ''
                )
            )
            LIKE LOWER($1)


            OR LOWER(
                COALESCE(
                    dep.department_name,
                    ''
                )
            )
            LIKE LOWER($1)


            OR LOWER(
                COALESCE(
                    d.email,
                    ''
                )
            )
            LIKE LOWER($1)


            OR COALESCE(
                d.phone,
                ''
            )
            LIKE $1


            OR LOWER(
                COALESCE(
                    d.mdcn_number,
                    ''
                )
            )
            LIKE LOWER($1)


        ORDER BY
            d.doctor_id ASC
        `,
        [
            `%${searchTerm}%`
        ]
    );


    return result.rows;

};


/*
==================================================
LINK DOCTOR TO USER BY EMAIL
==================================================
*/

const linkDoctorToUserByEmail = async (
    email,
    userId
) => {

    const result = await pool.query(
        `
        UPDATE doctors

        SET
            user_id = $1,
            updated_at = CURRENT_TIMESTAMP

        WHERE LOWER(email) = LOWER($2)

        RETURNING *
        `,
        [
            userId,
            email
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

    createDoctor,

    getAllDoctors,

    getDoctorById,

    updateDoctor,

    deleteDoctor,

    searchDoctors,

    linkDoctorToUserByEmail

};