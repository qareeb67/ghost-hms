const express = require("express");

const router =
    express.Router();


const authenticateToken =
    require("../middlewares/authMiddleware");

const authorizeRoles =
    require("../middlewares/roleMiddleware");

const departmentController =
    require("../controllers/departntController");


/*
==================================================
DEPARTMENT ROUTES
==================================================
*/


/*
GET ALL DEPARTMENTS
GET /departments
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
    departmentController.getAllDepartments
);


/*
GET ACTIVE DEPARTMENTS
GET /departments/active
*/

router.get(
    "/active",
    authenticateToken,
    authorizeRoles(
        "admin",
        "doctor",
        "receptionist",
        "staff"
    ),
    departmentController.getActiveDepartments
);


/*
GET DEPARTMENT BY ID
GET /departments/:id
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
    departmentController.getDepartmentById
);


module.exports = router;