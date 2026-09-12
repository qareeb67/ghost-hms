
const { body } = require("express-validator");

const validateRequest =
    require("./validateRequest");


/*
==================================================
DOCTOR VALIDATION
==================================================
*/

const validateDoctor = [

    /*
    ==============================================
    PERSONAL INFORMATION
    ==============================================
    */

    body("first_name")
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .isLength({ max: 100 })
        .withMessage(
            "First name cannot exceed 100 characters"
        ),

    body("middle_name")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage(
            "Middle name cannot exceed 100 characters"
        ),

    body("last_name")
        .trim()
        .notEmpty()
        .withMessage("Last name is required")
        .isLength({ max: 100 })
        .withMessage(
            "Last name cannot exceed 100 characters"
        ),

    body("gender")
        .optional({ checkFalsy: true })
        .isIn([
            "Male",
            "Female",
            "Other"
        ])
        .withMessage(
            "Gender must be Male, Female, or Other"
        ),


    /*
    ==============================================
    PROFESSIONAL INFORMATION
    ==============================================
    */

    body("specialization")
        .trim()
        .notEmpty()
        .withMessage("Specialization is required")
        .isLength({ max: 100 })
        .withMessage(
            "Specialization cannot exceed 100 characters"
        ),

    body("specialization_id")
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage(
            "Specialization ID must be a valid positive number"
        )
        .toInt(),

    body("department_id")
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage(
            "Department ID must be a valid positive number"
        )
        .toInt(),

    body("years_of_experience")
        .optional({ checkFalsy: true })
        .isInt({
            min: 0,
            max: 80
        })
        .withMessage(
            "Years of experience must be between 0 and 80"
        )
        .toInt(),


    /*
    ==============================================
    CONTACT INFORMATION
    ==============================================
    */

    body("phone")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({
            min: 7,
            max: 20
        })
        .withMessage(
            "Phone number must be between 7 and 20 characters"
        ),

    body("email")
        .optional({ checkFalsy: true })
        .trim()
        .isEmail()
        .withMessage(
            "Please provide a valid email address"
        )
        .normalizeEmail(),


    /*
    ==============================================
    MDCN & LICENSE INFORMATION
    ==============================================
    */

    body("mdcn_number")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({
            min: 3,
            max: 100
        })
        .withMessage(
            "MDCN number must be between 3 and 100 characters"
        ),

    body("mdcn_status")
        .optional({ checkFalsy: true })
        .isIn([
            "Pending Verification",
            "Active",
            "Expired",
            "Suspended",
            "Inactive"
        ])
        .withMessage(
            "Invalid MDCN status"
        ),

    body("license_expiry_date")
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage(
            "License expiry date must be a valid date"
        )
        .toDate(),


    /*
    ==============================================
    EMPLOYMENT INFORMATION
    ==============================================
    */

    body("employment_type")
        .optional({ checkFalsy: true })
        .isIn([
            "Full-time",
            "Part-time",
            "Contract",
            "Locum",
            "Consultant"
        ])
        .withMessage(
            "Invalid employment type"
        ),

    body("employment_status")
        .optional({ checkFalsy: true })
        .isIn([
            "Active",
            "On Leave",
            "Suspended",
            "Inactive",
            "Resigned",
            "Terminated",
            "Retired"
        ])
        .withMessage(
            "Invalid employment status"
        ),

    body("employment_start_date")
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage(
            "Employment start date must be a valid date"
        ),

    body("employment_end_date")
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage(
            "Employment end date must be a valid date"
        )
        .custom((value, { req }) => {

            if (
                !req.body.employment_start_date
            ) {
                return true;
            }

            const startDate =
                new Date(
                    req.body.employment_start_date
                );

            const endDate =
                new Date(value);

            if (endDate < startDate) {

                throw new Error(
                    "Employment end date cannot be earlier than the start date"
                );

            }

            return true;

        }),


    /*
    ==============================================
    ADDRESS
    ==============================================
    */

    body("address")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage(
            "Address cannot exceed 500 characters"
        ),


    /*
    ==============================================
    VALIDATE REQUEST
    ==============================================
    */

    validateRequest

];


module.exports =
    validateDoctor;

