
const express = require("express");
const router = express.Router();
const validatePatient = require("../middlewares/patientValidation");

const {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    searchPatients
} = require("../controllers/patientController");

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients
 *     description: Retrieve a list of all patients.
 *     tags:
 *       - Patients
 *     responses:
 *       200:
 *         description: Successfully retrieved all patients.
 */
// Get all patients
router.get("/", getAllPatients);

// Search patients
router.get("/search", searchPatients);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get a patient by ID
 *     description: Retrieve a single patient using their ID.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient retrieved successfully.
 *       404:
 *         description: Patient not found.
 */
// Get one patient by ID
router.get("/:id", getPatientById);

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient
 *     description: Add a new patient to the hospital.
 *     tags:
 *       - Patients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               gender:
 *                 type: string
 *                 example: Male
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@gmail.com
 *               address:
 *                 type: string
 *                 example: Lagos, Nigeria
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-15"
 *     responses:
 *       201:
 *         description: Patient created successfully.
 */
// Create a patient
router.post("/", validatePatient, createPatient);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update a patient
 *     description: Update an existing patient's information.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               gender:
 *                 type: string
 *                 example: Male
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@gmail.com
 *               address:
 *                 type: string
 *                 example: Lagos, Nigeria
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-15"
 *     responses:
 *       200:
 *         description: Patient updated successfully.
 *       404:
 *         description: Patient not found.
 */
// Update a patient
router.put("/:id", updatePatient);

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Delete a patient
 *     description: Delete a patient using their ID.
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully.
 *       404:
 *         description: Patient not found.
 */
// Delete a patient
router.delete("/:id", deletePatient);

module.exports = router;