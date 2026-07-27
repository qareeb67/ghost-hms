const express = require("express");
const router = express.Router();

const {
    createPatient,
    getAllPatients,
    getPatientById
} = require("../controllers/patientController");

router.get("/", getAllPatients);

router.get("/:id", getPatientById);

router.post("/", createPatient);

module.exports = router;