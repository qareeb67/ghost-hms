
import { useEffect, useState } from "react";

import {
    CalendarDays,
    Clock3,
    FileText,
    UserRound,
    Stethoscope,
    CheckCircle2,
    X,
    Save,
    ClipboardPlus
} from "lucide-react";

import { getPatients } from "../services/patientService";
import { getDoctors } from "../services/doctorService";

import "./AddAppointmentForm.css";


/*
==================================================
HOSPITAL MANAGEMENT SYSTEM — ADD / EDIT APPOINTMENT FORM
==================================================

Supports:

Patient Selection
Doctor Selection
Appointment Scheduling
Consultation Reason
Appointment Status

Compatible with:

createAppointment()
updateAppointment()

==================================================
*/


function AddAppointmentForm({
    appointment,
    onSave,
    onCancel
}) {


    /*
    ==================================================
    FORM STATE
    ==================================================
    */

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [loadingData, setLoadingData] = useState(true);

    const [formData, setFormData] = useState({

        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
        reason: "",
        status: "Scheduled"

    });


    /*
    ==================================================
    LOAD PATIENTS + DOCTORS
    ==================================================
    */

const loadData = async () => {

        try {

            setLoadingData(true);

            const [
                patientData,
                doctorData
            ] = await Promise.all([

                getPatients(),
                getDoctors()

            ]);


            setPatients(
                Array.isArray(patientData?.patients)
                    ? patientData.patients
                    : []
            );


            setDoctors(
                Array.isArray(doctorData?.doctors)
                    ? doctorData.doctors
                    : []
            );


        } catch (err) {

            console.error(
                "Failed to load patients and doctors:",
                err
            );

            setPatients([]);
            setDoctors([]);

        } finally {

            setLoadingData(false);

        }

    };

    useEffect(() => {

        loadData();

    }, []);


    


    /*
    ==================================================
    LOAD EDIT DATA
    ==================================================
    */

    useEffect(() => {

        if (appointment) {

            setFormData({

                patient_id:
                    appointment.patient_id ?? "",

                doctor_id:
                    appointment.doctor_id ?? "",

                appointment_date:
                    appointment.appointment_date
                        ? String(
                            appointment.appointment_date
                        ).split("T")[0]
                        : "",

                appointment_time:
                    appointment.appointment_time
                        ? String(
                            appointment.appointment_time
                        ).slice(0, 5)
                        : "",

                reason:
                    appointment.reason || "",

                status:
                    appointment.status ||
                    "Scheduled"

            });

        } else {

            setFormData({

                patient_id: "",
                doctor_id: "",
                appointment_date: "",
                appointment_time: "",
                reason: "",
                status: "Scheduled"

            });

        }

    }, [appointment]);


    /*
    ==================================================
    HANDLE CHANGE
    ==================================================
    */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(previous => ({

            ...previous,

            [name]: value

        }));

    };


    /*
    ==================================================
    SUBMIT
    ==================================================
    */

    const handleSubmit = (e) => {

        e.preventDefault();

        onSave({

            ...formData,

            patient_id:
                Number(formData.patient_id),

            doctor_id:
                Number(formData.doctor_id)

        });

    };


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <div className="appointment-form">

            {/* ======================================
                FORM HEADER
            ====================================== */}

            <div className="appointment-form-header">

                <div className="appointment-form-title">

                    <div className="appointment-form-icon">

                        <ClipboardPlus size={23} />

                    </div>


                    <div>

                        <h2>

                            {
                                appointment
                                    ? "Edit Appointment"
                                    : "Schedule Appointment"
                            }

                        </h2>


                        <p>

                            {
                                appointment
                                    ? "Update the patient's consultation schedule and appointment details."
                                    : "Create a consultation schedule for a patient with a medical professional."
                            }

                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="appointment-form-close"
                    onClick={onCancel}
                    aria-label="Close appointment form"
                >

                    <X size={20} />

                </button>

            </div>


            {/* ======================================
                FORM
            ====================================== */}

            <form
                onSubmit={handleSubmit}
                className="appointment-form-content"
            >


                {/* ==================================
                    PATIENT & DOCTOR
                ================================== */}

                <div className="appointment-form-section">

                    <div className="appointment-section-heading">

                        <div className="appointment-section-icon">

                            <UserRound size={18} />

                        </div>


                        <div>

                            <h3>
                                Consultation Details
                            </h3>

                            <p>
                                Select the patient and healthcare professional for this appointment.
                            </p>

                        </div>

                    </div>


                    <div className="appointment-form-grid">


                        {/* PATIENT */}

                        <div className="appointment-field">

                            <label htmlFor="patient_id">

                                Patient

                                <span className="appointment-required">
                                    Required
                                </span>

                            </label>


                            <div className="appointment-input-wrapper">

                                <UserRound size={17} />


                                <select
                                    id="patient_id"
                                    name="patient_id"
                                    value={formData.patient_id}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingData}
                                >

                                    <option value="">

                                        {
                                            loadingData
                                                ? "Loading patients..."
                                                : "Select patient"
                                        }

                                    </option>


                                    {patients.map(
                                        patient => (

                                            <option
                                                key={
                                                    patient.patient_id
                                                }
                                                value={
                                                    patient.patient_id
                                                }
                                            >

                                                {
                                                    patient.first_name
                                                }{" "}

                                                {
                                                    patient.middle_name
                                                        ? `${patient.middle_name} `
                                                        : ""
                                                }

                                                {
                                                    patient.last_name
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </div>


                        {/* DOCTOR */}

                        <div className="appointment-field">

                            <label htmlFor="doctor_id">

                                Doctor

                                <span className="appointment-required">
                                    Required
                                </span>

                            </label>


                            <div className="appointment-input-wrapper">

                                <Stethoscope size={17} />


                                <select
                                    id="doctor_id"
                                    name="doctor_id"
                                    value={formData.doctor_id}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingData}
                                >

                                    <option value="">

                                        {
                                            loadingData
                                                ? "Loading doctors..."
                                                : "Select doctor"
                                        }

                                    </option>


                                    {doctors.map(
                                        doctor => (

                                            <option
                                                key={
                                                    doctor.doctor_id
                                                }
                                                value={
                                                    doctor.doctor_id
                                                }
                                            >

                                                Dr.{" "}

                                                {
                                                    doctor.first_name
                                                }{" "}

                                                {
                                                    doctor.last_name
                                                }

                                                {
                                                    doctor.specialization
                                                        ? ` — ${doctor.specialization}`
                                                        : ""
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    DATE & TIME
                ================================== */}

                <div className="appointment-form-section">

                    <div className="appointment-section-heading">

                        <div className="appointment-section-icon">

                            <CalendarDays size={18} />

                        </div>


                        <div>

                            <h3>
                                Appointment Schedule
                            </h3>

                            <p>
                                Choose when the patient should attend the consultation.
                            </p>

                        </div>

                    </div>


                    <div className="appointment-form-grid">


                        {/* DATE */}

                        <div className="appointment-field">

                            <label htmlFor="appointment_date">

                                Appointment Date

                                <span className="appointment-required">
                                    Required
                                </span>

                            </label>


                            <div className="appointment-input-wrapper">

                                <CalendarDays size={17} />

                                <input
                                    id="appointment_date"
                                    name="appointment_date"
                                    type="date"
                                    value={
                                        formData.appointment_date
                                    }
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        {/* TIME */}

                        <div className="appointment-field">

                            <label htmlFor="appointment_time">

                                Appointment Time

                                <span className="appointment-required">
                                    Required
                                </span>

                            </label>


                            <div className="appointment-input-wrapper">

                                <Clock3 size={17} />

                                <input
                                    id="appointment_time"
                                    name="appointment_time"
                                    type="time"
                                    value={
                                        formData.appointment_time
                                    }
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    STATUS & REASON
                ================================== */}

                <div className="appointment-form-section">

                    <div className="appointment-section-heading">

                        <div className="appointment-section-icon">

                            <FileText size={18} />

                        </div>


                        <div>

                            <h3>
                                Appointment Information
                            </h3>

                            <p>
                                Record the purpose and current status of the appointment.
                            </p>

                        </div>

                    </div>


                    <div className="appointment-form-grid">


                        {/* STATUS */}

                        <div className="appointment-field">

                            <label htmlFor="status">

                                Appointment Status

                            </label>


                            <div className="appointment-input-wrapper">

                                <CheckCircle2 size={17} />


                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >

                                    <option value="Scheduled">
                                        Scheduled
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="Cancelled">
                                        Cancelled
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* REASON */}

                        <div className="appointment-field appointment-field-full">

                            <label htmlFor="reason">

                                Reason for Appointment

                                <span className="appointment-optional">
                                    Optional
                                </span>

                            </label>


                            <div className="appointment-textarea-wrapper">

                                <FileText size={17} />


                                <textarea
                                    id="reason"
                                    name="reason"
                                    placeholder="e.g. Follow-up consultation, persistent headache, routine check-up..."
                                    value={formData.reason}
                                    onChange={handleChange}
                                    rows="4"
                                    maxLength="1000"
                                />

                            </div>


                            <div className="appointment-character-count">

                                {formData.reason.length}/1000

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    FORM ACTIONS
                ================================== */}

                <div className="appointment-form-actions">

                    <button
                        type="button"
                        className="appointment-cancel-btn"
                        onClick={onCancel}
                    >

                        <X size={17} />

                        Cancel

                    </button>


                    <button
                        type="submit"
                        className="appointment-save-btn"
                        disabled={loadingData}
                    >

                        <Save size={17} />

                        {

                            appointment
                                ? "Update Appointment"
                                : "Schedule Appointment"

                        }

                    </button>

                </div>

            </form>

        </div>

    );

}


export default AddAppointmentForm;

