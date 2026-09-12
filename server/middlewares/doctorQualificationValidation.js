const { body } = require("express-validator");
const validateRequest = require("./validateRequest");


/*
==================================================
VALIDATE DOCTOR QUALIFICATION
==================================================
*/

const validateDoctorQualification = [

    /*
    ==============================================
    QUALIFICATION
    ==============================================
    */

    body("qualification")
        .trim()
        .notEmpty()
        .withMessage(
            "Qualification is required"
        )
        .isLength({ max: 255 })
        .withMessage(
            "Qualification must not exceed 255 characters"
        ),


    /*
    ==============================================
    INSTITUTION
    ==============================================
    */

    body("institution")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 255 })
        .withMessage(
            "Institution must not exceed 255 characters"
        ),


    /*
    ==============================================
    YEAR OBTAINED
    ==============================================
    */

    body("year_obtained")
        .optional({ values: "falsy" })
        .isInt({
            min: 1900,
            max: new Date().getFullYear()
        })
        .withMessage(
            `Year obtained must be between 1900 and ${new Date().getFullYear()}`
        ),


    /*
    ==============================================
    FINAL VALIDATION HANDLER
    ==============================================
    */

    validateRequest

];


module.exports = validateDoctorQualification;