import { confirmAction } from "../components/ConfirmDialog";
import { showToast } from "../utils/notificationService";

import { useEffect, useMemo, useState } from "react";

import {
    FileText,
    Users,
    CalendarDays,
    Pill,
    AlertTriangle,
    Search,
    X,
    Eye,
    Pencil,
    Trash2,
    ChevronRight,
    UserRound,
    Stethoscope,
    ClipboardList
} from "lucide-react";

import {
    getMedicalRecords,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
} from "../services/medicalRecordService";

import AddMedicalRecordForm
    from "../components/AddMedicalRecordForm";

import "./MedicalRecords.css";
import { formatMedicalRecordId } from "../utils/hospitalIds";


function MedicalRecords() {

    const [records, setRecords] = useState([]);

    const [showForm, setShowForm] =
        useState(false);

    const [editingRecord, setEditingRecord] =
        useState(null);

    const [selectedRecord, setSelectedRecord] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);


    /*
    ==================================================
    GET RECORD ID
    ==================================================
    */

    const getRecordId = (record) => {

        if (
            record?.medical_record_id !== undefined &&
            record?.medical_record_id !== null
        ) {
            return record.medical_record_id;
        }

        if (
            record?.record_id !== undefined &&
            record?.record_id !== null
        ) {
            return record.record_id;
        }

        if (
            record?.id !== undefined &&
            record?.id !== null
        ) {
            return record.id;
        }

        return null;
    };


    /*
    ==================================================
    LOAD RECORDS
    ==================================================
    */

const loadRecords = async () => {

        try {

            setLoading(true);

            const data =
                await getMedicalRecords();

            setRecords(
                data?.medicalRecords ||
                data?.records ||
                []
            );

        } catch (error) {

            console.error(
                "Failed to load medical records:",
                error
            );

            setRecords([]);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadRecords();

        const handleSyncComplete = () => {
            loadRecords();
        };

        const handleOnline = () => {
            loadRecords();
        };

        window.addEventListener(
            "ghost-hms-sync-complete",
            handleSyncComplete
        );

        window.addEventListener(
            "online",
            handleOnline
        );

        return () => {
            window.removeEventListener(
                "ghost-hms-sync-complete",
                handleSyncComplete
            );

            window.removeEventListener(
                "online",
                handleOnline
            );
        };

    }, []);


    


    /*
    ==================================================
    CREATE / UPDATE
    ==================================================
    */

    const handleSaveRecord = async (formData) => {

        try {

            setSaving(true);

            if (editingRecord) {

                const recordId =
                    getRecordId(editingRecord);

                if (recordId === null) {

                    throw new Error(
                        "Cannot update medical record: no valid ID found."
                    );

                }

                await updateMedicalRecord(
                    recordId,
                    formData
                );

            } else {

                await createMedicalRecord(
                    formData
                );

            }

            setShowForm(false);

            setEditingRecord(null);

            await loadRecords();

        } catch (error) {

            console.error(
                "Failed to save medical record:",
                error
            );

            showToast(
                error?.message ||
                "Failed to save medical record."
            );

        } finally {

            setSaving(false);

        }

    };


    /*
    ==================================================
    OPEN CREATE FORM
    ==================================================
    */

    const handleAddRecord = () => {

        setEditingRecord(null);

        setShowForm(true);

    };


    /*
    ==================================================
    EDIT
    ==================================================
    */

    const handleEdit = (record) => {

        const recordId =
            getRecordId(record);

        if (recordId === null) {

            showToast(
                "This medical record has no valid ID."
            );

            return;

        }

        setSelectedRecord(null);

        setEditingRecord(record);

        setShowForm(true);

    };


    /*
    ==================================================
    VIEW DETAILS
    ==================================================
    */

    const handleView = (record) => {

        setSelectedRecord(record);

    };


    /*
    ==================================================
    DELETE
    ==================================================
    */

    const handleDelete = async (record) => {

        const recordId =
            getRecordId(record);

        if (recordId === null) {

            showToast(
                "This medical record has no valid ID."
            );

            return;

        }

        const confirmed = await confirmAction({
            title: "Delete medical record?",
            message: "Are you sure you want to delete this medical record? This action cannot be undone.",
            confirmText: "Delete record",
        });

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(recordId);

            await deleteMedicalRecord(
                recordId
            );

            if (
                getRecordId(selectedRecord) ===
                recordId
            ) {
                setSelectedRecord(null);
            }

            await loadRecords();

        } catch (error) {

            console.error(
                "Failed to delete medical record:",
                error
            );

            showToast(
                error?.message ||
                "Failed to delete medical record."
            );

        } finally {

            setDeletingId(null);

        }

    };


    /*
    ==================================================
    SEARCH
    ==================================================
    */

    const filteredRecords =
        useMemo(() => {

            const query =
                search
                    .toLowerCase()
                    .trim();

            if (!query) {
                return records;
            }

            return records.filter(
                (record) => {

                    const searchableText = [

                        record.patient_name,

                        record.doctor_name,

                        record.diagnosis,

                        record.prescription,

                        record.allergies,

                        record.notes,

                        record.patient_id,

                        record.doctor_id

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return searchableText.includes(
                        query
                    );

                }
            );

        }, [
            records,
            search
        ]);


    /*
    ==================================================
    SUMMARY
    ==================================================
    */

    const totalRecords =
        records.length;


    const uniquePatients =
        new Set(
            records
                .map(
                    record =>
                        record.patient_id
                )
                .filter(
                    id =>
                        id !== undefined &&
                        id !== null
                )
        ).size;


    const today =
        new Date();


    const todayString =
        today.toISOString().split("T")[0];


    const todayRecords =
        records.filter(
            record => {

                if (!record.visit_date) {
                    return false;
                }

                return (
                    String(
                        record.visit_date
                    ).split("T")[0] ===
                    todayString
                );

            }
        ).length;


    const prescriptionCount =
        records.filter(
            record =>
                record.prescription &&
                record.prescription.trim()
        ).length;


    const allergyCount =
        records.filter(
            record =>
                record.allergies &&
                record.allergies.trim()
        ).length;


    /*
    ==================================================
    DATE FORMATTER
    ==================================================
    */

    const formatDate = (date) => {

        if (!date) {
            return "Not recorded";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "Not recorded";
        }

        return parsedDate.toLocaleDateString(
            undefined,
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    /*
    ==================================================
    DISPLAY NAME
    ==================================================
    */

    const getPatientName = (record) => {

        if (record?.patient_name) {
            return record.patient_name;
        }

        if (record?.patient_first_name) {

            return [
                record.patient_first_name,
                record.patient_last_name
            ]
                .filter(Boolean)
                .join(" ");

        }

        if (record?.patient_id) {

            return `Patient #${record.patient_id}`;

        }

        return "Unknown patient";

    };


    const getDoctorName = (record) => {

        if (record?.doctor_name) {
            return record.doctor_name;
        }

        if (record?.doctor_first_name) {

            return [
                record.doctor_first_name,
                record.doctor_last_name
            ]
                .filter(Boolean)
                .join(" ");

        }

        if (record?.doctor_id) {

            return `Doctor #${record.doctor_id}`;

        }

        return "Unknown doctor";

    };


    /*
    ==================================================
    TRUNCATE TEXT
    ==================================================
    */

    const truncateText = (
        text,
        length = 120
    ) => {

        if (!text) {
            return "";
        }

        if (
            text.length <= length
        ) {
            return text;
        }

        return `${text.substring(
            0,
            length
        )}...`;

    };


    /*
    ==================================================
    CLOSE FORM
    ==================================================
    */

    const closeForm = () => {

        if (saving) {
            return;
        }

        setShowForm(false);

        setEditingRecord(null);

    };


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <div className="hms-page medical-records-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="medical-records-header">

                <div className="medical-records-header-left">

                    <div className="medical-records-title-icon">

                        <FileText
                            size={22}
                            strokeWidth={1.9}
                        />

                    </div>


                    <div>

                        <h1>
                            Medical Records
                        </h1>

                        <p>
                            Clinical history, diagnoses,
                            prescriptions and patient notes.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="medical-records-add-btn"
                    onClick={handleAddRecord}
                    disabled={saving}
                >

                    <FileText
                        size={16}
                    />

                    Add Medical Record

                </button>

            </div>


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="medical-records-summary">


                {/* TOTAL */}

                <div className="medical-record-summary-card">

                    <div className="medical-record-summary-icon total">

                        <FileText
                            size={19}
                        />

                    </div>

                    <div>

                        <span>
                            Total Records
                        </span>

                        <strong>
                            {totalRecords}
                        </strong>

                    </div>

                </div>


                {/* PATIENTS */}

                <div className="medical-record-summary-card">

                    <div className="medical-record-summary-icon patients">

                        <Users
                            size={19}
                        />

                    </div>

                    <div>

                        <span>
                            Patients
                        </span>

                        <strong>
                            {uniquePatients}
                        </strong>

                    </div>

                </div>


                {/* TODAY */}

                <div className="medical-record-summary-card">

                    <div className="medical-record-summary-icon today">

                        <CalendarDays
                            size={19}
                        />

                    </div>

                    <div>

                        <span>
                            Today's Visits
                        </span>

                        <strong>
                            {todayRecords}
                        </strong>

                    </div>

                </div>


                {/* PRESCRIPTIONS */}

                <div className="medical-record-summary-card">

                    <div className="medical-record-summary-icon prescription">

                        <Pill
                            size={19}
                        />

                    </div>

                    <div>

                        <span>
                            Prescriptions
                        </span>

                        <strong>
                            {prescriptionCount}
                        </strong>

                    </div>

                </div>


                {/* ALLERGIES */}

                <div className="medical-record-summary-card">

                    <div className="medical-record-summary-icon allergy">

                        <AlertTriangle
                            size={19}
                        />

                    </div>

                    <div>

                        <span>
                            Allergy Alerts
                        </span>

                        <strong>
                            {allergyCount}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ==================================================
                FORM
            ================================================== */}

            {showForm && (

                <div className="medical-record-form-section">

                    <AddMedicalRecordForm

                        record={
                            editingRecord
                        }

                        onSave={
                            handleSaveRecord
                        }

                        onCancel={
                            closeForm
                        }

                    />

                </div>

            )}


            {/* ==================================================
                TOOLBAR
            ================================================== */}

            <div className="medical-records-toolbar">


                <div className="medical-records-search">

                    <Search
                        size={17}
                        className="medical-records-search-icon"
                    />


                    <input
                        type="text"
                        placeholder="Search patient, doctor, diagnosis or prescription..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />


                    {search && (

                        <button
                            type="button"
                            className="medical-records-search-clear"
                            onClick={() =>
                                setSearch("")
                            }
                            aria-label="Clear search"
                        >

                            <X
                                size={14}
                            />

                        </button>

                    )}

                </div>


                <div className="medical-records-result-count">

                    Showing

                    <strong>
                        {filteredRecords.length}
                    </strong>

                    of

                    <strong>
                        {records.length}
                    </strong>

                    records

                </div>

            </div>


            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && (

                <div className="medical-records-loading">

                    <div className="medical-records-spinner" />

                    <strong>
                        Loading medical records
                    </strong>

                    <span>
                        Retrieving clinical history...
                    </span>

                </div>

            )}


            {/* ==================================================
                TABLE
            ================================================== */}

            {!loading &&
                filteredRecords.length > 0 && (

                    <div className="medical-records-table-card">

                        <div className="medical-records-table-wrapper">

                            <table className="medical-records-table">


                                <thead>

                                    <tr>

                                        <th>
                                            Record
                                        </th>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            Attending Doctor
                                        </th>

                                        <th>
                                            Diagnosis
                                        </th>

                                        <th>
                                            Prescription
                                        </th>

                                        <th>
                                            Allergies
                                        </th>

                                        <th>
                                            Visit Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredRecords.map(
                                        (record, index) => {

                                            const recordId =
                                                getRecordId(
                                                    record
                                                );


                                            const patientName =
                                                getPatientName(
                                                    record
                                                );


                                            const doctorName =
                                                getDoctorName(
                                                    record
                                                );


                                            const hasPrescription =
                                                Boolean(
                                                    record.prescription &&
                                                    record.prescription.trim()
                                                );


                                            const hasAllergy =
                                                Boolean(
                                                    record.allergies &&
                                                    record.allergies.trim()
                                                );


                                            const recordKey =
                                                recordId !== null
                                                    ? `medical-record-${recordId}`
                                                    : `medical-record-local-${record?.id ?? index}`;


                                            return (

                                                <tr
                                                    key={
                                                        recordKey
                                                    }
                                                >


                                                    {/* RECORD */}

                                                    <td>

                                                        <div className="medical-record-number">

                                                            <div className="medical-record-number-icon">

                                                                <FileText
                                                                    size={16}
                                                                />

                                                            </div>


                                                            <div>

                                                                <strong>

                                                                    {formatMedicalRecordId(recordId)}

                                                                </strong>

                                                                <small>
                                                                    Clinical record
                                                                </small>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* PATIENT */}

                                                    <td>

                                                        <div className="medical-record-patient">

                                                            <div className="medical-record-avatar">

                                                                <UserRound
                                                                    size={16}
                                                                />

                                                            </div>


                                                            <div>

                                                                <strong>
                                                                    {patientName}
                                                                </strong>

                                                                <small>

                                                                    {record.patient_id
                                                                        ? `Patient #${record.patient_id}`
                                                                        : "Local record"}

                                                                </small>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* DOCTOR */}

                                                    <td>

                                                        <div className="medical-record-doctor">

                                                            <div className="medical-record-doctor-icon">

                                                                <Stethoscope
                                                                    size={16}
                                                                />

                                                            </div>


                                                            <div>

                                                                <strong>
                                                                    {doctorName}
                                                                </strong>

                                                                <small>

                                                                    {record.specialization ||
                                                                        "Attending physician"}

                                                                </small>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* DIAGNOSIS */}

                                                    <td>

                                                        <div className="medical-record-cell-text">

                                                            {record.diagnosis
                                                                ? truncateText(
                                                                    record.diagnosis
                                                                )
                                                                : (
                                                                    <span className="medical-record-muted">
                                                                        No diagnosis recorded
                                                                    </span>
                                                                )}

                                                        </div>

                                                    </td>


                                                    {/* PRESCRIPTION */}

                                                    <td>

                                                        {hasPrescription ? (

                                                            <div className="medical-record-prescription">

                                                                <Pill
                                                                    size={14}
                                                                />

                                                                <span>
                                                                    {truncateText(
                                                                        record.prescription
                                                                    )}
                                                                </span>

                                                            </div>

                                                        ) : (

                                                            <span className="medical-record-muted">
                                                                No prescription
                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* ALLERGIES */}

                                                    <td>

                                                        {hasAllergy ? (

                                                            <div className="medical-record-allergy-alert">

                                                                <AlertTriangle
                                                                    size={13}
                                                                />

                                                                <span>
                                                                    {truncateText(
                                                                        record.allergies,
                                                                        90
                                                                    )}
                                                                </span>

                                                            </div>

                                                        ) : (

                                                            <span className="medical-record-no-allergy">

                                                                No known allergies

                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* DATE */}

                                                    <td>

                                                        <div className="medical-record-date">

                                                            <CalendarDays
                                                                size={14}
                                                            />

                                                            {formatDate(
                                                                record.visit_date
                                                            )}

                                                        </div>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={
                                                                `medical-record-status ${
                                                                    record._syncStatus === "pending"
                                                                        ? "pending"
                                                                        : "recorded"
                                                                }`
                                                            }
                                                        >

                                                            <span className="medical-record-status-dot" />

                                                            {record._syncStatus === "pending"
                                                                ? "Pending sync"
                                                                : "Recorded"}

                                                        </span>

                                                    </td>


                                                    {/* ACTIONS */}

                                                    <td>

                                                        <div className="medical-record-actions">


                                                            {/* VIEW */}

                                                            <button
                                                                type="button"
                                                                className="medical-record-view-btn"
                                                                onClick={() =>
                                                                    handleView(
                                                                        record
                                                                    )
                                                                }
                                                                title="View medical record"
                                                                aria-label="View medical record"
                                                            >

                                                                <Eye
                                                                    size={14}
                                                                />

                                                            </button>


                                                            {/* EDIT */}

                                                            <button
                                                                type="button"
                                                                className="medical-record-edit-btn"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        record
                                                                    )
                                                                }
                                                                title="Edit medical record"
                                                                aria-label="Edit medical record"
                                                            >

                                                                <Pencil
                                                                    size={14}
                                                                />

                                                            </button>


                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                className="medical-record-delete-btn"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        record
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    recordId
                                                                }
                                                                title="Delete medical record"
                                                                aria-label="Delete medical record"
                                                            >

                                                                {deletingId === recordId ? (

                                                                    <span className="medical-record-mini-spinner" />

                                                                ) : (

                                                                    <Trash2
                                                                        size={14}
                                                                    />

                                                                )}

                                                            </button>


                                                            {/* ARROW */}

                                                            <button
                                                                type="button"
                                                                className="medical-record-row-arrow"
                                                                onClick={() =>
                                                                    handleView(
                                                                        record
                                                                    )
                                                                }
                                                                title="Open record"
                                                                aria-label="Open record"
                                                            >

                                                                <ChevronRight
                                                                    size={14}
                                                                />

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}


            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {!loading &&
                filteredRecords.length === 0 && (

                    <div className="medical-records-empty">

                        <div className="medical-records-empty-icon">

                            {search ? (

                                <Search
                                    size={24}
                                />

                            ) : (

                                <ClipboardList
                                    size={24}
                                />

                            )}

                        </div>


                        <h3>

                            {search
                                ? "No medical records found"
                                : "No medical records yet"}

                        </h3>


                        <p>

                            {search

                                ? "Try changing your search terms or clearing the search."

                                : "Create a medical record to begin building a patient's clinical history."}

                        </p>


                        {!search && (

                            <button
                                type="button"
                                className="medical-records-empty-btn"
                                onClick={handleAddRecord}
                            >

                                <FileText
                                    size={14}
                                />

                                Create Medical Record

                            </button>

                        )}

                    </div>

                )}


            {/* ==================================================
                DETAILS DRAWER
            ================================================== */}

            {selectedRecord && (

                <div
                    className="medical-record-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            setSelectedRecord(
                                null
                            );
                        }

                    }}
                >

                    <aside className="medical-record-details">


                        {/* HEADER */}

                        <div className="medical-record-details-header">

                            <div>

                                <span>
                                    Medical Record
                                </span>

                                <h2>

                                    {getRecordId(
                                        selectedRecord
                                    ) !== null

                                        ? `MR-${getRecordId(
                                            selectedRecord
                                        )}`

                                        : "Pending Record"}

                                </h2>

                            </div>


                            <button
                                type="button"
                                className="medical-record-details-close"
                                onClick={() =>
                                    setSelectedRecord(
                                        null
                                    )
                                }
                                aria-label="Close details"
                            >

                                <X
                                    size={17}
                                />

                            </button>

                        </div>


                        {/* BODY */}

                        <div className="medical-record-details-body">


                            {/* PATIENT */}

                            <div className="medical-record-detail-section">

                                <div className="medical-record-detail-heading">

                                    <UserRound
                                        size={13}
                                    />

                                    Patient

                                </div>


                                <div className="medical-record-detail-person">

                                    <strong>
                                        {getPatientName(
                                            selectedRecord
                                        )}
                                    </strong>

                                    <span>

                                        {selectedRecord.patient_id
                                            ? `Patient ID: ${selectedRecord.patient_id}`
                                            : "Patient ID unavailable"}

                                    </span>

                                </div>

                            </div>


                            {/* DOCTOR */}

                            <div className="medical-record-detail-section">

                                <div className="medical-record-detail-heading">

                                    <Stethoscope
                                        size={13}
                                    />

                                    Attending Doctor

                                </div>


                                <div className="medical-record-detail-person">

                                    <strong>
                                        {getDoctorName(
                                            selectedRecord
                                        )}
                                    </strong>

                                    <span>

                                        {selectedRecord.specialization ||
                                            "Attending physician"}

                                    </span>

                                </div>

                            </div>


                            {/* VISIT DATE */}

                            <div className="medical-record-detail-section">

                                <div className="medical-record-detail-heading">

                                    <CalendarDays
                                        size={13}
                                    />

                                    Visit Date

                                </div>


                                <div className="medical-record-detail-date">

                                    {formatDate(
                                        selectedRecord.visit_date
                                    )}

                                </div>

                            </div>


                            {/* DIAGNOSIS */}

                            <div className="medical-record-detail-section">

                                <div className="medical-record-detail-heading">

                                    <ClipboardList
                                        size={13}
                                    />

                                    Diagnosis

                                </div>


                                <p>

                                    {selectedRecord.diagnosis ||
                                        "No diagnosis recorded."}

                                </p>

                            </div>


                            {/* PRESCRIPTION */}

                            <div className="medical-record-detail-section">

                                <div className="medical-record-detail-heading">

                                    <Pill
                                        size={13}
                                    />

                                    Prescription

                                </div>


                                <p>

                                    {selectedRecord.prescription ||
                                        "No prescription recorded."}

                                </p>

                            </div>


                            {/* ALLERGIES */}

                            <div className="medical-record-detail-section">

                                <div className="medical-record-detail-heading">

                                    <AlertTriangle
                                        size={13}
                                    />

                                    Allergies

                                </div>


                                {selectedRecord.allergies ? (

                                    <div className="medical-record-detail-allergy">

                                        {selectedRecord.allergies}

                                    </div>

                                ) : (

                                    <div className="medical-record-detail-no-allergy">

                                        No known allergies recorded.

                                    </div>

                                )}

                            </div>


                            {/* NOTES */}

                            <div className="medical-record-detail-section">

                                <div className="medical-record-detail-heading">

                                    <FileText
                                        size={13}
                                    />

                                    Clinical Notes

                                </div>


                                <p>

                                    {selectedRecord.notes ||
                                        "No additional clinical notes recorded."}

                                </p>

                            </div>

                        </div>


                        {/* FOOTER */}

                        <div className="medical-record-details-footer">

                            <button
                                type="button"
                                className="medical-record-details-edit"
                                onClick={() =>
                                    handleEdit(
                                        selectedRecord
                                    )
                                }
                            >

                                <Pencil
                                    size={14}
                                />

                                Edit Record

                            </button>


                            <button
                                type="button"
                                className="medical-record-details-delete"
                                onClick={() =>
                                    handleDelete(
                                        selectedRecord
                                    )
                                }
                            >

                                <Trash2
                                    size={14}
                                />

                                Delete

                            </button>

                        </div>

                    </aside>

                </div>

            )}

        </div>

    );

}


export default MedicalRecords;