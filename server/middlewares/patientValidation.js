
const { body } = require("express-validator");
const validateRequest = require("./validateRequest");


// ============================================================
// PATIENT VALIDATION RULES
// ============================================================

const validatePatient = [

    // ========================================================
    // BASIC INFORMATION
    // ========================================================

    body("first_name")
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .isLength({ max: 100 })
        .withMessage("First name must not exceed 100 characters"),


    body("last_name")
        .trim()
        .notEmpty()
        .withMessage("Last name is required")
        .isLength({ max: 100 })
        .withMessage("Last name must not exceed 100 characters"),


    body("gender")
        .trim()
        .isIn([
            "Male",
            "Female",
            "Other"
        ])
        .withMessage(
            "Gender must be Male, Female, or Other"
        ),


    // ========================================================
    // CONTACT INFORMATION
    // ========================================================

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),


    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required")
        .isLength({
            min: 10,
            max: 20
        })
        .withMessage(
            "Phone number must contain between 10 and 20 characters"
        ),


    body("address")
        .trim()
        .notEmpty()
        .withMessage("Address is required")
        .isLength({
            max: 1000
        })
        .withMessage(
            "Address must not exceed 1000 characters"
        ),


    body("date_of_birth")
        .trim()
        .notEmpty()
        .withMessage("Date of birth is required")
        .isISO8601()
        .withMessage(
            "Please provide a valid date of birth"
        )
        .toDate(),


    // ========================================================
    // MEDICAL INFORMATION
    // ========================================================

    body("blood_group")
        .optional({
            nullable: true,
            checkFalsy: true
        })
        .trim()
        .isIn([
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-"
        ])
        .withMessage("Invalid blood group"),


    body("genotype")
        .optional({
            nullable: true,
            checkFalsy: true
        })
        .trim()
        .isIn([
            "AA",
            "AS",
            "AC",
            "SS",
            "SC"
        ])
        .withMessage("Invalid genotype"),


    body("marital_status")
        .optional({
            nullable: true,
            checkFalsy: true
        })
        .trim()
        .isIn([
            "Single",
            "Married",
            "Divorced",
            "Widowed"
        ])
        .withMessage("Invalid marital status"),


    body("occupation")
        .optional({
            nullable: true,
            checkFalsy: true
        })
        .trim()
        .isString()
        .withMessage("Occupation must be text")
        .isLength({
            max: 100
        })
        .withMessage(
            "Occupation must not exceed 100 characters"
        ),


    // ========================================================
    // EMERGENCY CONTACT
    // ========================================================

    body("emergency_contact_name")
        .optional({
            nullable: true,
            checkFalsy: true
        })
        .trim()
        .isString()
        .withMessage(
            "Emergency contact name must be text"
        )
        .isLength({
            max: 255
        })
        .withMessage(
            "Emergency contact name must not exceed 255 characters"
        ),


    body("emergency_contact_phone")
        .optional({
            nullable: true,
            checkFalsy: true
        })
        .trim()
        .isLength({
            min: 10,
            max: 30
        })
        .withMessage(
            "Emergency contact phone must contain between 10 and 30 characters"
        ),


    body("emergency_contact_relationship")
        .optional({
            nullable: true,
            checkFalsy: true
        })
        .trim()
        .isString()
        .withMessage(
            "Emergency contact relationship must be text"
        )
        .isLength({
            max: 50
        })
        .withMessage(
            "Emergency contact relationship must not exceed 50 characters"
        ),


    // ========================================================
    // MEDICAL HISTORY
    // ========================================================

    body("allergies")
        .optional({
            nullable: true,
            checkFalsy: true
        })
        .trim()
        .isString()
        .withMessage(
            "Allergies must be text"
        )
        .isLength({
            max: 5000
        })
        .withMessage(
            "Allergies information is too long"
        ),


    body("medical_history")
        .optional({
            nullable: true,
            checkFalsy: true
        })
        .trim()
        .isString()
        .withMessage(
            "Medical history must be text"
        )
        .isLength({
            max: 10000
        })
        .withMessage(
            "Medical history information is too long"
        ),


    // ========================================================
    // VALIDATION RESULT HANDLER
    // ========================================================

    validateRequest

];


module.exports = validatePatient;

