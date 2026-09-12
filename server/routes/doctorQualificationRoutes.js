const express = require("express");

const router = express.Router();


/*
==================================================
MIDDLEWARE
==================================================
*/

const authenticateToken =
    require("../middlewares/authMiddleware");

const authorizeRoles =
    require("../middlewares/roleMiddleware");


/*
==================================================
CONTROLLER
==================================================
*/

const {
    createQualification,
    getDoctorQualifications,
    getQualificationById,
    updateQualification,
    deleteQualification
} = require("../controllers/doctorQualificationController");


/*
==================================================
GET ALL QUALIFICATIONS FOR DOCTOR
==================================================
*/

router.get(
    "/:doctorId/qualifications",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor",
        "receptionist",
        "staff"
    ),
    getDoctorQualifications
);


/*
==================================================
GET SINGLE QUALIFICATION
==================================================
*/

router.get(
    "/:doctorId/qualifications/:qualificationId",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor",
        "receptionist",
        "staff"
    ),
    getQualificationById
);


/*
==================================================
CREATE QUALIFICATION
==================================================
*/

router.post(
    "/:doctorId/qualifications",
    authenticateToken,
    authorizeRoles("admin"),
    createQualification
);


/*
==================================================
UPDATE QUALIFICATION
==================================================
*/

router.put(
    "/:doctorId/qualifications/:qualificationId",
    authenticateToken,
    authorizeRoles("admin"),
    updateQualification
);


/*
==================================================
DELETE QUALIFICATION
==================================================
*/

router.delete(
    "/:doctorId/qualifications/:qualificationId",
    authenticateToken,
    authorizeRoles("admin"),
    deleteQualification
);


module.exports = router;