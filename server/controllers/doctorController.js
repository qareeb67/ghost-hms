const doctorModel =
    require("../models/doctorModel");


/*
==================================================
CREATE DOCTOR
==================================================
*/

const createDoctor = async (
    req,
    res,
    next
) => {

    try {

        const doctor =
            await doctorModel.createDoctor(
                req.body
            );


        return res.status(201).json({

            success: true,

            message:
                "Doctor created successfully",

            doctor

        });

    } catch (err) {

        console.error(
            "❌ CREATE DOCTOR ERROR:",
            err
        );


        if (
            err.code ===
            "DOCTOR_EMAIL_EXISTS"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "A doctor with this email already exists",

                field: "email"

            });

        }


        if (
            err.code ===
            "MDCN_NUMBER_EXISTS"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "A doctor with this MDCN number already exists",

                field: "mdcn_number"

            });

        }


        if (
            err.code === "23505"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "A duplicate doctor record already exists"

            });

        }


        next(err);

    }

};


/*
==================================================
GET ALL DOCTORS
==================================================
*/

const getAllDoctors = async (
    req,
    res,
    next
) => {

    try {

        const doctors =
            await doctorModel.getAllDoctors();


        return res.status(200).json({

            success: true,

            message:
                "Doctors retrieved successfully",

            doctors

        });

    } catch (err) {

        console.error(
            "❌ GET DOCTORS ERROR:",
            err
        );


        next(err);

    }

};


/*
==================================================
GET DOCTOR BY ID
==================================================
*/

const getDoctorById = async (
    req,
    res,
    next
) => {

    try {

        const doctor =
            await doctorModel.getDoctorById(
                req.params.id
            );


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Doctor retrieved successfully",

            doctor

        });

    } catch (err) {

        console.error(
            "❌ GET DOCTOR BY ID ERROR:",
            err
        );


        next(err);

    }

};


/*
==================================================
UPDATE DOCTOR
==================================================
*/

const updateDoctor = async (
    req,
    res,
    next
) => {

    try {

        const { id } =
            req.params;


        const doctor =
            await doctorModel.updateDoctor(
                id,
                req.body
            );


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Doctor updated successfully",

            doctor

        });

    } catch (err) {

        console.error(
            "❌ UPDATE DOCTOR ERROR:",
            err
        );


        if (
            err.code ===
            "DOCTOR_EMAIL_EXISTS"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Another doctor already uses this email",

                field: "email"

            });

        }


        if (
            err.code ===
            "MDCN_NUMBER_EXISTS"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Another doctor already uses this MDCN number",

                field: "mdcn_number"

            });

        }


        if (
            err.code === "23505"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "A duplicate doctor record already exists"

            });

        }


        next(err);

    }

};


/*
==================================================
DELETE DOCTOR
==================================================
*/

const deleteDoctor = async (
    req,
    res,
    next
) => {

    try {

        const doctor =
            await doctorModel.deleteDoctor(
                req.params.id
            );


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Doctor deleted successfully",

            doctor

        });

    } catch (err) {

        console.error(
            "❌ DELETE DOCTOR ERROR:",
            err
        );


        if (
            err.code === "23503"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Doctor cannot be deleted because they are referenced by existing records"

            });

        }


        next(err);

    }

};


/*
==================================================
SEARCH DOCTORS
==================================================
*/

const searchDoctors = async (
    req,
    res,
    next
) => {

    try {

        const { q } =
            req.query;


        if (
            !q ||
            !q.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Search query is required"

            });

        }


        const doctors =
            await doctorModel.searchDoctors(
                q.trim()
            );


        return res.status(200).json({

            success: true,

            message:
                "Doctors retrieved successfully",

            doctors

        });

    } catch (err) {

        console.error(
            "❌ SEARCH DOCTORS ERROR:",
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

    createDoctor,

    getAllDoctors,

    getDoctorById,

    updateDoctor,

    deleteDoctor,

    searchDoctors

};