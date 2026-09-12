const express = require("express");

const router = express.Router();

const {
    validateUser,
    validateAdminUserUpdate,
    validateProfileUpdate,
    validatePasswordChange,
    validateLogin
} = require("../middlewares/userValidation");

const authenticateToken =
    require("../middlewares/authMiddleware");

const authorizeRoles =
    require("../middlewares/roleMiddleware");

const {
    authRateLimiter,
    registerRateLimiter
} = require("../middlewares/security");


const {

    registerUser,

    adminCreateUser,

    updateUserByAdmin,

    getUsers,

    loginUser,

    getCurrentUser,

    updateCurrentUser,

    changePassword

} = require("../controllers/userController");


// ==================================================
// PUBLIC REGISTRATION
// ==================================================

router.post(
    "/register",
    registerRateLimiter,
    validateUser,
    registerUser
);


// ==================================================
// LOGIN
// ==================================================

router.post(
    "/login",
    authRateLimiter,
    validateLogin,
    loginUser
);


// ==================================================
// CURRENT USER
// ==================================================

// GET /users/me

router.get(
    "/me",
    authenticateToken,
    getCurrentUser
);


// ==================================================
// UPDATE CURRENT USER
// ==================================================

// PUT /users/me

router.put(
    "/me",
    authenticateToken,
    validateProfileUpdate,
    updateCurrentUser
);


// ==================================================
// CHANGE CURRENT USER PASSWORD
// ==================================================

// PUT /users/me/password

router.put(
    "/me/password",
    authenticateToken,
    validatePasswordChange,
    changePassword
);


// ==================================================
// GET ALL USERS
// ADMIN ONLY
// ==================================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    getUsers
);
router.put(

    "/:id",

    authenticateToken,

    authorizeRoles("admin"),

    validateAdminUserUpdate,

    updateUserByAdmin

);

// ==================================================
// ADMIN CREATE USER
// ADMIN ONLY
// ==================================================

router.post(
    "/admin-create",
    authenticateToken,
    authorizeRoles("admin"),
    validateUser,
    adminCreateUser
);


module.exports = router;