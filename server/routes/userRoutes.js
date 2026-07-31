const express = require("express");
const router = express.Router();
const validateUser = require("../middlewares/userValidation");
const {
    registerUser,
    loginUser
} = require("../controllers/userController");

const authorizeRoles = require("../middlewares/roleMiddleware");
// Register User
router.post("/register", validateUser, registerUser);

// Login User
router.post("/login", loginUser);

module.exports = router;