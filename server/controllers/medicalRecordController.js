const recordModel = require("../models/recordModel");


/*
==================================================
CREATE MEDICAL RECORD
==================================================
*/

const createMedicalRecord = async (
    req,
    res,
    next
) => {

    try {

        const {
            patient_id,
            doctor_id,

            chief_complaint,
            symptoms,
            history_of_present_illness,

            blood_pressure,
            temperature,
            pulse_rate,
            respiratory_rate,
            oxygen_saturation,
            weight,
            height,

            diagnosis,
            prescription,
            allergies,
            treatment_plan,
            investigation_notes,
            notes,

            visit_date,
            follow_up_date

        } = req.body;


        const medicalRecord =
            await recordModel.createMedicalRecord({

                patient_id,
                doctor_id,

                chief_complaint,
                symptoms,
                history_of_present_illness,

                blood_pressure,
                temperature,
                pulse_rate,
                respiratory_rate,
                oxygen_saturation,
                weight,
                height,

                diagnosis,
                prescription,
                allergies,
                treatment_plan,
                investigation_notes,
                notes,

                visit_date,
                follow_up_date

            });


        res.status(201).json({

            success: true,

            message:
                "Medical record created successfully",

            medicalRecord

        });

    } catch (err) {

        next(err);

    }

};


/*
==================================================
GET ALL MEDICAL RECORDS
==================================================
*/

const getAllMedicalRecords = async (
    req,
    res,
    next
) => {

    try {

        const records =
            await recordModel
                .getAllMedicalRecords();


        res.status(200).json({

            success: true,

            medicalRecords:
                records

        });

    } catch (err) {

        next(err);

    }

};


/*
==================================================
GET MEDICAL RECORD BY ID
==================================================
*/

const getMedicalRecordById = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;


        const medicalRecord =
            await recordModel
                .getMedicalRecordById(id);


        if (!medicalRecord) {

            return res.status(404).json({

                success: false,

                message:
                    "Medical record not found"

            });

        }


        res.status(200).json({

            success: true,

            medicalRecord

        });

    } catch (err) {

        next(err);

    }

};


/*
==================================================
UPDATE MEDICAL RECORD
==================================================
*/

const updateMedicalRecord = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;


        const {

            patient_id,
            doctor_id,

            chief_complaint,
            symptoms,
            history_of_present_illness,

            blood_pressure,
            temperature,
            pulse_rate,
            respiratory_rate,
            oxygen_saturation,
            weight,
            height,

            diagnosis,
            prescription,
            allergies,
            treatment_plan,
            investigation_notes,
            notes,

            visit_date,
            follow_up_date

        } = req.body;


        const medicalRecord =
            await recordModel
                .updateMedicalRecord(

                    id,

                    {

                        patient_id,
                        doctor_id,

                        chief_complaint,
                        symptoms,
                        history_of_present_illness,

                        blood_pressure,
                        temperature,
                        pulse_rate,
                        respiratory_rate,
                        oxygen_saturation,
                        weight,
                        height,

                        diagnosis,
                        prescription,
                        allergies,
                        treatment_plan,
                        investigation_notes,
                        notes,

                        visit_date,
                        follow_up_date

                    }

                );


        if (!medicalRecord) {

            return res.status(404).json({

                success: false,

                message:
                    "Medical record not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Medical record updated successfully",

            medicalRecord

        });

    } catch (err) {

        next(err);

    }

};


/*
==================================================
DELETE MEDICAL RECORD
==================================================
*/

const deleteMedicalRecord = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;


        const medicalRecord =
            await recordModel
                .deleteMedicalRecord(id);


        if (!medicalRecord) {

            return res.status(404).json({

                success: false,

                message:
                    "Medical record not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Medical record deleted successfully",

            medicalRecord

        });

    } catch (err) {

        next(err);

    }

};


/*
==================================================
EXPORTS
==================================================
*/
// Get Medical Records By Patient
const getPatientMedicalRecords = async (
    req,
    res,
    next
) => {

    try {

        const {
            patientId
        } = req.params;

        const records =
            await recordModel
                .getMedicalRecordsByPatient(
                    patientId
                );

        res.status(200).json({

            success: true,

            patient_id:
                Number(patientId),

            records

        });

    } catch (err) {

        next(err);

    }

};
module.exports = {

    createMedicalRecord,
    getAllMedicalRecords,
    getMedicalRecordById,
    getPatientMedicalRecords,
    updateMedicalRecord,
    deleteMedicalRecord

};