const pool = require("../config/db");

// Create User
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
        VALUES ($1,$2,$3,$4)
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

// Find User by Email
const findUserByEmail = async (email) => {

    const result = await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
    );

    return result.rows[0];

};

module.exports = {
    createUser,
    findUserByEmail
};