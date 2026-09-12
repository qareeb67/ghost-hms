const doctorQualificationModel =
    require("../models/doctorQualificationModel");


/*
==================================================
CREATE DOCTOR QUALIFICATION
==================================================
*/

const createQualification = async (
    req,
    res,
    next
) => {

    try {

        const {
            doctorId
        } = req.params;


        const qualification =
            await doctorQualificationModel.createQualification(
                doctorId,
                req.body
            );


        return res.status(201).json({

            success: true,

            message:
                "Doctor qualification created successfully",

            qualification

        });

    } catch (err) {

        console.error(
            "❌ CREATE DOCTOR QUALIFICATION ERROR:",
            err
        );


        if (err.code === "23503") {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found"

            });

        }


        next(err);

    }

};


/*
==================================================
GET ALL DOCTOR QUALIFICATIONS
==================================================
*/

const getDoctorQualifications = async (
    req,
    res,
    next
) => {

    try {

        const {
            doctorId
        } = req.params;


        const qualifications =
            await doctorQualificationModel
                .getDoctorQualifications(
                    doctorId
                );


        return res.status(200).json({

            success: true,

            message:
                "Doctor qualifications retrieved successfully",

            qualifications

        });

    } catch (err) {

        console.error(
            "❌ GET DOCTOR QUALIFICATIONS ERROR:",
            err
        );


        next(err);

    }

};


/*
==================================================
GET SINGLE DOCTOR QUALIFICATION
==================================================
*/

const getQualificationById = async (
    req,
    res,
    next
) => {

    try {

        const {
            doctorId,
            qualificationId
        } = req.params;


        const qualification =
            await doctorQualificationModel
                .getQualificationById(
                    doctorId,
                    qualificationId
                );


        if (!qualification) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor qualification not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Doctor qualification retrieved successfully",

            qualification

        });

    } catch (err) {

        console.error(
            "❌ GET DOCTOR QUALIFICATION ERROR:",
            err
        );


        next(err);

    }

};


/*
==================================================
UPDATE DOCTOR QUALIFICATION
==================================================
*/

const updateQualification = async (
    req,
    res,
    next
) => {

    try {

        const {
            doctorId,
            qualificationId
        } = req.params;


        const qualification =
            await doctorQualificationModel
                .updateQualification(
                    doctorId,
                    qualificationId,
                    req.body
                );


        if (!qualification) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor qualification not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Doctor qualification updated successfully",

            qualification

        });

    } catch (err) {

        console.error(
            "❌ UPDATE DOCTOR QUALIFICATION ERROR:",
            err
        );


        next(err);

    }

};


/*
==================================================
DELETE DOCTOR QUALIFICATION
==================================================
*/

const deleteQualification = async (
    req,
    res,
    next
) => {

    try {

        const {
            doctorId,
            qualificationId
        } = req.params;


        const qualification =
            await doctorQualificationModel
                .deleteQualification(
                    doctorId,
                    qualificationId
                );


        if (!qualification) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor qualification not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Doctor qualification deleted successfully",

            qualification

        });

    } catch (err) {

        console.error(
            "❌ DELETE DOCTOR QUALIFICATION ERROR:",
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

    createQualification,

    getDoctorQualifications,

    getQualificationById,

    updateQualification,

    deleteQualification

};