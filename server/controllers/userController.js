const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const doctorModel =
    require("../models/doctorModel");

const userModel = require("../models/userModel");


// ==================================================
// PUBLIC REGISTER USER
// ==================================================

const registerUser = async (req, res, next) => {

    try {

        const {
            username,
            email,
            password
        } = req.body;


        const existingUser =
            await userModel.findUserByEmail(email);


        if (existingUser) {

            return res.status(400).json({

                success: false,

                message:
                    "Email already exists"

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const user =
            await userModel.createUser(
                username,
                email,
                hashedPassword,
                "staff"
            );


        res.status(201).json({

            success: true,

            message:
                "User registered successfully",

            user

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// ADMIN CREATE USER
// ==================================================

// ==================================================
// ADMIN CREATE USER
// ==================================================

const adminCreateUser = async (
    req,
    res,
    next
) => {

    try {

        const {
            username,
            email,
            password,
            role
        } = req.body;


        const existingUser =
            await userModel.findUserByEmail(
                email
            );


        if (existingUser) {

            return res.status(400).json({

                success: false,

                message:
                    "Email already exists"

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const user =
            await userModel.createUser(

                username,

                email,

                hashedPassword,

                role || "staff"

            );


        // ==========================================
        // AUTOMATICALLY LINK USER TO DOCTOR
        // ==========================================

        if (user.role === "doctor") {

            const doctor =
                await userModel.linkDoctorToUser(

                    user.user_id,

                    user.email

                );


            console.log(
                "👨‍⚕️ Doctor linked to user:",
                doctor
            );

        }


        res.status(201).json({

            success: true,

            message:
                "User created successfully",

            user

        });

    } catch (err) {

        next(err);

    }

};
const updateUserByAdmin = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.params.id;

        const {
            username,
            email,
            role
        } = req.body;


        // ==========================================
        // VALIDATE INPUT
        // ==========================================

        if (
            !username ||
            !email ||
            !role
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Username, email and role are required"

            });

        }


        // ==========================================
        // FIND USER
        // ==========================================

        const existingUser =
            await userModel.findUserById(
                userId
            );


        if (!existingUser) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        // ==========================================
        // CHECK EMAIL
        // ==========================================

        const emailOwner =
            await userModel.findUserByEmail(
                email
            );


        if (
            emailOwner &&
            Number(emailOwner.user_id) !==
            Number(userId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email already exists"

            });

        }


        // ==========================================
        // PREVENT ADMIN FROM REMOVING OWN ADMIN ROLE
        // ==========================================

        if (
            Number(req.user.userId) ===
            Number(userId) &&
            existingUser.role === "admin" &&
            role !== "admin"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "You cannot remove your own administrator role."

            });

        }


        // ==========================================
        // UPDATE USER
        // ==========================================

        const user =
            await userModel.updateUserByAdmin(

                userId,

                username.trim(),

                email.trim(),

                role

            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User could not be updated"

            });

        }


        // ==========================================
        // DOCTOR ROLE MANAGEMENT
        // ==========================================

        // ------------------------------------------
        // USER WAS DOCTOR
        // BUT IS NO LONGER DOCTOR
        // ------------------------------------------

        if (
            existingUser.role === "doctor" &&
            role !== "doctor"
        ) {

            await userModel.unlinkDoctorFromUser(
                userId
            );

            console.log(
                "👨‍⚕️ Doctor link removed from user:",
                userId
            );

        }


        // ------------------------------------------
        // USER IS NOW A DOCTOR
        // ------------------------------------------

        if (
            role === "doctor"
        ) {

            const doctor =
                await userModel.linkDoctorToUser(

                    userId,

                    email.trim()

                );


            if (doctor) {

                console.log(
                    "👨‍⚕️ Doctor linked to user:",
                    doctor
                );

            } else {

                console.log(
                    "⚠️ User role changed to doctor, but no doctor profile matched the email:",
                    email
                );

            }

        }


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({

            success: true,

            message:
                "User updated successfully",

            user

        });

    } catch (err) {

        next(err);

    }

};

// ==================================================
// GET ALL USERS
// ==================================================

const getUsers = async (
    req,
    res,
    next
) => {

    try {

        const users =
            await userModel.getAllUsers();


        res.status(200).json({

            success: true,

            users

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// LOGIN USER
// ==================================================

const loginUser = async (
    req,
    res,
    next
) => {

    try {

        const {
            email,
            password
        } = req.body;


        const user =
            await userModel.findUserByEmail(
                email
            );


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        const token =
            jwt.sign(

                {
                    userId:
                        user.user_id,

                    role:
                        user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: process.env.JWT_EXPIRES_IN || "12h"
                }

            );


        res.status(200).json({

            success: true,

            message:
                "Login successful",

            token,

            user: {

                user_id:
                    user.user_id,

                username:
                    user.username,

                email:
                    user.email,

                role:
                    user.role

            }

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// GET CURRENT USER
// ==================================================

const getCurrentUser = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;


        const user =
            await userModel.findUserById(
                userId
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        res.status(200).json({

            success: true,

            user

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// UPDATE CURRENT USER
// ==================================================

const updateCurrentUser = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;


        const {
            username,
            email
        } = req.body;


        if (!username || !email) {

            return res.status(400).json({

                success: false,

                message:
                    "Username and email are required"

            });

        }


        // ==========================================
        // CHECK EMAIL
        // ==========================================

        const existingUser =
            await userModel.findUserByEmail(
                email
            );


        if (
            existingUser &&
            Number(existingUser.user_id) !==
            Number(userId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email already exists"

            });

        }


        // ==========================================
        // UPDATE
        // ==========================================

        const user =
            await userModel.updateUser(
                userId,
                username,
                email
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Profile updated successfully",

            user

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// CHANGE PASSWORD
// ==================================================

const changePassword = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;


        const {
            currentPassword,
            newPassword
        } = req.body;


        if (
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Current password and new password are required"

            });

        }


        if (newPassword.length < 8) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must be at least 8 characters"

            });

        }


        // ==========================================
        // GET USER
        // ==========================================

        const user =
            await userModel.findUserById(
                userId
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        // ==========================================
        // GET PASSWORD FROM DATABASE
        // ==========================================

        const userWithPassword =
            await userModel.findUserByEmail(
                user.email
            );


        const passwordMatch =
            await bcrypt.compare(
                currentPassword,
                userWithPassword.password
            );


        if (!passwordMatch) {

            return res.status(400).json({

                success: false,

                message:
                    "Current password is incorrect"

            });

        }


        // ==========================================
        // HASH NEW PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        await userModel.updatePassword(
            userId,
            hashedPassword
        );


        res.status(200).json({

            success: true,

            message:
                "Password changed successfully"

        });

    } catch (err) {

        next(err);

    }

};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    registerUser,

    adminCreateUser,

    updateUserByAdmin,

    getUsers,

    loginUser,

    getCurrentUser,

    updateCurrentUser,

    changePassword

};