const express = require("express");
const router = express.Router();
const validateAppointment = require("../middlewares/appointmentValidation");

const {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    completeAppointment
} = require("../controllers/appointmentController");

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments
 *     tags:
 *       - Appointments
 *     responses:
 *       200:
 *         description: Successfully retrieved all appointments.
 */
// Get all appointments
router.get("/", getAllAppointments);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create appointment
 *     tags:
 *       - Appointments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 example: 1
 *               doctor_id:
 *                 type: integer
 *                 example: 2
 *               appointment_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-10"
 *               appointment_time:
 *                 type: string
 *                 example: "10:30:00"
 *               reason:
 *                 type: string
 *                 example: Routine checkup
 *               status:
 *                 type: string
 *                 example: Scheduled
 *     responses:
 *       201:
 *         description: Appointment created successfully.
 */
// Create appointment
router.post("/", validateAppointment, createAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags:
 *       - Appointments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully.
 *       404:
 *         description: Appointment not found.
 */
// Get appointment by ID
router.get("/:id", getAppointmentById);

/**
 * @swagger
 * /appointments/{id}:
 *   patch:
 *     summary: Update appointment
 *     tags:
 *       - Appointments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 example: 1
 *               doctor_id:
 *                 type: integer
 *                 example: 2
 *               appointment_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-10"
 *               appointment_time:
 *                 type: string
 *                 example: "10:30:00"
 *               reason:
 *                 type: string
 *                 example: Routine checkup
 *               status:
 *                 type: string
 *                 example: Scheduled
 *     responses:
 *       200:
 *         description: Appointment updated successfully.
 *       404:
 *         description: Appointment not found.
 */
// Update appointment
router.patch("/:id", updateAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete appointment
 *     tags:
 *       - Appointments
 *     parameters:
 *       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*         description: Appointment ID
*     responses:
*       200:
*         description: Appointment deleted successfully.
*       404:
*         description: Appointment not found.
*/
// Delete appointment
router.delete("/:id", deleteAppointment);

// Complete appointment
router.patch("/:id/complete", completeAppointment);
module.exports = router;