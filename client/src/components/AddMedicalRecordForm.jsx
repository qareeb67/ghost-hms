import { useEffect, useMemo, useState } from "react";

import {
    X,
    Stethoscope,
    CalendarDays,
    ClipboardList,
    Activity,
    HeartPulse,
    Thermometer,
    Wind,
    Droplets,
    Weight,
    Ruler,
    Pill,
    ShieldAlert,
    FileText,
    Microscope,
    Save,
    Plus,
    RefreshCw,
    UserRound,
    Search,
} from "lucide-react";

import {
    createMedicalRecord,
    updateMedicalRecord,
} from "../services/medicalRecordService";

import {
    getDoctors,
} from "../services/doctorService";

import {
    getPatients,
} from "../services/patientService";

import "./AddMedicalRecordForm.css";


/*
==================================================
HOSPITAL MANAGEMENT SYSTEM
ADD / EDIT MEDICAL RECORD FORM

Supports:

CREATE
EDIT
PATIENT PROFILE
MEDICAL RECORDS PAGE
ONLINE
OFFLINE

Patient behavior:

1. Patient Profile
   -> patient prop exists
   -> patient is locked/contextual

2. Medical Records page
   -> no patient prop
   -> patient selector is displayed

3. Edit
   -> existing record.patient_id is selected
==================================================
*/


function AddMedicalRecordForm({
    patient,
    record = null,

    onClose,
    onSuccess,

    onCancel,
    onSave,
}) {

    /*
    ==================================================
    MODE
    ==================================================
    */

    const isEditMode = Boolean(record);

    const patientContextProvided = Boolean(
        patient?.patient_id ??
        patient?.id
    );


    /*
    ==================================================
    CALLBACK COMPATIBILITY
    ==================================================
    */

    const closeForm =
        onClose || onCancel;

    const successHandler =
        onSuccess || onSave;


    /*
    ==================================================
    PATIENTS
    ==================================================
    */

    const [
        patients,
        setPatients
    ] = useState([]);

    const [
        patientsLoading,
        setPatientsLoading
    ] = useState(false);


    /*
    ==================================================
    DOCTORS
    ==================================================
    */

    const [
        doctors,
        setDoctors
    ] = useState([]);

    const [
        doctorsLoading,
        setDoctorsLoading
    ] = useState(false);


    /*
    ==================================================
    FORM STATE
    ==================================================
    */

    const [
        formData,
        setFormData
    ] = useState({

        patient_id:
            patient?.patient_id ??
            patient?.id ??
            record?.patient_id ??
            "",

        doctor_id:
            record?.doctor_id ??
            "",

        chief_complaint:
            record?.chief_complaint ??
            "",

        symptoms:
            record?.symptoms ??
            "",

        history_of_present_illness:
            record?.history_of_present_illness ??
            "",

        blood_pressure:
            record?.blood_pressure ??
            "",

        temperature:
            record?.temperature ??
            "",

        pulse_rate:
            record?.pulse_rate ??
            "",

        respiratory_rate:
            record?.respiratory_rate ??
            "",

        oxygen_saturation:
            record?.oxygen_saturation ??
            "",

        weight:
            record?.weight ??
            "",

        height:
            record?.height ??
            "",

        diagnosis:
            record?.diagnosis ??
            "",

        prescription:
            record?.prescription ??
            "",

        allergies:
            record?.allergies ??
            "",

        treatment_plan:
            record?.treatment_plan ??
            "",

        investigation_notes:
            record?.investigation_notes ??
            "",

        notes:
            record?.notes ??
            "",

        visit_date:
            record?.visit_date
                ? String(record.visit_date).slice(0, 10)
                : new Date().toISOString().slice(0, 10),

        follow_up_date:
            record?.follow_up_date
                ? String(record.follow_up_date).slice(0, 10)
                : "",

    });


    /*
    ==================================================
    UI STATE
    ==================================================
    */

    const [
        submitting,
        setSubmitting
    ] = useState(false);

    const [
        error,
        setError
    ] = useState(null);

    const [
        patientSearch,
        setPatientSearch
    ] = useState("");


    /*
    ==================================================
    LOAD PATIENTS
    ==================================================

    Only needed when the patient was not supplied
    directly by the parent.
    ==================================================
    */

    useEffect(() => {

        if (patientContextProvided) {
            return;
        }

        let cancelled = false;

        const loadPatients = async () => {

            try {

                setPatientsLoading(true);

                const response =
                    await getPatients();

                if (cancelled) {
                    return;
                }

                const patientList =
                    Array.isArray(response)
                        ? response
                        : response?.patients ||
                          response?.data?.patients ||
                          response?.data ||
                          [];

                setPatients(
                    Array.isArray(patientList)
                        ? patientList
                        : []
                );

            } catch (patientError) {

                console.error(
                    "Failed to load patients:",
                    patientError
                );

                if (!cancelled) {

                    setPatients([]);

                }

            } finally {

                if (!cancelled) {

                    setPatientsLoading(false);

                }

            }

        };

        loadPatients();

        return () => {

            cancelled = true;

        };

    }, [patientContextProvided]);


    /*
    ==================================================
    LOAD DOCTORS
    ==================================================
    */

    useEffect(() => {

        let cancelled = false;

        const loadDoctors = async () => {

            try {

                setDoctorsLoading(true);

                const response =
                    await getDoctors();

                if (cancelled) {
                    return;
                }

                const doctorList =
                    Array.isArray(response)
                        ? response
                        : response?.doctors ||
                          response?.data?.doctors ||
                          response?.data ||
                          [];

                setDoctors(
                    Array.isArray(doctorList)
                        ? doctorList
                        : []
                );

            } catch (doctorError) {

                console.error(
                    "Failed to load doctors:",
                    doctorError
                );

                if (!cancelled) {

                    setDoctors([]);

                }

            } finally {

                if (!cancelled) {

                    setDoctorsLoading(false);

                }

            }

        };

        loadDoctors();

        return () => {

            cancelled = true;

        };

    }, []);


    /*
    ==================================================
    SYNC FORM WITH PATIENT / RECORD
    ==================================================
    */

    useEffect(() => {

        setFormData(current => ({
            ...current,

            patient_id:
                patient?.patient_id ??
                patient?.id ??
                record?.patient_id ??
                "",

            doctor_id:
                record?.doctor_id ??
                "",

            chief_complaint:
                record?.chief_complaint ??
                "",

            symptoms:
                record?.symptoms ??
                "",

            history_of_present_illness:
                record?.history_of_present_illness ??
                "",

            blood_pressure:
                record?.blood_pressure ??
                "",

            temperature:
                record?.temperature ??
                "",

            pulse_rate:
                record?.pulse_rate ??
                "",

            respiratory_rate:
                record?.respiratory_rate ??
                "",

            oxygen_saturation:
                record?.oxygen_saturation ??
                "",

            weight:
                record?.weight ??
                "",

            height:
                record?.height ??
                "",

            diagnosis:
                record?.diagnosis ??
                "",

            prescription:
                record?.prescription ??
                "",

            allergies:
                record?.allergies ??
                "",

            treatment_plan:
                record?.treatment_plan ??
                "",

            investigation_notes:
                record?.investigation_notes ??
                "",

            notes:
                record?.notes ??
                "",

            visit_date:
                record?.visit_date
                    ? String(record.visit_date).slice(0, 10)
                    : new Date().toISOString().slice(0, 10),

            follow_up_date:
                record?.follow_up_date
                    ? String(record.follow_up_date).slice(0, 10)
                    : "",
        }));

        setPatientSearch("");

    }, [
        patient,
        record
    ]);


    /*
    ==================================================
    UPDATE FORM
    ==================================================
    */

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData(current => ({
            ...current,
            [name]: value
        }));

        if (error) {

            setError(null);

        }

    };


    /*
    ==================================================
    NORMALIZE NUMBER
    ==================================================
    */

    const nullableNumber = (value) => {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            return null;

        }

        const number =
            Number(value);

        return Number.isFinite(number)
            ? number
            : null;

    };


    /*
    ==================================================
    PATIENT HELPERS
    ==================================================
    */

    const getPatientId = (item) => {

        return (
            item?.patient_id ??
            item?.id ??
            null
        );

    };


    const getPatientName = (item) => {

        if (!item) {
            return "Unnamed Patient";
        }

        if (item.full_name) {
            return item.full_name;
        }

        if (item.name) {
            return item.name;
        }

        return [
            item.first_name,
            item.middle_name,
            item.last_name
        ]
            .filter(Boolean)
            .join(" ") || "Unnamed Patient";

    };


    const getPatientNumber = (item) => {

        return (
            item?.patient_number ||
            item?.patient_no ||
            item?.medical_record_number ||
            null
        );

    };


    /*
    ==================================================
    FILTER PATIENTS
    ==================================================
    */

    const filteredPatients = useMemo(() => {

        const query =
            patientSearch
                .toLowerCase()
                .trim();

        if (!query) {

            return patients;

        }

        return patients.filter(item => {

            const searchableText = [

                getPatientName(item),

                getPatientNumber(item),

                item?.phone,

                item?.email,

                item?.patient_id,

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(query);

        });

    }, [
        patients,
        patientSearch
    ]);


    /*
    ==================================================
    CURRENT SELECTED PATIENT
    ==================================================
    */

    const selectedPatient =
        patientContextProvided
            ? patient
            : patients.find(item =>
                String(
                    getPatientId(item)
                ) === String(
                    formData.patient_id
                )
            );


    /*
    ==================================================
    BUILD PAYLOAD
    ==================================================
    */

    const buildPayload = () => {

        return {

            patient_id:
                formData.patient_id
                    ? Number(formData.patient_id)
                    : null,

            doctor_id:
                formData.doctor_id
                    ? Number(formData.doctor_id)
                    : null,

            chief_complaint:
                formData.chief_complaint.trim() ||
                null,

            symptoms:
                formData.symptoms.trim() ||
                null,

            history_of_present_illness:
                formData.history_of_present_illness.trim() ||
                null,

            blood_pressure:
                formData.blood_pressure.trim() ||
                null,

            temperature:
                nullableNumber(
                    formData.temperature
                ),

            pulse_rate:
                nullableNumber(
                    formData.pulse_rate
                ),

            respiratory_rate:
                nullableNumber(
                    formData.respiratory_rate
                ),

            oxygen_saturation:
                nullableNumber(
                    formData.oxygen_saturation
                ),

            weight:
                nullableNumber(
                    formData.weight
                ),

            height:
                nullableNumber(
                    formData.height
                ),

            diagnosis:
                formData.diagnosis.trim(),

            prescription:
                formData.prescription.trim() ||
                null,

            allergies:
                formData.allergies.trim() ||
                null,

            treatment_plan:
                formData.treatment_plan.trim() ||
                null,

            investigation_notes:
                formData.investigation_notes.trim() ||
                null,

            notes:
                formData.notes.trim() ||
                null,

            visit_date:
                formData.visit_date ||
                null,

            follow_up_date:
                formData.follow_up_date ||
                null,

        };

    };


    /*
    ==================================================
    SUBMIT
    ==================================================
    */

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (submitting) {
            return;
        }

        setError(null);


        /*
        PATIENT
        */

        if (!formData.patient_id) {

            setError(
                "Please select a patient for this medical record."
            );

            return;

        }


        /*
        DOCTOR
        */

        if (!formData.doctor_id) {

            setError(
                "Please select the attending doctor."
            );

            return;

        }


        /*
        DIAGNOSIS
        */

        if (!formData.diagnosis.trim()) {

            setError(
                "Please enter a diagnosis."
            );

            return;

        }


        const payload =
            buildPayload();


        try {

            setSubmitting(true);

            let response;


            /*
            UPDATE
            */

            if (isEditMode) {

                const recordId =
                    record?.record_id ??
                    record?.medical_record_id ??
                    record?.id;

                if (!recordId) {

                    throw new Error(
                        "This medical record does not have a valid ID."
                    );

                }

                response =
                    await updateMedicalRecord(
                        recordId,
                        payload
                    );

            }


            /*
            CREATE
            */

            else {

                response =
                    await createMedicalRecord(
                        payload
                    );

            }


            /*
            SUCCESS
            */

            if (closeForm) {

                closeForm();

            }


            if (successHandler) {

                try {

                    await successHandler(
                        response
                    );

                } catch (refreshError) {

                    console.error(
                        "Medical record saved successfully, but parent refresh failed:",
                        refreshError
                    );

                }

            }

        } catch (submitError) {

            console.error(
                isEditMode
                    ? "Failed to update medical record:"
                    : "Failed to create medical record:",
                submitError
            );

            setError(
                submitError?.response?.data?.message ||
                submitError?.message ||
                (
                    isEditMode
                        ? "Unable to update this medical record."
                        : "Unable to create this medical record."
                )
            );

        } finally {

            setSubmitting(false);

        }

    };


    /*
    ==================================================
    CLOSE
    ==================================================
    */

    const handleClose = () => {

        if (submitting) {
            return;
        }

        if (closeForm) {
            closeForm();
        }

    };


    /*
    ==================================================
    PATIENT DISPLAY
    ==================================================
    */

    const patientName =
        getPatientName(selectedPatient);

    const patientNumber =
        getPatientNumber(selectedPatient) ||
        "Patient number not assigned";


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <div
            className="medical-record-form-overlay"

            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    handleClose();

                }

            }}
        >

            <div
                className="medical-record-form-modal"

                role="dialog"

                aria-modal="true"

                aria-labelledby="medical-record-form-title"
            >


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="medical-record-form-header">

                    <div className="medical-record-form-heading">

                        <div className="medical-record-form-icon">

                            {isEditMode
                                ? <FileText size={20} />
                                : <Plus size={20} />}

                        </div>


                        <div>

                            <span>

                                {isEditMode
                                    ? "Medical Record"
                                    : "Clinical Encounter"}

                            </span>


                            <h2 id="medical-record-form-title">

                                {isEditMode
                                    ? "Edit Medical Record"
                                    : "Add Medical Record"}

                            </h2>

                        </div>

                    </div>


                    <button
                        type="button"

                        className="medical-record-form-close"

                        onClick={handleClose}

                        disabled={submitting}

                        aria-label="Close medical record form"
                    >

                        <X size={19} />

                    </button>

                </header>


                {/* =================================================
                    PATIENT SELECTION / CONTEXT
                ================================================= */}

                {patientContextProvided ? (

                    <div className="medical-record-patient-context">

                        <div className="medical-record-patient-avatar">

                            {patientName
                                ?.charAt(0)
                                .toUpperCase() || "P"}

                        </div>


                        <div>

                            <span>
                                Patient
                            </span>

                            <strong>
                                {patientName}
                            </strong>

                            <small>
                                {patientNumber}
                            </small>

                        </div>

                    </div>

                ) : (

                    <div className="medical-record-patient-selector">

                        <div className="medical-record-patient-selector-heading">

                            <div className="medical-record-section-icon">

                                <UserRound size={17} />

                            </div>

                            <div>

                                <h3>
                                    Select Patient
                                </h3>

                                <p>
                                    Choose the patient this clinical record belongs to.
                                </p>

                            </div>

                        </div>


                        <div className="medical-record-form-field">

                            <label htmlFor="patient_search">

                                <Search size={14} />

                                Patient

                                <span className="required">
                                    *
                                </span>

                            </label>


                            <div className="medical-record-patient-search">

                                <Search
                                    size={15}
                                    className="medical-record-patient-search-icon"
                                />

                                <input
                                    id="patient_search"

                                    type="text"

                                    value={patientSearch}

                                    onChange={(event) =>
                                        setPatientSearch(
                                            event.target.value
                                        )
                                    }

                                    placeholder={
                                        patientsLoading
                                            ? "Loading patients..."
                                            : "Search patient by name, number or phone..."
                                    }

                                    disabled={
                                        patientsLoading ||
                                        submitting
                                    }
                                />

                            </div>


                            <select
                                id="patient_id"

                                name="patient_id"

                                value={
                                    formData.patient_id
                                }

                                onChange={handleChange}

                                disabled={
                                    patientsLoading ||
                                    submitting
                                }

                                required
                            >

                                <option value="">

                                    {patientsLoading
                                        ? "Loading patients..."
                                        : "Select patient"}

                                </option>


                                {filteredPatients.map(
                                    (item, index) => {

                                        const patientId =
                                            getPatientId(item);

                                        const name =
                                            getPatientName(item);

                                        const number =
                                            getPatientNumber(item);

                                        return (

                                            <option
                                                key={`medical-record-patient-${patientId ?? "unknown"}-${index}`}
                                                value={patientId}
                                            >

                                                {name}

                                                {number
                                                    ? ` — ${number}`
                                                    : ""}

                                            </option>

                                        );

                                    }
                                )}

                            </select>


                            {selectedPatient && (

                                <div className="medical-record-selected-patient">

                                    <div className="medical-record-selected-patient-icon">

                                        <UserRound size={15} />

                                    </div>

                                    <div>

                                        <strong>
                                            {patientName}
                                        </strong>

                                        <span>
                                            {patientNumber}
                                        </span>

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                )}


                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    className="medical-record-form"

                    onSubmit={handleSubmit}
                >

                    {/* ERROR */}

                    {error && (

                        <div className="medical-record-form-error">

                            <ShieldAlert size={17} />

                            <span>
                                {error}
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        ENCOUNTER
                    ================================================= */}

                    <section className="medical-record-form-section">

                        <div className="medical-record-form-section-title">

                            <div className="medical-record-section-icon">

                                <ClipboardList size={17} />

                            </div>


                            <div>

                                <h3>
                                    Encounter Details
                                </h3>

                                <p>
                                    Record who attended the patient and when.
                                </p>

                            </div>

                        </div>


                        <div className="medical-record-form-grid">


                            {/* DOCTOR */}

                            <div className="medical-record-form-field">

                                <label htmlFor="doctor_id">

                                    <Stethoscope size={14} />

                                    Attending Doctor

                                    <span className="required">
                                        *
                                    </span>

                                </label>


                                <select
                                    id="doctor_id"

                                    name="doctor_id"

                                    value={formData.doctor_id}

                                    onChange={handleChange}

                                    disabled={
                                        doctorsLoading ||
                                        submitting
                                    }

                                    required
                                >

                                    <option value="">

                                        {doctorsLoading
                                            ? "Loading doctors..."
                                            : "Select attending doctor"}

                                    </option>


                                    {doctors.map(
                                        (doctor, index) => {

                                            const doctorId =
                                                doctor?.doctor_id ??
                                                doctor?.id;

                                            const doctorName = [
                                                doctor?.first_name,
                                                doctor?.last_name,
                                            ]
                                                .filter(Boolean)
                                                .join(" ");


                                            return (

                                                <option
                                                    key={`medical-record-doctor-${doctorId ?? "unknown"}-${index}`}
                                                    value={doctorId}
                                                >

                                                    {doctorName ||
                                                        "Unnamed Doctor"}

                                                    {doctor?.specialization
                                                        ? ` — ${doctor.specialization}`
                                                        : ""}

                                                </option>

                                            );

                                        }
                                    )}

                                </select>

                            </div>


                            {/* VISIT DATE */}

                            <div className="medical-record-form-field">

                                <label htmlFor="visit_date">

                                    <CalendarDays size={14} />

                                    Visit Date

                                </label>


                                <input
                                    id="visit_date"

                                    name="visit_date"

                                    type="date"

                                    value={formData.visit_date}

                                    onChange={handleChange}

                                    disabled={submitting}
                                />

                            </div>


                            {/* FOLLOW UP */}

                            <div className="medical-record-form-field">

                                <label htmlFor="follow_up_date">

                                    <CalendarDays size={14} />

                                    Follow-up Date

                                </label>


                                <input
                                    id="follow_up_date"

                                    name="follow_up_date"

                                    type="date"

                                    value={formData.follow_up_date}

                                    onChange={handleChange}

                                    disabled={submitting}
                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        PRESENTING COMPLAINT
                    ================================================= */}

                    <section className="medical-record-form-section">

                        <div className="medical-record-form-section-title">

                            <div className="medical-record-section-icon clinical">

                                <FileText size={17} />

                            </div>


                            <div>

                                <h3>
                                    Presenting Complaint
                                </h3>

                                <p>
                                    Document why the patient presented and the clinical history.
                                </p>

                            </div>

                        </div>


                        <div className="medical-record-form-stack">


                            <div className="medical-record-form-field">

                                <label htmlFor="chief_complaint">
                                    Chief Complaint
                                </label>

                                <input
                                    id="chief_complaint"

                                    name="chief_complaint"

                                    type="text"

                                    value={formData.chief_complaint}

                                    onChange={handleChange}

                                    disabled={submitting}

                                    placeholder="e.g. Persistent headache and dizziness"
                                />

                            </div>


                            <div className="medical-record-form-field">

                                <label htmlFor="symptoms">
                                    Symptoms
                                </label>

                                <textarea
                                    id="symptoms"

                                    name="symptoms"

                                    rows="3"

                                    value={formData.symptoms}

                                    onChange={handleChange}

                                    disabled={submitting}

                                    placeholder="Describe the patient's reported symptoms..."
                                />

                            </div>


                            <div className="medical-record-form-field">

                                <label htmlFor="history_of_present_illness">

                                    History of Present Illness

                                </label>


                                <textarea
                                    id="history_of_present_illness"

                                    name="history_of_present_illness"

                                    rows="4"

                                    value={
                                        formData.history_of_present_illness
                                    }

                                    onChange={handleChange}

                                    disabled={submitting}

                                    placeholder="Document the history and progression of the present illness..."
                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        VITAL SIGNS
                    ================================================= */}

                    <section className="medical-record-form-section">

                        <div className="medical-record-form-section-title">

                            <div className="medical-record-section-icon medical">

                                <HeartPulse size={17} />

                            </div>


                            <div>

                                <h3>
                                    Vital Signs
                                </h3>

                                <p>
                                    Capture the patient's measurements during this encounter.
                                </p>

                            </div>

                        </div>


                        <div className="medical-record-vitals-grid">


                            <div className="medical-record-form-field">

                                <label htmlFor="blood_pressure">

                                    <Activity size={14} />

                                    Blood Pressure

                                </label>


                                <input
                                    id="blood_pressure"
                                    name="blood_pressure"
                                    type="text"
                                    value={formData.blood_pressure}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="e.g. 120/80 mmHg"
                                />

                            </div>


                            <div className="medical-record-form-field">

                                <label htmlFor="temperature">

                                    <Thermometer size={14} />

                                    Temperature

                                </label>


                                <input
                                    id="temperature"
                                    name="temperature"
                                    type="number"
                                    step="0.1"
                                    value={formData.temperature}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="e.g. 36.7"
                                />

                            </div>


                            <div className="medical-record-form-field">

                                <label htmlFor="pulse_rate">

                                    <HeartPulse size={14} />

                                    Pulse Rate

                                </label>


                                <input
                                    id="pulse_rate"
                                    name="pulse_rate"
                                    type="number"
                                    min="0"
                                    value={formData.pulse_rate}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="e.g. 72"
                                />

                            </div>


                            <div className="medical-record-form-field">

                                <label htmlFor="respiratory_rate">

                                    <Wind size={14} />

                                    Respiratory Rate

                                </label>


                                <input
                                    id="respiratory_rate"
                                    name="respiratory_rate"
                                    type="number"
                                    min="0"
                                    value={formData.respiratory_rate}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="e.g. 16"
                                />

                            </div>


                            <div className="medical-record-form-field">

                                <label htmlFor="oxygen_saturation">

                                    <Droplets size={14} />

                                    Oxygen Saturation

                                </label>


                                <input
                                    id="oxygen_saturation"
                                    name="oxygen_saturation"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={formData.oxygen_saturation}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="e.g. 98"
                                />

                            </div>


                            <div className="medical-record-form-field">

                                <label htmlFor="weight">

                                    <Weight size={14} />

                                    Weight

                                </label>


                                <input
                                    id="weight"
                                    name="weight"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="e.g. 70"
                                />

                            </div>


                            <div className="medical-record-form-field">

                                <label htmlFor="height">

                                    <Ruler size={14} />

                                    Height

                                </label>


                                <input
                                    id="height"
                                    name="height"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={formData.height}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="e.g. 175"
                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        CLINICAL ASSESSMENT
                    ================================================= */}

                    <section className="medical-record-form-section">

                        <div className="medical-record-form-section-title">

                            <div className="medical-record-section-icon diagnosis">

                                <Microscope size={17} />

                            </div>


                            <div>

                                <h3>
                                    Clinical Assessment
                                </h3>

                                <p>
                                    Record the clinical diagnosis and findings.
                                </p>

                            </div>

                        </div>


                        <div className="medical-record-form-stack">

                            <div className="medical-record-form-field">

                                <label htmlFor="diagnosis">

                                    <Microscope size={14} />

                                    Diagnosis

                                    <span className="required">
                                        *
                                    </span>

                                </label>


                                <textarea
                                    id="diagnosis"
                                    name="diagnosis"
                                    rows="3"
                                    value={formData.diagnosis}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Enter the clinical diagnosis..."
                                    required
                                />

                            </div>


                            <div className="medical-record-form-field">

                                <label htmlFor="investigation_notes">

                                    <FileText size={14} />

                                    Investigation Notes

                                </label>


                                <textarea
                                    id="investigation_notes"
                                    name="investigation_notes"
                                    rows="4"
                                    value={formData.investigation_notes}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Laboratory results, imaging findings, tests requested, or other investigations..."
                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        TREATMENT
                    ================================================= */}

                    <section className="medical-record-form-section">

                        <div className="medical-record-form-section-title">

                            <div className="medical-record-section-icon treatment">

                                <Pill size={17} />

                            </div>


                            <div>

                                <h3>
                                    Treatment & Prescription
                                </h3>

                                <p>
                                    Document medications and the treatment plan.
                                </p>

                            </div>

                        </div>


                        <div className="medical-record-form-stack">

                            <div className="medical-record-form-field">

                                <label htmlFor="prescription">

                                    <Pill size={14} />

                                    Prescription

                                </label>


                                <textarea
                                    id="prescription"
                                    name="prescription"
                                    rows="4"
                                    value={formData.prescription}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Medication name, dosage, frequency, duration..."
                                />

                            </div>


                            <div className="medical-record-form-field">

                                <label htmlFor="treatment_plan">
                                    Treatment Plan
                                </label>


                                <textarea
                                    id="treatment_plan"
                                    name="treatment_plan"
                                    rows="4"
                                    value={formData.treatment_plan}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Describe the treatment plan, recommendations, referrals, or next steps..."
                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        SAFETY
                    ================================================= */}

                    <section className="medical-record-form-section">

                        <div className="medical-record-form-section-title">

                            <div className="medical-record-section-icon warning">

                                <ShieldAlert size={17} />

                            </div>


                            <div>

                                <h3>
                                    Patient Safety
                                </h3>

                                <p>
                                    Important allergy and safety information for this encounter.
                                </p>

                            </div>

                        </div>


                        <div className="medical-record-form-stack">

                            <div className="medical-record-form-field">

                                <label htmlFor="allergies">

                                    <ShieldAlert size={14} />

                                    Allergies

                                </label>


                                <textarea
                                    id="allergies"
                                    name="allergies"
                                    rows="3"
                                    value={formData.allergies}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Known drug, food, environmental, or other allergies..."
                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        CLINICAL NOTES
                    ================================================= */}

                    <section className="medical-record-form-section">

                        <div className="medical-record-form-section-title">

                            <div className="medical-record-section-icon notes">

                                <FileText size={17} />

                            </div>


                            <div>

                                <h3>
                                    Doctor's Notes
                                </h3>

                                <p>
                                    Additional professional observations and clinical notes.
                                </p>

                            </div>

                        </div>


                        <div className="medical-record-form-stack">

                            <div className="medical-record-form-field">

                                <label htmlFor="notes">

                                    <FileText size={14} />

                                    Clinical Notes

                                </label>


                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows="5"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Additional observations, clinical reasoning, or notes..."
                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <footer className="medical-record-form-footer">

                        <button
                            type="button"
                            className="medical-record-form-cancel"
                            onClick={handleClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="medical-record-form-submit"
                            disabled={submitting}
                        >

                            {submitting ? (

                                <>

                                    <RefreshCw
                                        size={15}
                                        className="medical-record-submit-spinner"
                                    />

                                    {isEditMode
                                        ? "Updating..."
                                        : "Saving..."}

                                </>

                            ) : (

                                <>

                                    {isEditMode
                                        ? <Save size={15} />
                                        : <Plus size={15} />}

                                    {isEditMode
                                        ? "Update Medical Record"
                                        : "Save Medical Record"}

                                </>

                            )}

                        </button>

                    </footer>

                </form>

            </div>

        </div>

    );

}


export default AddMedicalRecordForm;