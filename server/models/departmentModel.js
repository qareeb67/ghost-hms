const pool = require("../config/db");


/*
==================================================
GET ALL DEPARTMENTS

Returns all departments ordered by name.
==================================================
*/

const getAllDepartments = async () => {

    const result = await pool.query(
        `
        SELECT

            department_id,
            department_name,
            department_code,
            description,
            is_active,
            created_at,
            updated_at

        FROM departments

        ORDER BY
            department_name ASC
        `
    );


    return result.rows;

};


/*
==================================================
GET ACTIVE DEPARTMENTS

Used by forms where users should only select
departments that are currently active.
==================================================
*/

const getActiveDepartments = async () => {

    const result = await pool.query(
        `
        SELECT

            department_id,
            department_name,
            department_code,
            description,
            is_active,
            created_at,
            updated_at

        FROM departments

        WHERE is_active = true

        ORDER BY
            department_name ASC
        `
    );


    return result.rows;

};


/*
==================================================
GET DEPARTMENT BY ID
==================================================
*/

const getDepartmentById = async (
    id
) => {

    const result = await pool.query(
        `
        SELECT

            department_id,
            department_name,
            department_code,
            description,
            is_active,
            created_at,
            updated_at

        FROM departments

        WHERE department_id = $1
        `,
        [id]
    );


    return result.rows[0];

};


/*
==================================================
EXPORTS
==================================================
*/

module.exports = {

    getAllDepartments,

    getActiveDepartments,

    getDepartmentById

};