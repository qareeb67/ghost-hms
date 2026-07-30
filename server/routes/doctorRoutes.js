const express = require("express");
const router = express.Router();
const validateDoctor = require("../middlewares/doctorValidation");

const {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
} = require("../controllers/doctorController");


/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get all doctors
 *     description: Retrieve a list of all doctors.
 *     tags:
 *       - Doctors
 *     responses:
 *       200:
 *         description: Successfully retrieved all doctors.
 */
router.get("/", getAllDoctors);

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags:
 *       - Doctors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor retrieved successfully.
 *       404:
 *         description: Doctor not found.
 */
router.get("/:id", getDoctorById);

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Create a new doctor
 *     description: Add a new doctor to the hospital.
 *     tags:
 *       - Doctors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Sarah
 *               last_name:
 *                 type: string
 *                 example: Johnson
 *               specialization:
 *                 type: string
 *                 example: Cardiology
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sarah.johnson@gmail.com
 *               license_number:
 *                 type: string
 *                 example: DOC12345
 *     responses:
 *       201:
 *         description: Doctor created successfully.
 */
router.post("/", validateDoctor, createDoctor);

/**
 * @swagger
 * /doctors/{id}:
 *   patch:
 *     summary: Update doctor
 *     tags:
 *       - Doctors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Sarah
 *               last_name:
 *                 type: string
 *                 example: Johnson
 *               specialization:
 *                 type: string
 *                 example: Cardiology
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sarah.johnson@gmail.com
 *               license_number:
 *                 type: string
 *                 example: DOC12345
 *     responses:
 *       200:
 *         description: Doctor updated successfully.
 *       404:
 *         description: Doctor not found.
 */
router.put("/:id", updateDoctor);

/**
 * @swagger
 * /doctors/{id}:
 *   delete:
 *     summary: Delete doctor
 *     tags:
 *       - Doctors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor deleted successfully.
 *       404:
 *         description: Doctor not found.
 */
router.delete("/:id", deleteDoctor);

module.exports = router;