
const laboratoryModel =
    require("../models/laboratoryModel");

const notificationModel =
    require("../models/notificationModel");

const pool =
    require("../config/db");


// ==================================================
// HELPER
// GET DOCTOR USER ID
// ==================================================

const getDoctorUserId = async (
    doctorId
) => {

    if (!doctorId) {
        return null;
    }


    const result =
        await pool.query(
            `
            SELECT
                doctor_id,
                user_id,
                first_name,
                last_name

            FROM doctors

            WHERE doctor_id = $1
            `,
            [doctorId]
        );


    return result.rows[0]?.user_id || null;

};


// ==================================================
// HELPER
// GET LABORATORY PATIENT NAME
// ==================================================

const getLaboratoryPatientName = (
    laboratoryTest
) => {

    if (
        laboratoryTest &&
        laboratoryTest.patient_name
    ) {

        return laboratoryTest.patient_name;

    }


    return "Unknown Patient";

};


// ==================================================
// CREATE LABORATORY TEST
// ==================================================

const createLaboratoryTest = async (
    req,
    res,
    next
) => {

    try {

        const {
            patient_id,
            doctor_id,
            test_name
        } = req.body;


        if (
            !patient_id ||
            !doctor_id ||
            !test_name ||
            !test_name.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Patient, doctor and test name are required"

            });

        }


        const laboratoryTest =
            await laboratoryModel
                .createLaboratoryTest(

                    patient_id,

                    doctor_id,

                    test_name.trim()

                );


        /*
        ==================================================
        OPTIONAL LAB NOTIFICATION

        We intentionally do NOT send a notification here
        because Hospital Management System currently has no dedicated
        laboratory user/recipient relationship.

        The test itself is successfully created and can
        be retrieved by the laboratory workflow.
        ==================================================
        */


        return res.status(201).json({

            success: true,

            message:
                "Laboratory test requested successfully",

            laboratoryTest

        });

    } catch (err) {

        console.error(
            "❌ CREATE LABORATORY TEST ERROR:",
            err
        );

        next(err);

    }

};


// ==================================================
// GET ALL LABORATORY TESTS
// ==================================================

const getAllLaboratoryTests = async (
    req,
    res,
    next
) => {

    try {

        const laboratoryTests =
            await laboratoryModel
                .getAllLaboratoryTests();


        return res.status(200).json({

            success: true,

            message:
                "Laboratory tests retrieved successfully",

            laboratoryTests

        });

    } catch (err) {

        console.error(
            "❌ GET LABORATORY TESTS ERROR:",
            err
        );

        next(err);

    }

};


// ==================================================
// GET LABORATORY TEST BY ID
// ==================================================

const getLaboratoryTestById = async (
    req,
    res,
    next
) => {

    try {

        const { id } =
            req.params;


        const laboratoryTest =
            await laboratoryModel
                .getLaboratoryTestById(
                    id
                );


        if (!laboratoryTest) {

            return res.status(404).json({

                success: false,

                message:
                    "Laboratory test not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Laboratory test retrieved successfully",

            laboratoryTest

        });

    } catch (err) {

        console.error(
            "❌ GET LABORATORY TEST ERROR:",
            err
        );

        next(err);

    }

};


// ==================================================
// UPDATE LABORATORY TEST
// ==================================================

const updateLaboratoryTest = async (
    req,
    res,
    next
) => {

    try {

        const { id } =
            req.params;


        const {
            patient_id,
            doctor_id,
            test_name,
            status,
            result
        } = req.body;


        const laboratoryTest =
            await laboratoryModel
                .updateLaboratoryTest(

                    id,

                    patient_id,

                    doctor_id,

                    test_name
                        ? test_name.trim()
                        : null,

                    status,

                    result

                );


        if (!laboratoryTest) {

            return res.status(404).json({

                success: false,

                message:
                    "Laboratory test not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Laboratory test updated successfully",

            laboratoryTest

        });

    } catch (err) {

        console.error(
            "❌ UPDATE LABORATORY TEST ERROR:",
            err
        );

        next(err);

    }

};


// ==================================================
// COMPLETE LABORATORY TEST
// ==================================================

const completeLaboratoryTest = async (
    req,
    res,
    next
) => {

    try {

        const { id } =
            req.params;


        const { result } =
            req.body;


        if (
            result === undefined ||
            result === null ||
            !String(result).trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Laboratory result is required"

            });

        }


        /*
        ==================================================
        GET CURRENT TEST BEFORE COMPLETING

        We need the doctor_id so we know exactly which
        doctor should receive the notification.
        ==================================================
        */

        const existingLaboratoryTest =
            await laboratoryModel
                .getLaboratoryTestById(
                    id
                );


        if (!existingLaboratoryTest) {

            return res.status(404).json({

                success: false,

                message:
                    "Laboratory test not found"

            });

        }


        /*
        ==================================================
        COMPLETE TEST
        ==================================================
        */

        const laboratoryTest =
            await laboratoryModel
                .completeLaboratoryTest(

                    id,

                    String(result).trim()

                );


        if (!laboratoryTest) {

            return res.status(404).json({

                success: false,

                message:
                    "Laboratory test not found"

            });

        }


        /*
        ==================================================
        GET REQUESTING DOCTOR USER ID
        ==================================================
        */

        const doctorUserId =
            await getDoctorUserId(
                existingLaboratoryTest.doctor_id
            );


        /*
        ==================================================
        NOTIFY REQUESTING DOCTOR
        ==================================================
        */

        if (doctorUserId) {

            const patientName =
                getLaboratoryPatientName(
                    existingLaboratoryTest
                );


            await notificationModel
                .createNotification(

                    doctorUserId,

                    "laboratory",

                    "Laboratory Result Ready",

                    `The laboratory result for ${patientName}'s ${existingLaboratoryTest.test_name} is now available.`

                );

        }


        return res.status(200).json({

            success: true,

            message:
                "Laboratory test completed successfully",

            laboratoryTest

        });

    } catch (err) {

        console.error(
            "❌ COMPLETE LABORATORY TEST ERROR:",
            err
        );

        next(err);

    }

};


// ==================================================
// DELETE LABORATORY TEST
// ==================================================

const deleteLaboratoryTest = async (
    req,
    res,
    next
) => {

    try {

        const { id } =
            req.params;


        const laboratoryTest =
            await laboratoryModel
                .deleteLaboratoryTest(
                    id
                );


        if (!laboratoryTest) {

            return res.status(404).json({

                success: false,

                message:
                    "Laboratory test not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Laboratory test deleted successfully",

            laboratoryTest

        });

    } catch (err) {

        console.error(
            "❌ DELETE LABORATORY TEST ERROR:",
            err
        );

        next(err);

    }

};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    createLaboratoryTest,

    getAllLaboratoryTests,

    getLaboratoryTestById,

    updateLaboratoryTest,

    completeLaboratoryTest,

    deleteLaboratoryTest

};

