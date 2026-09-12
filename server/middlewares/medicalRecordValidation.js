const { body } = require("express-validator");

const validateRequest =
    require("./validateRequest");


/*
==================================================
MEDICAL RECORD VALIDATION
==================================================
*/

const validateMedicalRecord = [

    /*
    --------------------------------------------------
    PATIENT / DOCTOR
    --------------------------------------------------
    */

    body("patient_id")
        .isInt({ min: 1 })
        .withMessage(
            "Valid patient ID is required"
        ),

    body("doctor_id")
        .isInt({ min: 1 })
        .withMessage(
            "Valid doctor ID is required"
        ),


    /*
    --------------------------------------------------
    CHIEF COMPLAINT
    --------------------------------------------------
    */

    body("chief_complaint")
        .optional({ nullable: true })
        .isString()
        .withMessage(
            "Chief complaint must be text"
        )
        .trim()
        .isLength({ max: 1000 })
        .withMessage(
            "Chief complaint is too long"
        ),


    /*
    --------------------------------------------------
    SYMPTOMS
    --------------------------------------------------
    */

    body("symptoms")
        .optional({ nullable: true })
        .isString()
        .withMessage(
            "Symptoms must be text"
        )
        .trim()
        .isLength({ max: 5000 })
        .withMessage(
            "Symptoms are too long"
        ),


    /*
    --------------------------------------------------
    HISTORY OF PRESENT ILLNESS
    --------------------------------------------------
    */

    body("history_of_present_illness")
        .optional({ nullable: true })
        .isString()
        .withMessage(
            "History of present illness must be text"
        )
        .trim()
        .isLength({ max: 10000 })
        .withMessage(
            "History of present illness is too long"
        ),


    /*
    --------------------------------------------------
    BLOOD PRESSURE
    --------------------------------------------------
    */

    body("blood_pressure")
        .optional({ nullable: true })
        .isString()
        .withMessage(
            "Blood pressure must be text"
        )
        .trim()
        .matches(/^\d{2,3}\/\d{2,3}$/)
        .withMessage(
            "Blood pressure must use format like 120/80"
        ),


    /*
    --------------------------------------------------
    TEMPERATURE
    --------------------------------------------------
    */

    body("temperature")
        .optional({ nullable: true })
        .isFloat({
            min: 25,
            max: 45
        })
        .withMessage(
            "Temperature must be between 25°C and 45°C"
        ),


    /*
    --------------------------------------------------
    PULSE RATE
    --------------------------------------------------
    */

    body("pulse_rate")
        .optional({ nullable: true })
        .isInt({
            min: 20,
            max: 250
        })
        .withMessage(
            "Pulse rate must be between 20 and 250 bpm"
        ),


    /*
    --------------------------------------------------
    RESPIRATORY RATE
    --------------------------------------------------
    */

    body("respiratory_rate")
        .optional({ nullable: true })
        .isInt({
            min: 5,
            max: 80
        })
        .withMessage(
            "Respiratory rate must be between 5 and 80 breaths per minute"
        ),


    /*
    --------------------------------------------------
    OXYGEN SATURATION
    --------------------------------------------------
    */

    body("oxygen_saturation")
        .optional({ nullable: true })
        .isFloat({
            min: 50,
            max: 100
        })
        .withMessage(
            "Oxygen saturation must be between 50% and 100%"
        ),


    /*
    --------------------------------------------------
    WEIGHT
    --------------------------------------------------
    */

    body("weight")
        .optional({ nullable: true })
        .isFloat({
            min: 0.5,
            max: 500
        })
        .withMessage(
            "Weight must be between 0.5 kg and 500 kg"
        ),


    /*
    --------------------------------------------------
    HEIGHT
    --------------------------------------------------
    */

    body("height")
        .optional({ nullable: true })
        .isFloat({
            min: 20,
            max: 250
        })
        .withMessage(
            "Height must be between 20 cm and 250 cm"
        ),


    /*
    --------------------------------------------------
    DIAGNOSIS
    --------------------------------------------------
    */

    body("diagnosis")
        .trim()
        .notEmpty()
        .withMessage(
            "Diagnosis is required"
        )
        .isLength({
            max: 5000
        })
        .withMessage(
            "Diagnosis is too long"
        ),


    /*
    --------------------------------------------------
    PRESCRIPTION
    --------------------------------------------------
    */

    body("prescription")
        .optional({ nullable: true })
        .isString()
        .withMessage(
            "Prescription must be text"
        )
        .trim()
        .isLength({
            max: 10000
        })
        .withMessage(
            "Prescription is too long"
        ),


    /*
    --------------------------------------------------
    ALLERGIES
    --------------------------------------------------
    */

    body("allergies")
        .optional({ nullable: true })
        .isString()
        .withMessage(
            "Allergies must be text"
        )
        .trim()
        .isLength({
            max: 5000
        })
        .withMessage(
            "Allergies information is too long"
        ),


    /*
    --------------------------------------------------
    TREATMENT PLAN
    --------------------------------------------------
    */

    body("treatment_plan")
        .optional({ nullable: true })
        .isString()
        .withMessage(
            "Treatment plan must be text"
        )
        .trim()
        .isLength({
            max: 10000
        })
        .withMessage(
            "Treatment plan is too long"
        ),


    /*
    --------------------------------------------------
    INVESTIGATION NOTES
    --------------------------------------------------
    */

    body("investigation_notes")
        .optional({ nullable: true })
        .isString()
        .withMessage(
            "Investigation notes must be text"
        )
        .trim()
        .isLength({
            max: 10000
        })
        .withMessage(
            "Investigation notes are too long"
        ),


    /*
    --------------------------------------------------
    CLINICAL NOTES
    --------------------------------------------------
    */

    body("notes")
        .optional({ nullable: true })
        .isString()
        .withMessage(
            "Clinical notes must be text"
        )
        .trim()
        .isLength({
            max: 10000
        })
        .withMessage(
            "Clinical notes are too long"
        ),


    /*
    --------------------------------------------------
    VISIT DATE
    --------------------------------------------------
    */

    body("visit_date")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage(
            "Visit date must be a valid date"
        ),


    /*
    --------------------------------------------------
    FOLLOW-UP DATE
    --------------------------------------------------
    */

    body("follow_up_date")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage(
            "Follow-up date must be a valid date"
        ),


    /*
    --------------------------------------------------
    FINAL VALIDATION HANDLER
    --------------------------------------------------
    */

    validateRequest

];


module.exports =
    validateMedicalRecord;