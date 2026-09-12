require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../config/db");


const createAdmin = async () => {

    try {

        // ==========================================
        // ADMIN DETAILS
        // ==========================================

        const username = "Qareeb";

        const email = "karibsadii@gmail.com";

        const password = "Qareebsadi6787";


        // ==========================================
        // CHECK EXISTING ADMIN
        // ==========================================

        const existingAdmin = await pool.query(
            `
            SELECT user_id
            FROM users
            WHERE role = 'admin'
            LIMIT 1
            `
        );


        if (existingAdmin.rows.length > 0) {

            console.log(
                "⚠️ An admin account already exists."
            );

            return;

        }


        // ==========================================
        // CHECK EMAIL
        // ==========================================

        const existingUser = await pool.query(
            `
            SELECT user_id
            FROM users
            WHERE email = $1
            `,
            [email]
        );


        if (existingUser.rows.length > 0) {

            console.log(
                "⚠️ This email already exists."
            );

            return;

        }


        // ==========================================
        // HASH PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ==========================================
        // CREATE ADMIN
        // ==========================================

        const result = await pool.query(
            `
            INSERT INTO users
            (
                username,
                email,
                password,
                role
            )
            VALUES
            ($1, $2, $3, $4)
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
                hashedPassword,
                "admin"
            ]
        );


        console.log(
            "\n=========================================="
        );

        console.log(
            "🔥 HOSPITAL MANAGEMENT SYSTEM ADMIN CREATED"
        );

        console.log(
            "=========================================="
        );

        console.log(
            "User ID:",
            result.rows[0].user_id
        );

        console.log(
            "Username:",
            result.rows[0].username
        );

        console.log(
            "Email:",
            result.rows[0].email
        );

        console.log(
            "Role:",
            result.rows[0].role
        );

        console.log(
            "=========================================="
        );

        console.log(
            "⚠️ Change the temporary password after login."
        );

        console.log(
            "==========================================\n"
        );


    } catch (error) {

        console.error(
            "❌ Failed to create admin:",
            error
        );

    } finally {

        await pool.end();

    }

};


createAdmin();