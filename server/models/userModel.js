const pool = require("../config/db");


// ==================================================
// CREATE USER
// ==================================================

const createUser = async (
    username,
    email,
    password,
    role
) => {

    const result = await pool.query(

        `
        INSERT INTO users
        (
            username,
            email,
            password,
            role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            user_id,
            username,
            email,
            role,
            created_at
        `,

        [
            username,
            email,
            password,
            role
        ]

    );

    return result.rows[0];

};


// ==================================================
// FIND USER BY EMAIL
// ==================================================

const findUserByEmail = async (
    email
) => {

    const result = await pool.query(

        `
        SELECT *
        FROM users
        WHERE LOWER(email) = LOWER($1)
        `,

        [email]

    );

    return result.rows[0];

};


// ==================================================
// FIND USER BY ID
// ==================================================

const findUserById = async (
    userId
) => {

    const result = await pool.query(

        `
        SELECT
            user_id,
            username,
            email,
            role,
            created_at
        FROM users
        WHERE user_id = $1
        `,

        [userId]

    );

    return result.rows[0];

};


// ==================================================
// GET ALL USERS
// ==================================================

const getAllUsers = async () => {

    const result = await pool.query(

        `
        SELECT
            user_id,
            username,
            email,
            role,
            created_at
        FROM users
        ORDER BY created_at DESC
        `

    );

    return result.rows;

};


// ==================================================
// LINK DOCTOR TO USER
// ==================================================

const linkDoctorToUser = async (
    userId,
    email
) => {

    const result = await pool.query(

        `
        UPDATE doctors

        SET user_id = $1

        WHERE LOWER(email) = LOWER($2)

        RETURNING
            doctor_id,
            user_id,
            first_name,
            last_name,
            email
        `,

        [
            userId,
            email
        ]

    );

    return result.rows[0];

};


// ==================================================
// UNLINK DOCTOR FROM USER
// ==================================================

const unlinkDoctorFromUser = async (
    userId
) => {

    const result = await pool.query(

        `
        UPDATE doctors

        SET user_id = NULL

        WHERE user_id = $1

        RETURNING
            doctor_id,
            user_id,
            first_name,
            last_name,
            email
        `,

        [userId]

    );

    return result.rows[0];

};


// ==================================================
// UPDATE USER BY ADMIN
// ==================================================
//
// Used when an administrator edits another user.
//
// This is intentionally separate from updateUser()
// because /users/me is for the currently logged-in
// user's own profile.
//
// ==================================================

const updateUserByAdmin = async (
    userId,
    username,
    email,
    role
) => {

    const result = await pool.query(

        `
        UPDATE users

        SET
            username = $1,
            email = $2,
            role = $3

        WHERE user_id = $4

        RETURNING
            user_id,
            username,
            email,
            role,
            created_at
        `,

        [
            username,
            email,
            role,
            userId
        ]

    );

    return result.rows[0];

};


// ==================================================
// UPDATE CURRENT USER
// ==================================================

const updateUser = async (
    userId,
    username,
    email
) => {

    const result = await pool.query(

        `
        UPDATE users

        SET
            username = $1,
            email = $2

        WHERE user_id = $3

        RETURNING
            user_id,
            username,
            email,
            role,
            created_at
        `,

        [
            username,
            email,
            userId
        ]

    );

    return result.rows[0];

};


// ==================================================
// UPDATE PASSWORD
// ==================================================

const updatePassword = async (
    userId,
    password
) => {

    const result = await pool.query(

        `
        UPDATE users

        SET password = $1

        WHERE user_id = $2

        RETURNING
            user_id
        `,

        [
            password,
            userId
        ]

    );

    return result.rows[0];

};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    createUser,

    findUserByEmail,

    findUserById,

    getAllUsers,

    linkDoctorToUser,

    unlinkDoctorFromUser,

    updateUserByAdmin,

    updateUser,

    updatePassword

};