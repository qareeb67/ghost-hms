const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

// Register User
const registerUser = async (req, res, next) => {

    try {

        const {
            username,
            email,
            password,
            role
        } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        const user = await userModel.createUser(
            username,
            email,
            hashedPassword,
            role
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user
        });

    } catch (err) {

        next(err);

    }

};

const jwt = require("jsonwebtoken");

// Login User
const loginUser = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        // Find user
        const user = await userModel.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    registerUser,
    loginUser
};