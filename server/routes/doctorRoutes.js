const express = require("express");

const router = express.Router();

const validateDoctor =
    require("../middlewares/doctorValidation");

const authenticateToken =
    require("../middlewares/authMiddleware");

const authorizeRoles =
    require("../middlewares/roleMiddleware");

const {
    createDoctor,
    getAllDoctors,
    searchDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
} = require("../controllers/doctorController");


/*
==================================================
GET ALL DOCTORS
==================================================
*/

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor",
        "receptionist",
        "staff"
    ),
    getAllDoctors
);


/*
==================================================
SEARCH DOCTORS
==================================================

IMPORTANT:

This route MUST come before /:id.

Otherwise Express may interpret "search"
as an ID.

==================================================
*/

router.get(
    "/search",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor",
        "receptionist",
        "staff"
    ),
    searchDoctors
);


/*
==================================================
GET DOCTOR BY ID
==================================================
*/

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor",
        "receptionist",
        "staff"
    ),
    getDoctorById
);


/*
==================================================
CREATE DOCTOR
==================================================
*/

router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    validateDoctor,
    createDoctor
);


/*
==================================================
UPDATE DOCTOR
==================================================

IMPORTANT:

We use PUT.

Frontend syncEngine MUST also use PUT.

==================================================
*/

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    validateDoctor,
    updateDoctor
);


/*
==================================================
DELETE DOCTOR
==================================================
*/

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteDoctor
);


module.exports = router;