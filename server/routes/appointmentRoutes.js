const express = require("express");
const router = express.Router();

const {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    completeAppointment
} = require("../controllers/appointmentController");

// Get all appointments
router.get("/", getAllAppointments);

// Create appointment
router.post("/", createAppointment);

// Get appointment by ID
router.get("/:id", getAppointmentById);

// Update appointment
router.put("/:id", updateAppointment);

// Delete appointment
router.delete("/:id", deleteAppointment);

// Complete appointment
router.patch("/:id/complete", completeAppointment);
module.exports = router;