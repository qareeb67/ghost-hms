const departmentModel =
    require("../models/departmentModel");


/*
==================================================
GET ALL DEPARTMENTS
==================================================
*/

const getAllDepartments = async (
    req,
    res,
    next
) => {

    try {

        const departments =
            await departmentModel.getAllDepartments();


        return res.status(200).json({

            success: true,

            message:
                "Departments retrieved successfully",

            departments

        });

    } catch (err) {

        console.error(
            "❌ GET DEPARTMENTS ERROR:",
            err
        );


        next(err);

    }

};


/*
==================================================
GET ACTIVE DEPARTMENTS
==================================================
*/

const getActiveDepartments = async (
    req,
    res,
    next
) => {

    try {

        const departments =
            await departmentModel.getActiveDepartments();


        return res.status(200).json({

            success: true,

            message:
                "Active departments retrieved successfully",

            departments

        });

    } catch (err) {

        console.error(
            "❌ GET ACTIVE DEPARTMENTS ERROR:",
            err
        );


        next(err);

    }

};


/*
==================================================
GET DEPARTMENT BY ID
==================================================
*/

const getDepartmentById = async (
    req,
    res,
    next
) => {

    try {

        const department =
            await departmentModel.getDepartmentById(
                req.params.id
            );


        if (!department) {

            return res.status(404).json({

                success: false,

                message:
                    "Department not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Department retrieved successfully",

            department

        });

    } catch (err) {

        console.error(
            "❌ GET DEPARTMENT BY ID ERROR:",
            err
        );


        next(err);

    }

};


/*
==================================================
EXPORTS
==================================================
*/

module.exports = {

    getAllDepartments,

    getActiveDepartments,

    getDepartmentById

};