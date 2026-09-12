const {
    body,
    param
} = require("express-validator");

const validateRequest =
    require("./validateRequest");


// ==================================================
// CONSTANTS
// ==================================================

const TRIAGE_LEVELS = [
    "Critical",
    "High",
    "Medium",
    "Low"
];

const EMERGENCY_STATUSES = [
    "Waiting",
    "In Treatment",
    "Completed"
];


// ==================================================
// CREATE EMERGENCY
// ==================================================

const validateCreateEmergency = [

    body("patient_id")
        .optional({ values: "falsy" })
        .isInt({ min: 1 })
        .withMessage(
            "Patient ID must be a valid integer"
        ),

    body("temporary_name")
        .optional({ values: "falsy" })
        .trim()
        .isLength({
            min: 2,
            max: 100
        })
        .withMessage(
            "Temporary name must be between 2 and 100 characters"
        ),

    body("triage_level")
        .notEmpty()
        .withMessage(
            "Triage level is required"
        )
        .isIn(TRIAGE_LEVELS)
        .withMessage(
            "Invalid triage level"
        ),

    body("assigned_doctor")
        .optional({ values: "falsy" })
        .isInt({ min: 1 })
        .withMessage(
            "Assigned doctor ID must be a valid integer"
        ),

    body("status")
        .optional()
        .isIn(EMERGENCY_STATUSES)
        .withMessage(
            "Invalid emergency status"
        ),

    body("emergency_notes")
        .optional({ values: "falsy" })
        .isString()
        .trim()
        .isLength({
            max: 5000
        })
        .withMessage(
            "Emergency notes must not exceed 5000 characters"
        ),

    body().custom((data) => {

        const hasPatient =
            data.patient_id !== undefined &&
            data.patient_id !== null &&
            data.patient_id !== "";

        const hasTemporaryName =
            typeof data.temporary_name === "string" &&
            data.temporary_name.trim() !== "";


        if (
            !hasPatient &&
            !hasTemporaryName
        ) {

            throw new Error(
                "Either an existing patient or a temporary patient name is required"
            );
        }


        if (
            hasPatient &&
            hasTemporaryName
        ) {

            throw new Error(
                "Use either a registered patient or a temporary patient, not both"
            );
        }


        return true;

    }),

    validateRequest
];


// ==================================================
// UPDATE EMERGENCY
// ==================================================

const validateUpdateEmergency = [

    param("id")
        .isInt({ min: 1 })
        .withMessage(
            "Emergency ID must be a valid integer"
        ),

    body("patient_id")
        .optional({ values: "falsy" })
        .isInt({ min: 1 })
        .withMessage(
            "Patient ID must be a valid integer"
        ),

    body("temporary_name")
        .optional({ values: "falsy" })
        .trim()
        .isLength({
            min: 2,
            max: 100
        })
        .withMessage(
            "Temporary name must be between 2 and 100 characters"
        ),

    body("triage_level")
        .optional()
        .isIn(TRIAGE_LEVELS)
        .withMessage(
            "Invalid triage level"
        ),

    body("assigned_doctor")
        .optional({ values: "falsy" })
        .isInt({ min: 1 })
        .withMessage(
            "Assigned doctor ID must be a valid integer"
        ),

    body("status")
        .optional()
        .isIn(EMERGENCY_STATUSES)
        .withMessage(
            "Invalid emergency status"
        ),

    body("emergency_notes")
        .optional({ values: "falsy" })
        .isString()
        .trim()
        .isLength({
            max: 5000
        })
        .withMessage(
            "Emergency notes must not exceed 5000 characters"
        ),

    body().custom((data) => {

        const allowedFields = [
            "patient_id",
            "temporary_name",
            "triage_level",
            "assigned_doctor",
            "status",
            "emergency_notes"
        ];

        const hasField =
            allowedFields.some(
                field =>
                    Object.prototype.hasOwnProperty.call(
                        data,
                        field
                    )
            );


        if (!hasField) {

            throw new Error(
                "At least one emergency field must be provided for update"
            );

        }


        return true;

    }),

    validateRequest
];


// ==================================================
// UPDATE STATUS
// ==================================================

const validateEmergencyStatus = [

    param("id")
        .isInt({ min: 1 })
        .withMessage(
            "Emergency ID must be a valid integer"
        ),

    body("status")
        .notEmpty()
        .withMessage(
            "Emergency status is required"
        )
        .isIn(EMERGENCY_STATUSES)
        .withMessage(
            "Invalid emergency status"
        ),

    validateRequest
];


// ==================================================
// ASSIGN DOCTOR
// ==================================================

const validateEmergencyDoctor = [

    param("id")
        .isInt({ min: 1 })
        .withMessage(
            "Emergency ID must be a valid integer"
        ),

    body("assigned_doctor")
        .optional({ values: "falsy" })
        .isInt({ min: 1 })
        .withMessage(
            "Assigned doctor ID must be a valid integer"
        ),

    validateRequest
];


// ==================================================
// EMERGENCY ID
// ==================================================

const validateEmergencyId = [

    param("id")
        .isInt({ min: 1 })
        .withMessage(
            "Emergency ID must be a valid integer"
        ),

    validateRequest
];


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    validateCreateEmergency,

    validateUpdateEmergency,

    validateEmergencyStatus,

    validateEmergencyDoctor,

    validateEmergencyId

};