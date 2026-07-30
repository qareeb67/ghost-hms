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


router.get("/", getAllDoctors);

router.get("/:id", getDoctorById);

router.post("/", validateDoctor, createDoctor);

router.put("/:id", updateDoctor);

router.delete("/:id", deleteDoctor);

module.exports = router;