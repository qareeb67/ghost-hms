const emergencyModel =
    require("../models/emergencyModel");

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
            SELECT user_id

            FROM doctors

            WHERE doctor_id = $1;
            `,
            [doctorId]
        );

    return result.rows[0]?.user_id || null;
};


// ==================================================
// HELPER
// GET PATIENT DISPLAY NAME
// ==================================================

const getEmergencyPatientName = (
    emergency
) => {

    if (emergency?.patient_name) {
        return emergency.patient_name;
    }

    if (emergency?.temporary_name) {
        return emergency.temporary_name;
    }

    return "Unknown Patient";
};


// ==================================================
// HELPER
// SEND NOTIFICATION SAFELY
// ==================================================

const sendEmergencyNotification = async (
    doctorId,
    title,
    message
) => {

    try {

        const doctorUserId =
            await getDoctorUserId(
                doctorId
            );

        if (!doctorUserId) {
            return;
        }

        await notificationModel.createNotification(
            doctorUserId,
            "emergency",
            title,
            message
        );

    } catch (error) {

        // Notification failure must NEVER
        // break the emergency operation.

        console.error(
            "⚠️ Emergency notification failed:",
            error.message
        );
    }
};


// ==================================================
// CREATE EMERGENCY CASE
// ==================================================

const createEmergencyCase = async (
    req,
    res,
    next
) => {

    try {

        const {
            patient_id,
            temporary_name,
            triage_level,
            assigned_doctor,
            status,
            emergency_notes
        } = req.body;


        const emergency =
            await emergencyModel.createEmergencyCase(

                patient_id,

                temporary_name,

                triage_level,

                assigned_doctor,

                status,

                emergency_notes

            );


        // ------------------------------------------
        // NOTIFY ASSIGNED DOCTOR
        // ------------------------------------------

        if (assigned_doctor) {

            const patientName =
                getEmergencyPatientName(
                    emergency
                );

            await sendEmergencyNotification(

                assigned_doctor,

                "Emergency Case Assigned",

                `You have been assigned an emergency case for ${patientName}. Triage level: ${triage_level}.`

            );
        }


        res.status(201).json({

            success: true,

            message:
                "Emergency case created successfully",

            emergency

        });

    } catch (err) {

        next(err);

    }
};


// ==================================================
// GET ALL EMERGENCY CASES
// ==================================================

const getAllEmergencyCases = async (
    req,
    res,
    next
) => {

    try {

        const emergencies =
            await emergencyModel
                .getAllEmergencyCases();


        res.status(200).json({

            success: true,

            message:
                "Emergency cases retrieved successfully",

            emergencies

        });

    } catch (err) {

        next(err);

    }
};


// ==================================================
// GET EMERGENCY CASE BY ID
// ==================================================

const getEmergencyCaseById = async (
    req,
    res,
    next
) => {

    try {

        const { id } =
            req.params;


        const emergency =
            await emergencyModel
                .getEmergencyCaseById(
                    id
                );


        if (!emergency) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency case not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Emergency case retrieved successfully",

            emergency

        });

    } catch (err) {

        next(err);

    }
};


// ==================================================
// UPDATE EMERGENCY CASE
// ==================================================

const updateEmergencyCase = async (
    req,
    res,
    next
) => {

    try {

        const { id } =
            req.params;


        // ------------------------------------------
        // GET CURRENT CASE
        // ------------------------------------------

        const existingEmergency =
            await emergencyModel
                .getEmergencyCaseById(
                    id
                );


        if (!existingEmergency) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency case not found"

            });

        }


        // ------------------------------------------
        // MERGE EXISTING DATA WITH PATCH DATA
        // ------------------------------------------

        const patient_id =
            req.body.patient_id !== undefined
                ? req.body.patient_id
                : existingEmergency.patient_id;


        const temporary_name =
            req.body.temporary_name !== undefined
                ? req.body.temporary_name
                : existingEmergency.temporary_name;


        const triage_level =
            req.body.triage_level !== undefined
                ? req.body.triage_level
                : existingEmergency.triage_level;


        const assigned_doctor =
            req.body.assigned_doctor !== undefined
                ? req.body.assigned_doctor
                : existingEmergency.assigned_doctor;


        const status =
            req.body.status !== undefined
                ? req.body.status
                : existingEmergency.status;


        const emergency_notes =
            req.body.emergency_notes !== undefined
                ? req.body.emergency_notes
                : existingEmergency.emergency_notes;


        // ------------------------------------------
        // REGISTERED / TEMPORARY PATIENT RULE
        // ------------------------------------------

        const finalPatient =
            patient_id !== undefined &&
            patient_id !== null &&
            patient_id !== "";


        const finalTemporaryName =
            typeof temporary_name === "string" &&
            temporary_name.trim() !== "";


        if (
            !finalPatient &&
            !finalTemporaryName
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Either an existing patient or a temporary patient name is required"

            });

        }


        if (
            finalPatient &&
            finalTemporaryName
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Use either a registered patient or a temporary patient, not both"

            });

        }


        // ------------------------------------------
        // UPDATE
        // ------------------------------------------

        const emergency =
            await emergencyModel
                .updateEmergencyCase(

                    id,

                    patient_id,

                    temporary_name,

                    triage_level,

                    assigned_doctor,

                    status,

                    emergency_notes

                );


        if (!emergency) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency case could not be updated"

            });

        }


        // ------------------------------------------
        // DOCTOR ASSIGNMENT CHANGED
        // ------------------------------------------

        const previousDoctor =
            existingEmergency.assigned_doctor
                ? Number(existingEmergency.assigned_doctor)
                : null;

        const newDoctor =
            emergency.assigned_doctor
                ? Number(emergency.assigned_doctor)
                : null;


        if (
            previousDoctor !== newDoctor &&
            newDoctor
        ) {

            const patientName =
                getEmergencyPatientName(
                    emergency
                );

            await sendEmergencyNotification(

                newDoctor,

                "Emergency Case Assigned",

                `You have been assigned an emergency case for ${patientName}. Triage level: ${emergency.triage_level}.`

            );
        }


        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        res.status(200).json({

            success: true,

            message:
                "Emergency case updated successfully",

            emergency

        });

    } catch (err) {

        next(err);

    }
};


// ==================================================
// UPDATE EMERGENCY STATUS
// ==================================================

const updateEmergencyStatus = async (
    req,
    res,
    next
) => {

    try {

        const { id } =
            req.params;

        const { status } =
            req.body;


        // ------------------------------------------
        // GET CURRENT CASE
        // ------------------------------------------

        const existingEmergency =
            await emergencyModel
                .getEmergencyCaseById(
                    id
                );


        if (!existingEmergency) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency case not found"

            });

        }


        // ------------------------------------------
        // DO NOT RE-NOTIFY IF NOTHING CHANGED
        // ------------------------------------------

        if (
            existingEmergency.status === status
        ) {

            return res.status(200).json({

                success: true,

                message:
                    "Emergency status is already set to this value",

                emergency:
                    existingEmergency

            });

        }


        // ------------------------------------------
        // UPDATE STATUS
        // ------------------------------------------

        const emergency =
            await emergencyModel
                .updateEmergencyStatus(

                    id,

                    status

                );


        if (!emergency) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency case could not be updated"

            });

        }


        // ------------------------------------------
        // NOTIFY ASSIGNED DOCTOR
        // ------------------------------------------

        if (
            emergency.assigned_doctor
        ) {

            const patientName =
                getEmergencyPatientName(
                    emergency
                );

            await sendEmergencyNotification(

                emergency.assigned_doctor,

                "Emergency Status Updated",

                `Emergency case for ${patientName} is now marked as ${status}.`

            );
        }


        res.status(200).json({

            success: true,

            message:
                "Emergency status updated successfully",

            emergency

        });

    } catch (err) {

        next(err);

    }
};


// ==================================================
// ASSIGN EMERGENCY DOCTOR
// ==================================================

const assignEmergencyDoctor = async (
    req,
    res,
    next
) => {

    try {

        const { id } =
            req.params;

        const {
            assigned_doctor
        } = req.body;


        // ------------------------------------------
        // GET CURRENT CASE
        // ------------------------------------------

        const existingEmergency =
            await emergencyModel
                .getEmergencyCaseById(
                    id
                );


        if (!existingEmergency) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency case not found"

            });

        }


        const previousDoctor =
            existingEmergency.assigned_doctor
                ? Number(existingEmergency.assigned_doctor)
                : null;

        const newDoctor =
            assigned_doctor
                ? Number(assigned_doctor)
                : null;


        // ------------------------------------------
        // NO CHANGE
        // ------------------------------------------

        if (
            previousDoctor === newDoctor
        ) {

            return res.status(200).json({

                success: true,

                message:
                    newDoctor
                        ? "Emergency case is already assigned to this doctor"
                        : "Emergency case is already unassigned",

                emergency:
                    existingEmergency

            });

        }


        // ------------------------------------------
        // ASSIGN / UNASSIGN
        // ------------------------------------------

        const emergency =
            await emergencyModel
                .assignEmergencyDoctor(

                    id,

                    newDoctor

                );


        if (!emergency) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency doctor assignment failed"

            });

        }


        // ------------------------------------------
        // NOTIFY NEW DOCTOR
        // ------------------------------------------

        if (newDoctor) {

            const patientName =
                getEmergencyPatientName(
                    emergency
                );

            await sendEmergencyNotification(

                newDoctor,

                "Emergency Case Assigned",

                `You have been assigned an emergency case for ${patientName}. Triage level: ${emergency.triage_level}.`

            );
        }


        res.status(200).json({

            success: true,

            message:
                newDoctor
                    ? "Emergency doctor assigned successfully"
                    : "Emergency doctor unassigned successfully",

            emergency

        });

    } catch (err) {

        next(err);

    }
};


// ==================================================
// DELETE EMERGENCY CASE
// ==================================================

const deleteEmergencyCase = async (
    req,
    res,
    next
) => {

    try {

        const { id } =
            req.params;


        const emergency =
            await emergencyModel
                .deleteEmergencyCase(
                    id
                );


        if (!emergency) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency case not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Emergency case deleted successfully",

            emergency

        });

    } catch (err) {

        next(err);

    }
};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    createEmergencyCase,

    getAllEmergencyCases,

    getEmergencyCaseById,

    updateEmergencyCase,

    updateEmergencyStatus,

    assignEmergencyDoctor,

    deleteEmergencyCase

};