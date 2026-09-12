const { body } = require("express-validator");
const validateRequest = require("./validateRequest");

const validateLaboratoryCompletion = [

    body("result")
        .notEmpty()
        .withMessage("Laboratory result is required"),

    validateRequest

];

module.exports =
    validateLaboratoryCompletion;