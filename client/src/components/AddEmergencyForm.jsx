import { showToast } from "../utils/notificationService";


import { useEffect, useState } from "react";

import { getPatients } from "../services/patientService";
import { getDoctors } from "../services/doctorService";

import "./AddEmergencyForm.css";


function AddEmergencyForm({
    emergency,
    onSave,
    onCancel
}) {

    const [patients, setPatients] =
        useState([]);

    const [doctors, setDoctors] =
        useState([]);

    const [loadingData, setLoadingData] =
        useState(true);

    const [formData, setFormData] = useState({
        patient_id: "",
        temporary_name: "",
        triage_level: "",
        assigned_doctor: "",
        status: "Waiting",
        emergency_notes: ""
    });


    // ==========================================
    // LOAD PATIENTS & DOCTORS
    // ==========================================

    useEffect(() => {

        const loadFormData = async () => {

            try {

                setLoadingData(true);

                const [
                    patientsResponse,
                    doctorsResponse
                ] = await Promise.all([
                    getPatients(),
                    getDoctors()
                ]);

                setPatients(
                    patientsResponse?.patients || []
                );

                setDoctors(
                    doctorsResponse?.doctors || []
                );

            } catch (error) {

                console.error(
                    "Failed to load emergency form data:",
                    error
                );

            } finally {

                setLoadingData(false);

            }

        };


        loadFormData();

    }, []);


    // ==========================================
    // LOAD EXISTING EMERGENCY WHEN EDITING
    // ==========================================

    useEffect(() => {

        if (emergency) {

            setFormData({

                patient_id:
                    emergency.patient_id
                        ? String(emergency.patient_id)
                        : "",

                temporary_name:
                    emergency.temporary_name || "",

                triage_level:
                    emergency.triage_level || "",

                assigned_doctor:
                    emergency.assigned_doctor
                        ? String(emergency.assigned_doctor)
                        : "",

                status:
                    emergency.status || "Waiting",

                emergency_notes:
                    emergency.emergency_notes || ""

            });

        } else {

            setFormData({

                patient_id: "",
                temporary_name: "",
                triage_level: "",
                assigned_doctor: "",
                status: "Waiting",
                emergency_notes: ""

            });

        }

    }, [emergency]);


    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // ==========================================
    // PATIENT SELECTION
    // ==========================================

    const handlePatientChange = (event) => {

        const patientId =
            event.target.value;


        setFormData((previous) => ({

            ...previous,

            patient_id:
                patientId,

            /*
             * If a registered patient is selected,
             * clear the temporary patient name.
             */
            temporary_name:
                patientId
                    ? ""
                    : previous.temporary_name

        }));

    };


    // ==========================================
    // SUBMIT
    // ==========================================

    const handleSubmit = (event) => {

        event.preventDefault();


        /*
        ------------------------------------------
        VALIDATION
        ------------------------------------------
        */

        const hasRegisteredPatient =
            Boolean(
                formData.patient_id
            );

        const hasTemporaryPatient =
            Boolean(
                formData.temporary_name.trim()
            );


        if (
            !hasRegisteredPatient &&
            !hasTemporaryPatient
        ) {

            showToast(
                "Please select a registered patient or enter a temporary patient name."
            );

            return;

        }


        if (!formData.triage_level) {

            showToast(
                "Please select a triage level."
            );

            return;

        }


        /*
        ------------------------------------------
        PAYLOAD
        ------------------------------------------
        */

        const payload = {

            patient_id:
                formData.patient_id
                    ? Number(
                        formData.patient_id
                    )
                    : null,

            temporary_name:
                formData.temporary_name.trim()
                    ? formData.temporary_name.trim()
                    : null,

            triage_level:
                formData.triage_level,

            assigned_doctor:
                formData.assigned_doctor
                    ? Number(
                        formData.assigned_doctor
                    )
                    : null,

            status:
                formData.status,

            emergency_notes:
                formData.emergency_notes.trim()
                    ? formData.emergency_notes.trim()
                    : null

        };


        onSave(payload);

    };


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <form
            className="emergency-form"
            onSubmit={handleSubmit}
        >

            {/* ==================================
                FORM HEADER
            ================================== */}

            <div className="emergency-form-header">

                <div className="emergency-form-header-icon">
                    🚨
                </div>

                <div>

                    <span className="emergency-form-kicker">
                        {emergency
                            ? "UPDATE CASE"
                            : "EMERGENCY REGISTRATION"}
                    </span>

                    <h2>

                        {emergency
                            ? "Update Emergency Case"
                            : "New Emergency Case"}

                    </h2>

                    <p>
                        Record the patient's emergency,
                        triage priority and treatment information.
                    </p>

                </div>

            </div>


            {/* ==================================
                PATIENT INFORMATION
            ================================== */}

            <div className="emergency-form-section">

                <div className="emergency-section-heading">

                    <div className="emergency-section-icon">
                        👤
                    </div>

                    <div>

                        <h3>
                            Patient Information
                        </h3>

                        <p>
                            Identify the patient involved in the emergency.
                        </p>

                    </div>

                </div>


                <div className="emergency-form-grid">

                    {/* REGISTERED PATIENT */}

                    <div className="emergency-form-group">

                        <label htmlFor="patient_id">
                            Registered Patient
                        </label>

                        <select
                            id="patient_id"
                            name="patient_id"
                            value={
                                formData.patient_id
                            }
                            onChange={
                                handlePatientChange
                            }
                            disabled={loadingData}
                        >

                            <option value="">
                                Unknown / Unregistered Patient
                            </option>

                            {patients.map(
                                (patient) => (

                                    <option
                                        key={
                                            patient.patient_id
                                        }
                                        value={
                                            patient.patient_id
                                        }
                                    >

                                        {patient.first_name}{" "}
                                        {patient.last_name}

                                    </option>

                                )
                            )}

                        </select>

                        <span className="emergency-field-help">
                            Select an existing patient when available.
                        </span>

                    </div>


                    {/* TEMPORARY NAME */}

                    <div className="emergency-form-group">

                        <label htmlFor="temporary_name">
                            Temporary Patient Name
                        </label>

                        <input
                            id="temporary_name"
                            type="text"
                            name="temporary_name"
                            placeholder="e.g. Unknown Male"
                            value={
                                formData.temporary_name
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                Boolean(
                                    formData.patient_id
                                )
                            }
                        />

                        <span className="emergency-field-help">
                            Use this when the patient is not yet registered.
                        </span>

                    </div>

                </div>

            </div>


            {/* ==================================
                TRIAGE & ASSIGNMENT
            ================================== */}

            <div className="emergency-form-section">

                <div className="emergency-section-heading">

                    <div className="emergency-section-icon">
                        🩺
                    </div>

                    <div>

                        <h3>
                            Triage & Assignment
                        </h3>

                        <p>
                            Set urgency, treatment status and responsible doctor.
                        </p>

                    </div>

                </div>


                <div className="emergency-form-grid emergency-form-grid-three">

                    {/* TRIAGE */}

                    <div className="emergency-form-group">

                        <label htmlFor="triage_level">
                            Triage Level
                            <span className="required-mark">
                                *
                            </span>
                        </label>

                        <select
                            id="triage_level"
                            name="triage_level"
                            value={
                                formData.triage_level
                            }
                            onChange={
                                handleChange
                            }
                            required
                        >

                            <option value="">
                                Select Triage Level
                            </option>

                            <option value="Critical">
                                Critical — Immediate
                            </option>

                            <option value="High">
                                High — Urgent
                            </option>

                            <option value="Medium">
                                Medium — Moderate
                            </option>

                            <option value="Low">
                                Low — Non-Urgent
                            </option>

                        </select>

                    </div>


                    {/* DOCTOR */}

                    <div className="emergency-form-group">

                        <label htmlFor="assigned_doctor">
                            Assigned Doctor
                        </label>

                        <select
                            id="assigned_doctor"
                            name="assigned_doctor"
                            value={
                                formData.assigned_doctor
                            }
                            onChange={
                                handleChange
                            }
                            disabled={loadingData}
                        >

                            <option value="">
                                Unassigned
                            </option>

                            {doctors.map(
                                (doctor) => (

                                    <option
                                        key={
                                            doctor.doctor_id
                                        }
                                        value={
                                            doctor.doctor_id
                                        }
                                    >

                                        Dr.{" "}
                                        {doctor.first_name}{" "}
                                        {doctor.last_name}

                                        {doctor.specialization
                                            ? ` — ${doctor.specialization}`
                                            : ""}

                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* STATUS */}

                    <div className="emergency-form-group">

                        <label htmlFor="status">
                            Case Status
                        </label>

                        <select
                            id="status"
                            name="status"
                            value={
                                formData.status
                            }
                            onChange={
                                handleChange
                            }
                        >

                            <option value="Waiting">
                                Waiting
                            </option>

                            <option value="In Treatment">
                                In Treatment
                            </option>

                            <option value="Completed">
                                Completed
                            </option>

                        </select>

                    </div>

                </div>


                {/* TRIAGE LEGEND */}

                <div className="emergency-triage-guide">

                    <div className="emergency-triage-guide-title">
                        Triage priority
                    </div>

                    <div className="emergency-triage-guide-items">

                        <span>
                            <i className="guide-dot guide-critical" />
                            Critical
                        </span>

                        <span>
                            <i className="guide-dot guide-high" />
                            High
                        </span>

                        <span>
                            <i className="guide-dot guide-medium" />
                            Medium
                        </span>

                        <span>
                            <i className="guide-dot guide-low" />
                            Low
                        </span>

                    </div>

                </div>

            </div>


            {/* ==================================
                EMERGENCY NOTES
            ================================== */}

            <div className="emergency-form-section">

                <div className="emergency-section-heading">

                    <div className="emergency-section-icon">
                        📝
                    </div>

                    <div>

                        <h3>
                            Emergency Notes
                        </h3>

                        <p>
                            Capture important symptoms, injuries or observations.
                        </p>

                    </div>

                </div>


                <div className="emergency-form-group emergency-notes-group">

                    <label htmlFor="emergency_notes">
                        Clinical Emergency Information
                    </label>

                    <textarea
                        id="emergency_notes"
                        name="emergency_notes"
                        placeholder="Describe the patient's condition, symptoms, injuries, vital observations, or other important emergency information..."
                        value={
                            formData.emergency_notes
                        }
                        onChange={
                            handleChange
                        }
                        rows={6}
                    />

                    <span className="emergency-field-help">
                        Keep notes clear and relevant to the emergency case.
                    </span>

                </div>

            </div>


            {/* ==================================
                FORM ACTIONS
            ================================== */}

            <div className="emergency-form-actions">

                <button
                    type="button"
                    className="emergency-cancel-btn"
                    onClick={onCancel}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="emergency-save-btn"
                >

                    <span>
                        {emergency ? "✓" : "+"}
                    </span>

                    {emergency
                        ? "Update Emergency Case"
                        : "Create Emergency Case"}

                </button>

            </div>

        </form>

    );

}


export default AddEmergencyForm;

