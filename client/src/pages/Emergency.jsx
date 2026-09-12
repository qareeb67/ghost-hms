import { confirmAction } from "../components/ConfirmDialog";
import { showToast } from "../utils/notificationService";

import { useEffect, useState } from "react";

import {
    Siren,
    Plus,
    ClipboardList,
    AlertTriangle,
    Stethoscope,
    Clock3,
    Pencil,
    UserRoundCog,
    Trash2,
    Eye,
    X,
    UserRound,
    FileText,
    LoaderCircle,
    ShieldAlert
} from "lucide-react";

import {
    getEmergencyCases,
    getEmergencyCaseById,
    createEmergencyCase,
    updateEmergencyCase,
    updateEmergencyStatus,
    assignEmergencyDoctor,
    deleteEmergencyCase
} from "../services/emergencyService";

import AddEmergencyForm from "../components/AddEmergencyForm";

import "./Emergency.css";
import { formatEmergencyId } from "../utils/hospitalIds";
import {
    printEmergency
} from "../services/printService";

function Emergency() {

    const [emergencies, setEmergencies] =
        useState([]);

    const [showForm, setShowForm] =
        useState(false);

    const [editingEmergency, setEditingEmergency] =
        useState(null);

    const [viewingEmergency, setViewingEmergency] =
        useState(null);

    const [viewLoading, setViewLoading] =
        useState(false);

    const [viewError, setViewError] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [actionId, setActionId] =
        useState(null);


    // ==========================================
    // LOAD EMERGENCY CASES
    // ==========================================

const loadEmergencyCases = async () => {

        try {

            setLoading(true);

            const data =
                await getEmergencyCases();

            setEmergencies(
                Array.isArray(data?.emergencies)
                    ? data.emergencies
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load emergency cases:",
                err
            );

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadEmergencyCases();

        const handleSyncComplete = () => {
            loadEmergencyCases();
        };

        const handleOnline = () => {
            loadEmergencyCases();
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


    // ==========================================
    // ESCAPE KEY FOR VIEW MODAL
    // ==========================================

    useEffect(() => {

        if (!viewingEmergency) {
            return;
        }


        const handleKeyDown = (event) => {

            if (event.key === "Escape") {

                setViewingEmergency(null);
                setViewError("");

            }

        };


        document.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    }, [viewingEmergency]);


    


    // ==========================================
    // CREATE
    // ==========================================

    const handleNewEmergency = () => {

        setEditingEmergency(null);
        setShowForm(true);

    };


    // ==========================================
    // EDIT
    // ==========================================

    const handleEditEmergency = (
        emergency
    ) => {

        setEditingEmergency(emergency);
        setShowForm(true);

    };


    // ==========================================
    // CLOSE FORM
    // ==========================================

    const handleCancelForm = () => {

        if (saving) {
            return;
        }

        setShowForm(false);
        setEditingEmergency(null);

    };


    // ==========================================
    // CREATE / UPDATE
    // ==========================================

    const handleSaveEmergency = async (
        emergencyData
    ) => {

        try {

            setSaving(true);

            if (editingEmergency) {

                await updateEmergencyCase(
                    editingEmergency.emergency_id,
                    emergencyData
                );

            } else {

                await createEmergencyCase(
                    emergencyData
                );

            }

            setShowForm(false);
            setEditingEmergency(null);

            await loadEmergencyCases();

        } catch (err) {

            console.error(
                "Failed to save emergency case:",
                err
            );

            showToast(
                "Failed to save emergency case."
            );

        } finally {

            setSaving(false);

        }

    };


    // ==========================================
    // VIEW EMERGENCY
    // ==========================================

    const handleViewEmergency = async (
        emergency
    ) => {

        const emergencyId =
            emergency?.emergency_id;


        if (
            emergencyId === undefined ||
            emergencyId === null
        ) {

            setViewError(
                "This emergency case does not have a valid ID."
            );

            return;

        }


        try {

            setViewLoading(true);
            setViewError("");

            /*
            Fetch the complete emergency record.

            emergencyService handles:
            - online API request
            - IndexedDB fallback
            */

            const data =
                await getEmergencyCaseById(
                    emergencyId
                );


            const details =
                data?.emergency;


            if (!details) {

                throw new Error(
                    "Emergency case details were not returned."
                );

            }


            setViewingEmergency(
                details
            );

        } catch (err) {

            console.error(
                "Failed to load emergency details:",
                err
            );


            setViewError(
                err?.message ||
                "Failed to load emergency details."
            );

        } finally {

            setViewLoading(false);

        }

    };


    // ==========================================
    // CLOSE VIEW
    // ==========================================

    const handleCloseView = () => {

        setViewingEmergency(null);
        setViewError("");

    };


    // ==========================================
    // STATUS
    // ==========================================

    const handleStatusChange = async (
        emergency,
        status
    ) => {

        if (
            !emergency?.emergency_id ||
            emergency.status === status
        ) {
            return;
        }

        try {

            setActionId(
                emergency.emergency_id
            );

            await updateEmergencyStatus(
                emergency.emergency_id,
                status
            );

            await loadEmergencyCases();

            /*
            If this case is currently open
            in the details modal, refresh it.
            */

            if (
                viewingEmergency?.emergency_id ===
                emergency.emergency_id
            ) {

                const data =
                    await getEmergencyCaseById(
                        emergency.emergency_id
                    );

                if (data?.emergency) {

                    setViewingEmergency(
                        data.emergency
                    );

                }

            }

        } catch (err) {

            console.error(
                "Failed to update emergency status:",
                err
            );

            showToast(
                "Failed to update emergency status."
            );

        } finally {

            setActionId(null);

        }

    };


    // ==========================================
    // ASSIGN DOCTOR
    // ==========================================

    const handleAssignDoctor = async (
        emergency
    ) => {

        const doctorId =
            window.prompt(
                "Enter the Doctor ID to assign:"
            );

        if (
            doctorId === null ||
            doctorId.trim() === ""
        ) {
            return;
        }

        const numericDoctorId =
            Number(doctorId);

        if (
            !Number.isInteger(
                numericDoctorId
            ) ||
            numericDoctorId <= 0
        ) {

            showToast(
                "Please enter a valid Doctor ID."
            );

            return;

        }

        try {

            setActionId(
                emergency.emergency_id
            );

            await assignEmergencyDoctor(
                emergency.emergency_id,
                numericDoctorId
            );

            await loadEmergencyCases();

            /*
            Refresh open details.
            */

            if (
                viewingEmergency?.emergency_id ===
                emergency.emergency_id
            ) {

                const data =
                    await getEmergencyCaseById(
                        emergency.emergency_id
                    );

                if (data?.emergency) {

                    setViewingEmergency(
                        data.emergency
                    );

                }

            }

        } catch (err) {

            console.error(
                "Failed to assign emergency doctor:",
                err
            );

            showToast(
                "Failed to assign emergency doctor."
            );

        } finally {

            setActionId(null);

        }

    };
    // ==========================================
    // PRINT EMERGENCY
    // ==========================================

    const handlePrintEmergency = async () => {

        if (!viewingEmergency) {
            return;
        }

        try {

            await printEmergency(
                viewingEmergency
            );

        } catch (err) {

            console.error(
                "Failed to print emergency case:",
                err
            );

            showToast(
                "Unable to print emergency case."
            );

        }

    };

    // ==========================================
    // DELETE
    // ==========================================

    const handleDeleteEmergency = async (
        emergency
    ) => {

        const patientName =
            getPatientDisplayName(
                emergency
            );

        const confirmed = await confirmAction({
            title: "Delete emergency case?",
            message: `Delete emergency case #${emergency.emergency_id} for ${patientName}? This action cannot be undone.`,
            confirmText: "Delete case",
        });

        if (!confirmed) {
            return;
        }

        try {

            setActionId(
                emergency.emergency_id
            );

            await deleteEmergencyCase(
                emergency.emergency_id
            );


            if (
                viewingEmergency?.emergency_id ===
                emergency.emergency_id
            ) {

                handleCloseView();

            }


            await loadEmergencyCases();

        } catch (err) {

            console.error(
                "Failed to delete emergency case:",
                err
            );

            showToast(
                "Failed to delete emergency case."
            );

        } finally {

            setActionId(null);

        }

    };


    // ==========================================
    // PATIENT NAME
    // ==========================================

    const getPatientDisplayName = (
        emergency
    ) => {

        if (emergency?.patient_id) {

            return (
                emergency.patient_name ||
                `Patient #${emergency.patient_id}`
            );

        }

        return (
            emergency?.temporary_name ||
            "Unknown Patient"
        );

    };


    // ==========================================
    // TRIAGE CLASS
    // ==========================================

    const getTriageClass = (
        triage
    ) => {

        switch (triage) {

            case "Critical":
                return "triage-critical";

            case "High":
                return "triage-high";

            case "Medium":
                return "triage-medium";

            default:
                return "triage-low";

        }

    };


    // ==========================================
    // STATUS CLASS
    // ==========================================

    const getStatusClass = (
        status
    ) => {

        switch (status) {

            case "Completed":
                return "emergency-status-completed";

            case "In Treatment":
                return "emergency-status-treatment";

            default:
                return "emergency-status-waiting";

        }

    };


    // ==========================================
    // PRIORITY ROW
    // ==========================================

    const getTriagePriorityClass = (
        triage
    ) => {

        if (triage === "Critical") {
            return "emergency-row-critical";
        }

        if (triage === "High") {
            return "emergency-row-high";
        }

        return "";

    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDateTime = (
        value
    ) => {

        if (!value) {
            return "—";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }


        return date.toLocaleString(
            "en-NG",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    };


    // ==========================================
    // SUMMARY
    // ==========================================

    const totalCases =
        emergencies.length;

    const criticalCases =
        emergencies.filter(
            item =>
                item.triage_level === "Critical"
        ).length;

    const treatmentCases =
        emergencies.filter(
            item =>
                item.status === "In Treatment"
        ).length;

    const waitingCases =
        emergencies.filter(
            item =>
                item.status === "Waiting"
        ).length;


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="hms-page page-container emergency-page">


            {/* ==================================
                HEADER
            ================================== */}

            <div className="top-bar">

                <div className="emergency-title-row">

                    <div className="emergency-title-icon">
                        <Siren
                            size={23}
                            strokeWidth={2.2}
                        />
                    </div>

                    <div>

                        <h1 className="page-title">
                            Emergency
                        </h1>

                        <p className="emergency-subtitle">
                            Manage urgent and emergency patient cases.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="emergency-add-btn"
                    onClick={
                        handleNewEmergency
                    }
                    disabled={saving}
                >

                    <Plus
                        size={18}
                        strokeWidth={2.4}
                    />

                    New Emergency Case

                </button>

            </div>


            {/* ==================================
                SUMMARY
            ================================== */}

            {!loading && (

                <div className="emergency-summary-grid">


                    <div className="emergency-summary-card">

                        <div className="emergency-summary-icon">

                            <ClipboardList
                                size={20}
                            />

                        </div>

                        <div>

                            <span>
                                Total Cases
                            </span>

                            <strong>
                                {totalCases}
                            </strong>

                        </div>

                    </div>


                    <div className="emergency-summary-card emergency-summary-critical">

                        <div className="emergency-summary-icon">

                            <AlertTriangle
                                size={20}
                            />

                        </div>

                        <div>

                            <span>
                                Critical
                            </span>

                            <strong>
                                {criticalCases}
                            </strong>

                        </div>

                    </div>


                    <div className="emergency-summary-card emergency-summary-treatment">

                        <div className="emergency-summary-icon">

                            <Stethoscope
                                size={20}
                            />

                        </div>

                        <div>

                            <span>
                                In Treatment
                            </span>

                            <strong>
                                {treatmentCases}
                            </strong>

                        </div>

                    </div>


                    <div className="emergency-summary-card emergency-summary-waiting">

                        <div className="emergency-summary-icon">

                            <Clock3
                                size={20}
                            />

                        </div>

                        <div>

                            <span>
                                Waiting
                            </span>

                            <strong>
                                {waitingCases}
                            </strong>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================
                FORM
            ================================== */}

            {showForm && (

                <div className="emergency-form-container">

                    <AddEmergencyForm

                        emergency={
                            editingEmergency
                        }

                        onSave={
                            handleSaveEmergency
                        }

                        onCancel={
                            handleCancelForm
                        }

                    />

                </div>

            )}


            {/* ==================================
                LOADING
            ================================== */}

            {loading ? (

                <div className="emergency-loading-card">

                    <LoaderCircle
                        className="emergency-loading-spinner"
                        size={34}
                    />

                    <p>
                        Loading emergency cases...
                    </p>

                </div>


            ) : emergencies.length === 0 ? (

                <div className="emergency-empty">

                    <div className="emergency-empty-icon">

                        <Siren
                            size={30}
                        />

                    </div>

                    <h3>
                        No emergency cases
                    </h3>

                    <p>
                        New emergency cases will appear here.
                    </p>

                    <button
                        type="button"
                        className="emergency-empty-btn"
                        onClick={
                            handleNewEmergency
                        }
                    >

                        <Plus size={16} />

                        Create Emergency Case

                    </button>

                </div>


            ) : (

                <div className="emergency-table-wrapper">


                    {/* TABLE HEADER */}

                    <div className="emergency-table-header">

                        <div>

                            <h2>
                                Emergency Cases
                            </h2>

                            <p>
                                Active and recent emergency cases
                            </p>

                        </div>

                        <span className="emergency-case-count">

                            {emergencies.length}

                            {" "}

                            {
                                emergencies.length === 1
                                    ? "case"
                                    : "cases"
                            }

                        </span>

                    </div>


                    {/* TABLE */}

                    <table className="emergency-table">

                        <thead>

                            <tr>

                                <th>ID</th>
                                <th>Patient</th>
                                <th>Triage</th>
                                <th>Doctor</th>
                                <th>Status</th>
                                <th>Emergency Notes</th>
                                <th>Arrival Time</th>
                                <th>Actions</th>

                            </tr>

                        </thead>


                        <tbody>

                            {emergencies.map(
                                emergency => {

                                    const isBusy =
                                        actionId ===
                                        emergency.emergency_id;

                                    return (

                                        <tr
                                            key={
                                                emergency.emergency_id
                                            }
                                            className={
                                                getTriagePriorityClass(
                                                    emergency.triage_level
                                                )
                                            }
                                        >


                                            <td className="emergency-id">

                                                {formatEmergencyId(
                                                    emergency.emergency_id
                                                )}

                                            </td>


                                            <td className="emergency-patient-cell">

                                                <strong>

                                                    {
                                                        getPatientDisplayName(
                                                            emergency
                                                        )
                                                    }

                                                </strong>

                                                {emergency.patient_id ? (

                                                    <small>
                                                        Patient #
                                                        {
                                                            emergency.patient_id
                                                        }
                                                    </small>

                                                ) : (

                                                    <small className="temporary-patient">

                                                        Unregistered patient

                                                    </small>

                                                )}

                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        `triage-badge ${getTriageClass(
                                                            emergency.triage_level
                                                        )}`
                                                    }
                                                >

                                                    <span className="triage-dot" />

                                                    {
                                                        emergency.triage_level ||
                                                        "Unknown"
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                {
                                                    emergency.assigned_doctor
                                                        ? (

                                                            <div className="emergency-doctor-cell">

                                                                <strong>

                                                                    {
                                                                        emergency.doctor_name ||
                                                                        `Doctor #${emergency.assigned_doctor}`
                                                                    }

                                                                </strong>

                                                                {emergency.specialization && (

                                                                    <small>

                                                                        {
                                                                            emergency.specialization
                                                                        }

                                                                    </small>

                                                                )}

                                                            </div>

                                                        )
                                                        : (

                                                            <span className="unassigned-doctor">

                                                                Unassigned

                                                            </span>

                                                        )
                                                }

                                            </td>


                                            <td>

                                                <select
                                                    className={
                                                        `emergency-status-select ${getStatusClass(
                                                            emergency.status
                                                        )}`
                                                    }
                                                    value={
                                                        emergency.status ||
                                                        "Waiting"
                                                    }
                                                    disabled={
                                                        isBusy
                                                    }
                                                    onChange={
                                                        e =>
                                                            handleStatusChange(
                                                                emergency,
                                                                e.target.value
                                                            )
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

                                            </td>


                                            <td className="emergency-notes">

                                                <span
                                                    title={
                                                        emergency.emergency_notes ||
                                                        ""
                                                    }
                                                >

                                                    {
                                                        emergency.emergency_notes ||
                                                        "No emergency notes"
                                                    }

                                                </span>

                                            </td>


                                            <td className="emergency-time">

                                                {
                                                    formatDateTime(
                                                        emergency.arrival_time
                                                    )
                                                }

                                            </td>


                                            <td>

                                                <div className="emergency-actions">


                                                    {/* VIEW */}

                                                    <button
                                                        type="button"
                                                        className="emergency-action-btn emergency-view-btn"
                                                        title="View emergency details"
                                                        aria-label="View emergency details"
                                                        disabled={
                                                            isBusy ||
                                                            viewLoading
                                                        }
                                                        onClick={() =>
                                                            handleViewEmergency(
                                                                emergency
                                                            )
                                                        }
                                                    >

                                                        <Eye size={15} />

                                                    </button>


                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        className="emergency-action-btn emergency-edit-btn"
                                                        title="Edit emergency"
                                                        aria-label="Edit emergency"
                                                        disabled={
                                                            isBusy
                                                        }
                                                        onClick={() =>
                                                            handleEditEmergency(
                                                                emergency
                                                            )
                                                        }
                                                    >

                                                        <Pencil size={15} />

                                                    </button>


                                                    {/* DOCTOR */}

                                                    <button
                                                        type="button"
                                                        className="emergency-action-btn emergency-doctor-btn"
                                                        title="Assign doctor"
                                                        aria-label="Assign doctor"
                                                        disabled={
                                                            isBusy
                                                        }
                                                        onClick={() =>
                                                            handleAssignDoctor(
                                                                emergency
                                                            )
                                                        }
                                                    >

                                                        <UserRoundCog
                                                            size={15}
                                                        />

                                                    </button>


                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        className="emergency-action-btn emergency-delete-btn"
                                                        title="Delete emergency"
                                                        aria-label="Delete emergency"
                                                        disabled={
                                                            isBusy
                                                        }
                                                        onClick={() =>
                                                            handleDeleteEmergency(
                                                                emergency
                                                            )
                                                        }
                                                    >

                                                        <Trash2
                                                            size={15}
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

            )}


            {/* ==========================================
                EMERGENCY DETAILS MODAL
            ========================================== */}

            {(viewLoading || viewError || viewingEmergency) && (

                <div
                    className="emergency-modal-backdrop"
                    onClick={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            handleCloseView();

                        }

                    }}
                >

                    <div
                        className="emergency-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="emergency-modal-title"
                    >


                        {/* MODAL HEADER */}

                        <div className="emergency-modal-header">

                            <div className="emergency-modal-title-row">

                                <div className="emergency-modal-icon">

                                    <ShieldAlert
                                        size={21}
                                    />

                                </div>

                                <div>

                                    <span>
                                        Emergency Case
                                    </span>

                                    <h2 id="emergency-modal-title">

                                        {viewingEmergency
                                            ? `Case #${viewingEmergency.emergency_id}`
                                            : "Emergency Details"
                                        }

                                    </h2>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="emergency-modal-close"
                                onClick={
                                    handleCloseView
                                }
                                aria-label="Close emergency details"
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* LOADING */}

                        {viewLoading && (

                            <div className="emergency-modal-loading">

                                <LoaderCircle
                                    size={32}
                                    className="emergency-loading-spinner"
                                />

                                <strong>
                                    Loading emergency details...
                                </strong>

                                <span>
                                    Retrieving the complete emergency case.
                                </span>

                            </div>

                        )}


                        {/* ERROR */}

                        {!viewLoading && viewError && (

                            <div className="emergency-modal-error">

                                <AlertTriangle
                                    size={22}
                                />

                                <div>

                                    <strong>
                                        Unable to load emergency case
                                    </strong>

                                    <span>
                                        {viewError}
                                    </span>

                                </div>

                            </div>

                        )}


                        {/* DETAILS */}

                        {!viewLoading &&
                            !viewError &&
                            viewingEmergency && (

                                <div className="emergency-modal-body">


                                    {/* STATUS STRIP */}

                                    <div className="emergency-modal-status-strip">

                                        <div>

                                            <span>
                                                Triage Level
                                            </span>

                                            <span
                                                className={
                                                    `triage-badge ${getTriageClass(
                                                        viewingEmergency.triage_level
                                                    )}`
                                                }
                                            >

                                                <span className="triage-dot" />

                                                {
                                                    viewingEmergency.triage_level ||
                                                    "Unknown"
                                                }

                                            </span>

                                        </div>


                                        <div>

                                            <span>
                                                Current Status
                                            </span>

                                            <span
                                                className={
                                                    `emergency-modal-status ${getStatusClass(
                                                        viewingEmergency.status
                                                    )}`
                                                }
                                            >

                                                {
                                                    viewingEmergency.status ||
                                                    "Waiting"
                                                }

                                            </span>

                                        </div>

                                    </div>


                                    {/* PATIENT */}

                                    <section className="emergency-modal-section">

                                        <div className="emergency-modal-section-heading">

                                            <UserRound
                                                size={17}
                                            />

                                            <div>

                                                <span>
                                                    Patient
                                                </span>

                                                <h3>
                                                    Patient Information
                                                </h3>

                                            </div>

                                        </div>


                                        <div className="emergency-modal-grid">


                                            <div className="emergency-modal-field">

                                                <span>
                                                    Patient Name
                                                </span>

                                                <strong>

                                                    {
                                                        getPatientDisplayName(
                                                            viewingEmergency
                                                        )
                                                    }

                                                </strong>

                                            </div>


                                            <div className="emergency-modal-field">

                                                <span>
                                                    Patient ID
                                                </span>

                                                <strong>

                                                    {
                                                        viewingEmergency.patient_id
                                                            ? `#${viewingEmergency.patient_id}`
                                                            : "Not registered"
                                                    }

                                                </strong>

                                            </div>


                                            <div className="emergency-modal-field">

                                                <span>
                                                    Patient Type
                                                </span>

                                                <strong>

                                                    {
                                                        viewingEmergency.patient_id
                                                            ? "Registered Patient"
                                                            : "Temporary / Unregistered"
                                                    }

                                                </strong>

                                            </div>

                                        </div>

                                    </section>


                                    {/* EMERGENCY */}

                                    <section className="emergency-modal-section">

                                        <div className="emergency-modal-section-heading">

                                            <ShieldAlert
                                                size={17}
                                            />

                                            <div>

                                                <span>
                                                    Emergency
                                                </span>

                                                <h3>
                                                    Case Information
                                                </h3>

                                            </div>

                                        </div>


                                        <div className="emergency-modal-grid">


                                            <div className="emergency-modal-field">

                                                <span>
                                                    Emergency Case ID
                                                </span>

                                                <strong>
                                                    {
                                                        viewingEmergency.emergency_id
                                                    }
                                                </strong>

                                            </div>


                                            <div className="emergency-modal-field">

                                                <span>
                                                    Triage Level
                                                </span>

                                                <strong>
                                                    {
                                                        viewingEmergency.triage_level ||
                                                        "Unknown"
                                                    }
                                                </strong>

                                            </div>


                                            <div className="emergency-modal-field">

                                                <span>
                                                    Arrival Time
                                                </span>

                                                <strong>
                                                    {
                                                        formatDateTime(
                                                            viewingEmergency.arrival_time
                                                        )
                                                    }
                                                </strong>

                                            </div>

                                        </div>

                                    </section>


                                    {/* DOCTOR */}

                                    <section className="emergency-modal-section">

                                        <div className="emergency-modal-section-heading">

                                            <Stethoscope
                                                size={17}
                                            />

                                            <div>

                                                <span>
                                                    Medical Team
                                                </span>

                                                <h3>
                                                    Assigned Doctor
                                                </h3>

                                            </div>

                                        </div>


                                        <div className="emergency-modal-grid">


                                            <div className="emergency-modal-field">

                                                <span>
                                                    Doctor
                                                </span>

                                                <strong>

                                                    {
                                                        viewingEmergency.doctor_name ||
                                                        (
                                                            viewingEmergency.assigned_doctor
                                                                ? `Doctor #${viewingEmergency.assigned_doctor}`
                                                                : "Unassigned"
                                                        )
                                                    }

                                                </strong>

                                            </div>


                                            <div className="emergency-modal-field">

                                                <span>
                                                    Doctor ID
                                                </span>

                                                <strong>

                                                    {
                                                        viewingEmergency.assigned_doctor
                                                            ? `#${viewingEmergency.assigned_doctor}`
                                                            : "—"
                                                    }

                                                </strong>

                                            </div>


                                            <div className="emergency-modal-field">

                                                <span>
                                                    Specialization
                                                </span>

                                                <strong>

                                                    {
                                                        viewingEmergency.specialization ||
                                                        "—"
                                                    }

                                                </strong>

                                            </div>

                                        </div>

                                    </section>


                                    {/* NOTES */}

                                    <section className="emergency-modal-section">

                                        <div className="emergency-modal-section-heading">

                                            <FileText
                                                size={17}
                                            />

                                            <div>

                                                <span>
                                                    Clinical Notes
                                                </span>

                                                <h3>
                                                    Emergency Notes
                                                </h3>

                                            </div>

                                        </div>


                                        <div className="emergency-modal-notes">

                                            {
                                                viewingEmergency.emergency_notes ||
                                                "No emergency notes recorded."
                                            }

                                        </div>

                                    </section>


                                </div>

                            )}


                        {/* MODAL FOOTER */}

                        {!viewLoading &&
                            !viewError &&
                            viewingEmergency && (

                                <div className="emergency-modal-footer">

                                    <span>

                                        Case #
                                        {
                                            viewingEmergency.emergency_id
                                        }

                                        {" • "}

                                        {
                                            viewingEmergency.status ||
                                            "Waiting"
                                        }

                                    </span>


                                    <div className="emergency-modal-footer-actions">

                                        <button
                                            type="button"
                                            className="emergency-modal-print-btn"
                                            onClick={
                                                handlePrintEmergency
                                            }
                                        >

                                            <FileText
                                                size={16}
                                            />

                                            Print Emergency

                                        </button>


                                        <button
                                            type="button"
                                            className="emergency-modal-footer-btn"
                                            onClick={
                                                handleCloseView
                                            }
                                        >

                                            Close

                                        </button>

                                    </div>

                                </div>

                            )}

                    </div>

                </div>

            )}

        </div>

    );

}


export default Emergency;