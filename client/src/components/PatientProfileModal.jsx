import { showToast } from "../utils/notificationService";

import { useEffect, useState } from "react";

import {
    X,
    Pencil,
    Phone,
    Mail,
    MapPin,
    CalendarDays,
    UserRound,
    HeartPulse,
    ShieldAlert,
    BriefcaseMedical,
    Hash,
    Map,
    Activity,
    Clock3,
    Globe2,
    Stethoscope,
    FileText,
    ClipboardList,
    Pill,
    AlertCircle,
    Thermometer,
    Droplets,
    Weight,
    Ruler,
    Wind,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Plus,
} from "lucide-react";



import AddMedicalRecordForm from "./AddMedicalRecordForm";
import PrescriptionForm from "./PrescriptionForm";

import "./PatientProfileModal.css";
import { formatPatientId } from "../utils/hospitalIds";
import {
    getMedicalRecordsByPatient,
} from "../services/medicalRecordService";

import {
    printMedicalRecord,
    printPrescription,
} from "../services/printService";

function PatientProfileModal({
    patient,
    onClose,
    onEdit,
}) {

    /*
    =====================================================
    MEDICAL RECORD STATE
    =====================================================
    */

    const [
        medicalRecords,
        setMedicalRecords
    ] = useState([]);

    const [
        medicalRecordsLoading,
        setMedicalRecordsLoading
    ] = useState(false);

    const [
        medicalRecordsError,
        setMedicalRecordsError
    ] = useState(null);

    const [
        recordsOffline,
        setRecordsOffline
    ] = useState(false);

    const [
        expandedRecord,
        setExpandedRecord
    ] = useState(null);


    /*
    =====================================================
    ADD MEDICAL RECORD STATE
    =====================================================
    */

    const [
        showMedicalRecordForm,
        setShowMedicalRecordForm
    ] = useState(false);


    /*
    =====================================================
    PRESCRIPTION STATE
    =====================================================
    */

    const [
        showPrescriptionForm,
        setShowPrescriptionForm
    ] = useState(false);

    const [
        prescriptionRecord,
        setPrescriptionRecord
    ] = useState(null);


    /*
    =====================================================
    RECORD HELPERS
    =====================================================
    */

    const getRecordId = (record) =>
        record?.record_id ??
        record?.medical_record_id ??
        record?.id;


    const getRecordDoctor = (record) => {

        if (record?.doctor_name) {

            return record.doctor_name;

        }


        if (
            record?.doctor_first_name ||
            record?.doctor_last_name
        ) {

            return [

                record.doctor_first_name,

                record.doctor_last_name,

            ]
                .filter(Boolean)
                .join(" ");

        }


        return "Doctor not assigned";

    };


    const getRecordTitle = (record) => {

        return (
            record?.diagnosis ||
            record?.chief_complaint ||
            record?.treatment_plan ||
            "Clinical Consultation"
        );

    };


    const getRecordDate = (record) => {

        return (
            record?.visit_date ||
            record?.created_at
        );

    };


    /*
    =====================================================
    LOAD PATIENT MEDICAL RECORDS
    =====================================================
    */

    const loadMedicalRecords = async (
        patientId,
        expandNewest = true
    ) => {

        if (!patientId) {

            setMedicalRecords([]);

            setMedicalRecordsError(
                "This patient does not have a valid database ID."
            );

            return;

        }


        try {

            setMedicalRecordsLoading(true);

            setMedicalRecordsError(null);

            setRecordsOffline(false);


            const response =
                await getMedicalRecordsByPatient(
                    patientId
                );


            const records =
                response?.records ||
                response?.medicalRecords ||
                [];


            setMedicalRecords(
                Array.isArray(records)
                    ? records
                    : []
            );


            setRecordsOffline(
                response?.offline === true
            );


            /*
            Automatically expand
            newest record.
            */

            if (
                expandNewest &&
                records.length > 0
            ) {

                setExpandedRecord(
                    getRecordId(
                        records[0]
                    )
                );

            } else if (
                records.length === 0
            ) {

                setExpandedRecord(null);

            }

        } catch (error) {

            console.error(
                "Failed to load patient medical records:",
                error
            );


            setMedicalRecords([]);


            setMedicalRecordsError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load this patient's medical history."
            );

        } finally {

            setMedicalRecordsLoading(false);

        }

    };


    /*
    =====================================================
    LOAD MEDICAL HISTORY WHEN PATIENT OPENS
    =====================================================
    */

    useEffect(() => {

        if (!patient) {

            setMedicalRecords([]);

            setMedicalRecordsError(null);

            setExpandedRecord(null);

            setShowMedicalRecordForm(false);

            return;

        }


        const patientId =
            patient.patient_id ??
            patient.id;


        if (!patientId) {

            setMedicalRecords([]);

            setMedicalRecordsError(
                "This patient does not have a valid database ID."
            );

            return;

        }


        let cancelled = false;


        const load = async () => {

            try {

                setMedicalRecordsLoading(true);

                setMedicalRecordsError(null);

                setRecordsOffline(false);


                const response =
                    await getMedicalRecordsByPatient(
                        patientId
                    );


                if (cancelled) {

                    return;

                }


                const records =
                    response?.records ||
                    response?.medicalRecords ||
                    [];


                const safeRecords =
                    Array.isArray(records)
                        ? records
                        : [];


                setMedicalRecords(
                    safeRecords
                );


                setRecordsOffline(
                    response?.offline === true
                );


                if (
                    safeRecords.length > 0
                ) {

                    setExpandedRecord(
                        getRecordId(
                            safeRecords[0]
                        )
                    );

                } else {

                    setExpandedRecord(null);

                }

            } catch (error) {

                if (cancelled) {

                    return;

                }


                console.error(
                    "Failed to load patient medical records:",
                    error
                );


                setMedicalRecords([]);


                setMedicalRecordsError(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load this patient's medical history."
                );

            } finally {

                if (!cancelled) {

                    setMedicalRecordsLoading(false);

                }

            }

        };


        load();


        return () => {

            cancelled = true;

        };

    }, [patient]);


    /*
    =====================================================
    FORMAT DATE
    =====================================================
    */

    const formatDate = (date) => {

        if (!date) {

            return "Not provided";

        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "Not provided";

        }


        return parsedDate.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    /*
    =====================================================
    FORMAT DATE + TIME
    =====================================================
    */

    const formatDateTime = (date) => {

        if (!date) {

            return "Not provided";

        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "Not provided";

        }


        return parsedDate.toLocaleString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    };


    /*
    =====================================================
    CALCULATE AGE
    =====================================================
    */

    const calculateAge = (dateOfBirth) => {

        if (!dateOfBirth) {

            return null;

        }


        const birthDate =
            new Date(dateOfBirth);


        if (
            Number.isNaN(
                birthDate.getTime()
            )
        ) {

            return null;

        }


        const today =
            new Date();


        let age =
            today.getFullYear() -
            birthDate.getFullYear();


        const monthDifference =
            today.getMonth() -
            birthDate.getMonth();


        if (
            monthDifference < 0 ||
            (
                monthDifference === 0 &&
                today.getDate() <
                birthDate.getDate()
            )
        ) {

            age--;

        }


        return age >= 0
            ? age
            : null;

    };


    /*
    =====================================================
    SAFE DISPLAY
    =====================================================
    */

    const displayValue = (
        value,
        fallback = "Not provided"
    ) => {

        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ""
        ) {

            return fallback;

        }


        return value;

    };


    /*
    =====================================================
    PATIENT NAME
    =====================================================
    */

    const fullName = [

        patient?.first_name,

        patient?.last_name,

    ]
        .filter(Boolean)
        .join(" ");


    const avatarLetter =
        patient?.first_name
            ?.charAt(0)
            .toUpperCase() ||
        "P";


    /*
    =====================================================
    PATIENT STATUS
    =====================================================
    */

    const patientStatus =
        patient?.patient_status ||
        "Active";


    const normalizedStatus =
        String(patientStatus)
            .toLowerCase()
            .replace(/\s+/g, "-");


    /*
    =====================================================
    NATIONALITY
    =====================================================
    */

    const nationality =
        patient?.nationality
            ?.trim()
            .toLowerCase();


    const isNigerian =
        nationality === "nigeria" ||
        nationality === "nigerian";


    /*
    =====================================================
    LOCATION LABELS
    =====================================================
    */

    const stateLabel =
        isNigerian
            ? "State of Origin"
            : "State / Province / Region";


    const lgaLabel =
        isNigerian
            ? "Local Government Area"
            : "District / City";


    /*
    =====================================================
    AGE
    =====================================================
    */

    const age =
        calculateAge(
            patient?.date_of_birth
        );


    /*
    =====================================================
    RECORD TOGGLE
    =====================================================
    */

    const toggleRecord = (record) => {

        const recordId =
            getRecordId(record);


        setExpandedRecord(
            current =>
                current === recordId
                    ? null
                    : recordId
        );

    };


    /*
    =====================================================
    OPEN ADD MEDICAL RECORD
    =====================================================
    */

    const handleOpenMedicalRecordForm = () => {

        setMedicalRecordsError(null);

        setShowMedicalRecordForm(true);

    };


    /*
    =====================================================
    CLOSE ADD MEDICAL RECORD
    =====================================================
    */

    const handleCloseMedicalRecordForm = () => {

        setShowMedicalRecordForm(false);

    };


    /*
    =====================================================
    MEDICAL RECORD SUCCESS
    =====================================================
    
    IMPORTANT:

    AddMedicalRecordForm creates the record.

    This function ONLY refreshes the
    patient's clinical history afterward.
    =====================================================
    */

    const handleMedicalRecordSuccess = async () => {

        const patientId =
            patient?.patient_id ??
            patient?.id;


        if (!patientId) {

            return;

        }


        await loadMedicalRecords(
            patientId,
            true
        );

    };


    /*
    =====================================================
    OPEN PRESCRIPTION
    =====================================================
    */

    const handleOpenPrescriptionForm = (
        record = null
    ) => {

        const selectedRecord =
            record || medicalRecords[0];


        if (!selectedRecord) {

            showToast(
                "Create a medical record before adding a prescription."
            );

            return;

        }


        setPrescriptionRecord(
            selectedRecord
        );

        setShowPrescriptionForm(true);

    };


    /*
    =====================================================
    CLOSE PRESCRIPTION
    =====================================================
    */

    const handleClosePrescriptionForm = () => {

        setShowPrescriptionForm(false);

        setPrescriptionRecord(null);

    };


    /*
    =====================================================
    PRESCRIPTION SUCCESS
    =====================================================
    */

    const handlePrescriptionSuccess = async () => {

        const patientId =
            patient?.patient_id ??
            patient?.id;


        if (!patientId) {

            return;

        }


        await loadMedicalRecords(
            patientId,
            true
        );

    };

    /*
    =====================================================
    PRINT MEDICAL RECORD
    =====================================================
    */

    const handlePrintMedicalRecord = (record) => {

        if (!record) {

            return;

        }

        try {

            printMedicalRecord({
                patient,
                record,
            });

        } catch (error) {

            console.error(
                "Failed to print medical record:",
                error
            );

            showToast(
                "Unable to print the medical record."
            );

        }

    };


    /*
    =====================================================
    PRINT PRESCRIPTION
    =====================================================
    */

    const handlePrintPrescription = (record) => {

        if (!record) {

            return;

        }

        try {

            printPrescription({
                patient,
                record,
            });

        } catch (error) {

            console.error(
                "Failed to print prescription:",
                error
            );

            showToast(
                "Unable to print the prescription."
            );

        }

    };
    /*
    =====================================================
    OVERLAY CLICK
    =====================================================
    */

    const handleOverlayClick = (event) => {

        if (
            event.target !==
            event.currentTarget
        ) {

            return;

        }


        /*
        Do not close the
        patient modal behind
        the medical record form.
        */

        if (
            showMedicalRecordForm ||
            showPrescriptionForm
        ) {

            return;

        }


        onClose();

    };


    /*
    =====================================================
    NO PATIENT
    =====================================================
    */

    if (!patient) {

        return null;

    }


    /*
    =====================================================
    PATIENT ID
    =====================================================
    */

    const patientId =
        patient?.patient_id ??
        patient?.id;


    /*
    =====================================================
    PRESCRIPTION FORM
    =====================================================
    */

    if (showPrescriptionForm) {

        return (

            <div
                className="patient-profile-overlay"
                onClick={handleOverlayClick}
            >

                <div
                    className="patient-profile-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="prescription-form-title"
                >

                    <PrescriptionForm

                        patient={patient}

                        record={
                            prescriptionRecord
                        }

                        onClose={
                            handleClosePrescriptionForm
                        }

                        onSuccess={
                            handlePrescriptionSuccess
                        }

                    />

                </div>

            </div>

        );

    }


    /*
    =====================================================
    MEDICAL RECORD FORM
    =====================================================
    */

    if (showMedicalRecordForm) {

        return (

            <div
                className="patient-profile-overlay"
                onClick={handleOverlayClick}
            >

                <div
                    className="patient-profile-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="medical-record-form-title"
                >

                    <AddMedicalRecordForm

                        /*
                        IMPORTANT:

                        Pass the FULL patient object.

                        AddMedicalRecordForm will use:

                        patient.patient_id
                        OR
                        patient.id

                        to attach the medical record.
                        */

                        patient={patient}


                        /*
                        The form controls
                        its own close action.
                        */

                        onClose={
                            handleCloseMedicalRecordForm
                        }


                        /*
                        After successful creation,
                        refresh this patient's
                        clinical history.
                        */

                        onSuccess={
                            handleMedicalRecordSuccess
                        }

                    />

                </div>

            </div>

        );

    }


    /*
    =====================================================
    MAIN PATIENT PROFILE
    =====================================================
    */

    return (

        <div
            className="patient-profile-overlay"
            onClick={handleOverlayClick}
        >

            <div
                className="patient-profile-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="patient-profile-title"
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="patient-profile-header">

                    <div className="patient-profile-identity">

                        <div className="patient-profile-avatar">

                            {avatarLetter}

                        </div>


                        <div className="patient-profile-heading">

                            <span>
                                Patient Profile
                            </span>


                            <h2 id="patient-profile-title">

                                {displayValue(
                                    fullName,
                                    "Unnamed Patient"
                                )}

                            </h2>


                            <div className="patient-profile-meta">

                                <Hash size={13} />

                                <strong>

                                    {patient?.patient_number
                                        ? patient.patient_number
                                        : "Patient number not assigned"}

                                </strong>

                            </div>

                        </div>

                    </div>


                    <div className="patient-profile-header-actions">

                        <span
                            className={`patient-status-badge ${normalizedStatus}`}
                        >

                            <Activity size={12} />

                            {patientStatus}

                        </span>


                        <button
                            type="button"
                            className="patient-profile-close"
                            onClick={onClose}
                            aria-label="Close patient profile"
                        >

                            <X size={19} />

                        </button>

                    </div>

                </header>


                {/* =================================================
                    QUICK SUMMARY
                ================================================= */}

                <section className="patient-profile-summary">

                    <div className="profile-summary-item">

                        <span>
                            Age
                        </span>

                        <strong>

                            {age !== null
                                ? `${age} years`
                                : "Not provided"}

                        </strong>

                    </div>


                    <div className="profile-summary-divider" />


                    <div className="profile-summary-item">

                        <span>
                            Gender
                        </span>

                        <strong>

                            {displayValue(
                                patient?.gender
                            )}

                        </strong>

                    </div>


                    <div className="profile-summary-divider" />


                    <div className="profile-summary-item">

                        <span>
                            Blood Group
                        </span>

                        <strong>

                            {displayValue(
                                patient?.blood_group
                            )}

                        </strong>

                    </div>


                    <div className="profile-summary-divider" />


                    <div className="profile-summary-item">

                        <span>
                            Genotype
                        </span>

                        <strong>

                            {displayValue(
                                patient?.genotype
                            )}

                        </strong>

                    </div>

                </section>


                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <section className="patient-profile-section">

                    <div className="patient-profile-section-title">

                        <div className="profile-section-icon">

                            <UserRound size={17} />

                        </div>


                        <div>

                            <h3>
                                Personal Information
                            </h3>

                            <p>
                                Patient identity and personal details
                            </p>

                        </div>

                    </div>


                    <div className="patient-profile-grid">

                        <div className="patient-profile-field">

                            <span>
                                Full Name
                            </span>

                            <strong>

                                {displayValue(
                                    fullName
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                Gender
                            </span>

                            <strong>

                                {displayValue(
                                    patient?.gender
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                Date of Birth
                            </span>

                            <strong>

                                <CalendarDays size={14} />

                                {formatDate(
                                    patient?.date_of_birth
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                Marital Status
                            </span>

                            <strong>

                                {displayValue(
                                    patient?.marital_status
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                Occupation
                            </span>

                            <strong>

                                <BriefcaseMedical size={14} />

                                {displayValue(
                                    patient?.occupation
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                Nationality
                            </span>

                            <strong>

                                <Globe2 size={14} />

                                {displayValue(
                                    patient?.nationality
                                )}

                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    CONTACT & LOCATION
                ================================================= */}

                <section className="patient-profile-section">

                    <div className="patient-profile-section-title">

                        <div className="profile-section-icon">

                            <MapPin size={17} />

                        </div>


                        <div>

                            <h3>
                                Contact & Location
                            </h3>

                            <p>
                                Contact details and residential information
                            </p>

                        </div>

                    </div>


                    <div className="patient-profile-grid">

                        <div className="patient-profile-field">

                            <span>
                                Phone Number
                            </span>

                            <strong>

                                <Phone size={14} />

                                {displayValue(
                                    patient?.phone
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                Email Address
                            </span>

                            <strong>

                                <Mail size={14} />

                                {displayValue(
                                    patient?.email
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                {stateLabel}
                            </span>

                            <strong>

                                <Map size={14} />

                                {displayValue(
                                    patient?.state_of_origin ||
                                    patient?.state
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                {lgaLabel}
                            </span>

                            <strong>

                                {displayValue(
                                    patient?.lga
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field profile-field-full">

                            <span>
                                Address
                            </span>

                            <strong>

                                <MapPin size={14} />

                                {displayValue(
                                    patient?.address
                                )}

                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    MEDICAL INFORMATION
                ================================================= */}

                <section className="patient-profile-section">

                    <div className="patient-profile-section-title">

                        <div className="profile-section-icon medical">

                            <HeartPulse size={17} />

                        </div>


                        <div>

                            <h3>
                                Medical Information
                            </h3>

                            <p>
                                Important clinical information
                            </p>

                        </div>

                    </div>


                    <div className="patient-profile-grid">

                        <div className="patient-profile-field">

                            <span>
                                Blood Group
                            </span>

                            <strong>

                                {displayValue(
                                    patient?.blood_group
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                Genotype
                            </span>

                            <strong>

                                {displayValue(
                                    patient?.genotype
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field profile-field-full">

                            <span>
                                Allergies
                            </span>

                            <strong
                                className={
                                    patient?.allergies
                                        ? "profile-warning-text"
                                        : ""
                                }
                            >

                                {patient?.allergies
                                    ? patient.allergies
                                    : "No known allergies reported"}

                            </strong>

                        </div>


                        <div className="patient-profile-field profile-field-full">

                            <span>
                                Medical History
                            </span>

                            <strong>

                                {displayValue(
                                    patient?.medical_history,
                                    "No medical history reported"
                                )}

                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    CLINICAL HISTORY
                ================================================= */}

                <section className="patient-profile-section clinical-history-section">

                    <div className="patient-profile-section-title">

                        <div className="profile-section-icon clinical">

                            <ClipboardList size={17} />

                        </div>


                        <div className="clinical-history-heading-content">

                            <h3>
                                Clinical History
                            </h3>

                            <p>
                                Previous consultations and medical records
                            </p>

                        </div>


                        <div className="clinical-history-header-actions">

                            <button
                                type="button"
                                className="clinical-history-prescription-btn"
                                onClick={() =>
                                    handleOpenPrescriptionForm()
                                }
                                disabled={
                                    !patientId ||
                                    medicalRecords.length === 0
                                }
                            >

                                <Pill size={15} />

                                Add Prescription

                            </button>


                            <button
                                type="button"
                                className="clinical-history-add-btn"
                                onClick={
                                    handleOpenMedicalRecordForm
                                }
                                disabled={!patientId}
                            >

                                <Plus size={15} />

                                Add Medical Record

                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        RECORD COUNT
                    ================================================= */}

                    {!medicalRecordsLoading &&
                        !medicalRecordsError && (

                            <div className="clinical-history-summary">

                                <div>

                                    <strong>
                                        {medicalRecords.length}
                                    </strong>

                                    <span>

                                        {medicalRecords.length === 1
                                            ? "medical record"
                                            : "medical records"}

                                    </span>

                                </div>


                                {recordsOffline && (

                                    <span className="clinical-offline-badge">

                                        <span className="clinical-offline-dot" />

                                        Offline records

                                    </span>

                                )}

                            </div>

                        )}


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {medicalRecordsLoading && (

                        <div className="clinical-history-loading">

                            <RefreshCw
                                size={21}
                                className="refresh-spinning"
                            />

                            <strong>
                                Loading clinical history...
                            </strong>

                            <span>
                                Retrieving this patient's medical records.
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {!medicalRecordsLoading &&
                        medicalRecordsError && (

                            <div className="clinical-history-error">

                                <div className="clinical-error-icon">

                                    <AlertCircle size={20} />

                                </div>


                                <div>

                                    <strong>
                                        Unable to load clinical history
                                    </strong>

                                    <span>
                                        {medicalRecordsError}
                                    </span>

                                </div>

                            </div>

                        )}


                    {/* =================================================
                        EMPTY
                    ================================================= */}

                    {!medicalRecordsLoading &&
                        !medicalRecordsError &&
                        medicalRecords.length === 0 && (

                            <div className="clinical-history-empty">

                                <div className="clinical-empty-icon">

                                    <FileText size={24} />

                                </div>


                                <strong>
                                    No medical records yet
                                </strong>


                                <span>
                                    Clinical consultations and treatment records will appear here.
                                </span>


                                <button
                                    type="button"
                                    className="clinical-empty-add-btn"
                                    onClick={
                                        handleOpenMedicalRecordForm
                                    }
                                >

                                    <Plus size={15} />

                                    Create First Medical Record

                                </button>

                            </div>

                        )}


                    {/* =================================================
                        RECORDS
                    ================================================= */}

                    {!medicalRecordsLoading &&
                        !medicalRecordsError &&
                        medicalRecords.length > 0 && (

                            <div className="clinical-record-list">

                                {medicalRecords.map(
                                    (record, index) => {

                                        const recordId =
                                            getRecordId(record) ??
                                            `local-${index}`;


                                        const isExpanded =
                                            expandedRecord ===
                                            recordId;


                                        return (

                                            <article
                                                key={recordId}
                                                className={
                                                    isExpanded
                                                        ? "clinical-record-card expanded"
                                                        : "clinical-record-card"
                                                }
                                            >

                                                {/* RECORD HEADER */}

                                                <button
                                                    type="button"
                                                    className="clinical-record-header"
                                                    onClick={() =>
                                                        toggleRecord(record)
                                                    }
                                                >

                                                    <div className="clinical-record-date">

                                                        <div className="clinical-record-date-icon">

                                                            <CalendarDays size={15} />

                                                        </div>


                                                        <div>

                                                            <strong>

                                                                {formatDate(
                                                                    getRecordDate(record)
                                                                )}

                                                            </strong>

                                                            <span>

                                                                {record?.created_at
                                                                    ? formatDateTime(
                                                                        record.created_at
                                                                    )
                                                                    : "Visit record"}

                                                            </span>

                                                        </div>

                                                    </div>


                                                    <div className="clinical-record-main">

                                                        <strong>
                                                            {getRecordTitle(record)}
                                                        </strong>

                                                        <span>

                                                            <Stethoscope size={12} />

                                                            {getRecordDoctor(record)}

                                                            {record?.specialization
                                                                ? ` · ${record.specialization}`
                                                                : ""}

                                                        </span>

                                                    </div>


                                                    <div className="clinical-record-toggle">

                                                        {isExpanded
                                                            ? <ChevronUp size={17} />
                                                            : <ChevronDown size={17} />}

                                                    </div>

                                                </button>


                                                {/* =================================================
                                                    EXPANDED RECORD
                                                ================================================= */}

                                                {isExpanded && (

                                                    <div className="clinical-record-details">

                                                        {/* CLINICAL SUMMARY */}

                                                        <div className="clinical-detail-grid">

                                                            <div className="clinical-detail-item">

                                                                <span>
                                                                    Chief Complaint
                                                                </span>

                                                                <strong>
                                                                    {displayValue(
                                                                        record?.chief_complaint
                                                                    )}
                                                                </strong>

                                                            </div>


                                                            <div className="clinical-detail-item">

                                                                <span>
                                                                    Diagnosis
                                                                </span>

                                                                <strong>
                                                                    {displayValue(
                                                                        record?.diagnosis
                                                                    )}
                                                                </strong>

                                                            </div>


                                                            <div className="clinical-detail-item clinical-detail-full">

                                                                <span>
                                                                    Symptoms
                                                                </span>

                                                                <strong>
                                                                    {displayValue(
                                                                        record?.symptoms
                                                                    )}
                                                                </strong>

                                                            </div>


                                                            <div className="clinical-detail-item clinical-detail-full">

                                                                <span>
                                                                    History of Present Illness
                                                                </span>

                                                                <strong>
                                                                    {displayValue(
                                                                        record?.history_of_present_illness
                                                                    )}
                                                                </strong>

                                                            </div>

                                                        </div>


                                                        {/* =================================================
                                                            VITALS
                                                        ================================================= */}

                                                        <div className="clinical-subsection">

                                                            <div className="clinical-subsection-title">

                                                                <Activity size={14} />

                                                                <span>
                                                                    Vital Signs
                                                                </span>

                                                            </div>


                                                            <div className="clinical-vitals-grid">

                                                                <div className="clinical-vital">

                                                                    <Thermometer size={14} />

                                                                    <span>
                                                                        Blood Pressure
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            record?.blood_pressure
                                                                        )}
                                                                    </strong>

                                                                </div>


                                                                <div className="clinical-vital">

                                                                    <Thermometer size={14} />

                                                                    <span>
                                                                        Temperature
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            record?.temperature
                                                                        )}
                                                                    </strong>

                                                                </div>


                                                                <div className="clinical-vital">

                                                                    <HeartPulse size={14} />

                                                                    <span>
                                                                        Pulse Rate
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            record?.pulse_rate
                                                                        )}
                                                                    </strong>

                                                                </div>


                                                                <div className="clinical-vital">

                                                                    <Wind size={14} />

                                                                    <span>
                                                                        Respiratory Rate
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            record?.respiratory_rate
                                                                        )}
                                                                    </strong>

                                                                </div>


                                                                <div className="clinical-vital">

                                                                    <Droplets size={14} />

                                                                    <span>
                                                                        Oxygen Saturation
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            record?.oxygen_saturation
                                                                        )}
                                                                    </strong>

                                                                </div>


                                                                <div className="clinical-vital">

                                                                    <Weight size={14} />

                                                                    <span>
                                                                        Weight
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            record?.weight
                                                                        )}
                                                                    </strong>

                                                                </div>


                                                                <div className="clinical-vital">

                                                                    <Ruler size={14} />

                                                                    <span>
                                                                        Height
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            record?.height
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                            </div>

                                                        </div>


                                                        {/* =================================================
                                                            TREATMENT
                                                        ================================================= */}

                                                        <div className="clinical-subsection">

                                                            <div className="clinical-subsection-title">

                                                                <Pill size={14} />

                                                                <span>
                                                                    Treatment & Prescription
                                                                </span>

                                                            </div>


                                                            <div className="clinical-detail-grid">

                                                                <div className="clinical-detail-item clinical-detail-full">

                                                                    <span>
                                                                        Prescription
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            record?.prescription
                                                                        )}
                                                                    </strong>

                                                                </div>


                                                                <div className="clinical-detail-item clinical-detail-full">

                                                                    <span>
                                                                        Treatment Plan
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            record?.treatment_plan
                                                                        )}
                                                                    </strong>

                                                                </div>


                                                                <div className="clinical-detail-item clinical-detail-full">

                                                                    <span>
                                                                        Investigation Notes
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            record?.investigation_notes
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                            </div>

                                                        </div>


                                                        {/* =================================================
                                                            SAFETY
                                                        ================================================= */}

                                                        <div className="clinical-subsection">

                                                            <div className="clinical-subsection-title warning">

                                                                <ShieldAlert size={14} />

                                                                <span>
                                                                    Allergies & Clinical Notes
                                                                </span>

                                                            </div>


                                                            <div className="clinical-detail-grid">

                                                                <div className="clinical-detail-item clinical-detail-full">

                                                                    <span>
                                                                        Allergies
                                                                    </span>

                                                                    <strong
                                                                        className={
                                                                            record?.allergies
                                                                                ? "profile-warning-text"
                                                                                : ""
                                                                        }
                                                                    >

                                                                        {displayValue(
                                                                            record?.allergies,
                                                                            "No known allergies reported"
                                                                        )}

                                                                    </strong>

                                                                </div>


                                                                <div className="clinical-detail-item clinical-detail-full">

                                                                    <span>
                                                                        Doctor's Notes
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            record?.notes
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                            </div>

                                                        </div>


                                                        {/* =================================================
                                                            FOLLOW UP
                                                        ================================================= */}

                                                        <div className="clinical-record-footer">

    <div className="clinical-record-footer-info">

        <div>

            <Clock3 size={13} />

            <span>
                Follow-up:
            </span>

            <strong>
                {formatDate(
                    record?.follow_up_date
                )}
            </strong>

        </div>


        <div>

            <Hash size={13} />

            <span>
                Record:
            </span>

            <strong>

                {record?.record_id
                    ? `#${record.record_id}`
                    : "Local record"}

            </strong>

        </div>

    </div>


    <div className="clinical-record-print-actions">

        <button
            type="button"
            className="clinical-print-button prescription-add"
            onClick={(event) => {

                event.stopPropagation();

                handleOpenPrescriptionForm(
                    record
                );

            }}
            title="Add prescription for this record"
        >

            <Pill size={14} />

            <span>
                Add Prescription
            </span>

        </button>


        <button
            type="button"
            className="clinical-print-button medical-record"
            onClick={(event) => {

                event.stopPropagation();

                handlePrintMedicalRecord(
                    record
                );

            }}
            title="Print medical record"
        >

            <FileText size={14} />

            <span>
                Print Medical Record
            </span>

        </button>


        <button
            type="button"
            className="clinical-print-button prescription"
            onClick={(event) => {

                event.stopPropagation();

                handlePrintPrescription(
                    record
                );

            }}
            title="Print prescription"
        >

            <Pill size={14} />

            <span>
                Print Prescription
            </span>

        </button>

    </div>

</div>

                                                    </div>

                                                )}

                                            </article>

                                        );

                                    }
                                )}

                            </div>

                        )}

                </section>


                {/* =================================================
                    EMERGENCY CONTACT
                ================================================= */}

                <section className="patient-profile-section emergency-profile-section">

                    <div className="patient-profile-section-title">

                        <div className="profile-section-icon emergency">

                            <ShieldAlert size={17} />

                        </div>


                        <div>

                            <h3>
                                Emergency Contact
                            </h3>

                            <p>
                                Person to contact during an emergency
                            </p>

                        </div>

                    </div>


                    <div className="patient-profile-grid">

                        <div className="patient-profile-field">

                            <span>
                                Contact Name
                            </span>

                            <strong>

                                {displayValue(
                                    patient?.emergency_contact_name
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                Relationship
                            </span>

                            <strong>

                                {displayValue(
                                    patient?.emergency_contact_relationship
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field profile-field-full">

                            <span>
                                Contact Phone
                            </span>

                            <strong>

                                <Phone size={14} />

                                {displayValue(
                                    patient?.emergency_contact_phone
                                )}

                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    REGISTRATION INFORMATION
                ================================================= */}

                <section className="patient-profile-section">

                    <div className="patient-profile-section-title">

                        <div className="profile-section-icon registration">

                            <Clock3 size={17} />

                        </div>


                        <div>

                            <h3>
                                Registration Information
                            </h3>

                            <p>
                                Patient record and registration details
                            </p>

                        </div>

                    </div>


                    <div className="patient-profile-grid">

                        <div className="patient-profile-field">

                            <span>
                                Patient Number
                            </span>

                            <strong>

                                <Hash size={14} />

                                {patient?.patient_id !== undefined &&
                                    patient?.patient_id !== null
                                    ? formatPatientId(patient.patient_id)
                                    : "Patient number not assigned"}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                Database ID
                            </span>

                            <strong>

                                <Hash size={14} />

                                {patient?.patient_id
                                    ? `#${patient.patient_id}`
                                    : "Not assigned"}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                Registration Date
                            </span>

                            <strong>

                                <CalendarDays size={14} />

                                {formatDate(
                                    patient?.registration_date ||
                                    patient?.created_at
                                )}

                            </strong>

                        </div>


                        <div className="patient-profile-field">

                            <span>
                                Patient Status
                            </span>

                            <strong>

                                <Activity size={14} />

                                {patientStatus}

                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="patient-profile-footer">

                    <button
                        type="button"
                        className="patient-profile-secondary"
                        onClick={onClose}
                    >

                        Close

                    </button>


                    <button
                        type="button"
                        className="patient-profile-primary"
                        onClick={() => {

                            onEdit(patient);

                        }}
                    >

                        <Pencil size={15} />

                        Edit Patient

                    </button>

                </footer>

            </div>

        </div>

    );

}


export default PatientProfileModal;