const laboratoryModel = require("../models/laboratoryModel");

// Create Laboratory Test
const createLaboratoryTest = async (req, res, next) => {

    try {

        const {
            patient_id,
            doctor_id,
            test_name
        } = req.body;

        const laboratoryTest = await laboratoryModel.createLaboratoryTest(
            patient_id,
            doctor_id,
            test_name
        );

        res.status(201).json({
            success: true,
            message: "Laboratory test requested successfully",
            laboratoryTest
        });

    } catch (err) {

        next(err);

    }

};

// Get All Laboratory Tests
const getAllLaboratoryTests = async (req, res, next) => {

    try {

        const laboratoryTests = await laboratoryModel.getAllLaboratoryTests();

        res.status(200).json({
            success: true,
            laboratoryTests
        });

    } catch (err) {

        next(err);

    }

};

// Get Laboratory Test By ID
const getLaboratoryTestById = async (req, res, next) => {

    try {

        const { id } = req.params;

        const laboratoryTest = await laboratoryModel.getLaboratoryTestById(id);

        if (!laboratoryTest) {
            return res.status(404).json({
                success: false,
                message: "Laboratory test not found"
            });
        }

        res.status(200).json({
            success: true,
            laboratoryTest
        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    createLaboratoryTest,
    getAllLaboratoryTests,
    getLaboratoryTestById
};