import { confirmAction } from "../components/ConfirmDialog";
import { showToast } from "../utils/notificationService";

import { useEffect, useState } from "react";

import {
    CalendarDays,
    CalendarPlus,
    Clock3,
    CheckCircle2,
    XCircle,
    Pencil,
    Trash2,
    Check,
    UserRound,
    Stethoscope,
    Printer,
    ArrowUpRight
} from "lucide-react";

import {
    getAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    completeAppointment
} from "../services/appointmentService";

import { printAppointment } from "../services/printService";

import AddAppointmentForm from "../components/AddAppointmentForm";

import "./Appointments.css";
import { formatAppointmentId } from "../utils/hospitalIds";


/*
==================================================
HOSPITAL MANAGEMENT SYSTEM — APPOINTMENTS
==================================================

Responsibilities:

• View appointments
• Schedule appointments
• Edit appointments
• Complete appointments
• Delete appointments
• Print appointment confirmations
• Show post-creation print action

==================================================
*/


function Appointments() {


    /*
    ==================================================
    STATE
    ==================================================
    */

    const [appointments, setAppointments] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editingAppointment, setEditingAppointment] = useState(null);

    const [loading, setLoading] = useState(true);

    const [createdAppointment, setCreatedAppointment] = useState(null);

    const [showCreatedSuccess, setShowCreatedSuccess] = useState(false);

    const [printing, setPrinting] = useState(false);


    /*
    ==================================================
    LOAD APPOINTMENTS
    ==================================================
    */

const loadAppointments = async () => {

        try {

            setLoading(true);

            const data = await getAppointments();

            setAppointments(
                Array.isArray(data?.appointments)
                    ? data.appointments
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load appointments:",
                error
            );

            setAppointments([]);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadAppointments();

        const handleSyncComplete = () => {
            loadAppointments();
        };

        const handleOnline = () => {
            loadAppointments();
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
    SAVE APPOINTMENT
    ==================================================
    */

    const handleSaveAppointment = async (appointment) => {

        try {

            /*
            ==========================================
            UPDATE
            ==========================================
            */

            if (editingAppointment) {

                await updateAppointment(
                    editingAppointment.appointment_id,
                    appointment
                );

                showToast("Appointment updated successfully.");

                setShowForm(false);

                setEditingAppointment(null);

                await loadAppointments();

                return;
            }


            /*
            ==========================================
            CREATE
            ==========================================
            */

            const created = await createAppointment(
                appointment
            );


            /*
            The service may return:

            {
                appointment: {...}
            }

            OR

            {
                data: {
                    appointment: {...}
                }
            }

            OR the appointment object directly.

            Normalize all supported shapes.
            */

            const newAppointment =
                created?.appointment ||
                created?.data?.appointment ||
                created?.data ||
                created ||
                appointment;


            /*
            ==========================================
            CLOSE FORM
            ==========================================
            */

            setShowForm(false);

            setEditingAppointment(null);


            /*
            ==========================================
            STORE CREATED APPOINTMENT
            ==========================================
            */

            setCreatedAppointment(
                newAppointment
            );

            setShowCreatedSuccess(true);


            /*
            ==========================================
            REFRESH LIST
            ==========================================
            */

            await loadAppointments();

        } catch (error) {

            console.error(
                "Failed to save appointment:",
                error
            );

            showToast(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to save appointment."
            );

        }

    };


    /*
    ==================================================
    EDIT
    ==================================================
    */

    const handleEdit = (appointment) => {

        setEditingAppointment(appointment);

        setShowForm(true);

    };


    /*
    ==================================================
    DELETE
    ==================================================
    */

    const handleDelete = async (appointment) => {

        const appointmentId =
            appointment.appointment_id ??
            appointment.id;


        if (!appointmentId) {

            showToast("Unable to identify this appointment.");

            return;

        }


        const confirmed = await confirmAction({
            title: "Delete appointment?",
            message: "Are you sure you want to delete this appointment? This action cannot be undone.",
            confirmText: "Delete appointment",
        });


        if (!confirmed) {

            return;

        }


        try {

            await deleteAppointment(
                appointmentId
            );

            showToast(
                "Appointment deleted successfully."
            );

            await loadAppointments();

        } catch (error) {

            console.error(
                "Failed to delete appointment:",
                error
            );

            showToast(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to delete appointment."
            );

        }

    };


    /*
    ==================================================
    COMPLETE
    ==================================================
    */

    const handleComplete = async (appointment) => {

        const appointmentId =
            appointment.appointment_id ??
            appointment.id;


        if (!appointmentId) {

            showToast("Unable to identify this appointment.");

            return;

        }


        try {

            await completeAppointment(
                appointmentId
            );

            showToast(
                "Appointment marked as completed."
            );

            await loadAppointments();

        } catch (error) {

            console.error(
                "Failed to complete appointment:",
                error
            );

            showToast(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to complete appointment."
            );

        }

    };


    /*
    ==================================================
    PRINT APPOINTMENT
    ==================================================
    */

    const handlePrintAppointment = async (
        appointment
    ) => {

        if (!appointment) {

            showToast(
                "Appointment information is unavailable."
            );

            return;

        }


        try {

            setPrinting(true);

            await printAppointment(
                appointment
            );

        } catch (error) {

            console.error(
                "Failed to print appointment:",
                error
            );

            showToast(
                "Unable to print this appointment."
            );

        } finally {

            setPrinting(false);

        }

    };


    /*
    ==================================================
    PRINT NEWLY CREATED APPOINTMENT
    ==================================================
    */

    const handlePrintCreatedAppointment = async () => {

        if (!createdAppointment) {

            return;

        }


        await handlePrintAppointment(
            createdAppointment
        );

    };


    /*
    ==================================================
    CLOSE SUCCESS PANEL
    ==================================================
    */

    const handleCloseCreatedSuccess = () => {

        setShowCreatedSuccess(false);

        setCreatedAppointment(null);

    };


    /*
    ==================================================
    OPEN CREATE FORM
    ==================================================
    */

    const openCreateForm = () => {

        setEditingAppointment(null);

        setShowForm(true);

    };


    /*
    ==================================================
    CLOSE FORM
    ==================================================
    */

    const closeForm = () => {

        setShowForm(false);

        setEditingAppointment(null);

    };


    /*
    ==================================================
    STATUS CLASS
    ==================================================
    */

    const getStatusClass = (status) => {

        return String(
            status || "Scheduled"
        )
            .toLowerCase()
            .replace(/\s+/g, "-");

    };


    /*
    ==================================================
    DATE FORMAT
    ==================================================
    */

    const formatDate = (date) => {

        if (!date) {

            return "N/A";

        }


        const parsedDate = new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "N/A";

        }


        return parsedDate.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    /*
    ==================================================
    TIME FORMAT
    ==================================================
    */

    const formatTime = (time) => {

        if (!time) {

            return "N/A";

        }


        const parts =
            String(time).split(":");


        if (
            parts.length < 2
        ) {

            return String(time);

        }


        const date = new Date();

        date.setHours(
            Number(parts[0]),
            Number(parts[1]),
            0,
            0
        );


        return date.toLocaleTimeString(
            "en-NG",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    /*
    ==================================================
    STATISTICS
    ==================================================
    */

    const totalAppointments =
        appointments.length;


    const scheduledAppointments =
        appointments.filter(
            appointment =>
                String(
                    appointment.status
                ).toLowerCase() === "scheduled"
        ).length;


    const completedAppointments =
        appointments.filter(
            appointment =>
                String(
                    appointment.status
                ).toLowerCase() === "completed"
        ).length;


    const cancelledAppointments =
        appointments.filter(
            appointment =>
                String(
                    appointment.status
                ).toLowerCase() === "cancelled"
        ).length;


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <div className="hms-page appointments-page">


            {/* =========================================
                PAGE HEADER
            ========================================= */}

            <div className="appointments-page-header">

                <div>

                    <div className="appointments-breadcrumb">

                        <span>
                            Hospital Management
                        </span>

                        <ArrowUpRight
                            size={14}
                        />

                        <span>
                            Appointments
                        </span>

                    </div>


                    <h1>
                        Appointments
                    </h1>


                    <p>
                        Manage patient consultations,
                        schedules, and appointment records.
                    </p>

                </div>


                <button
                    type="button"
                    className="add-appointment-btn"
                    onClick={openCreateForm}
                >

                    <CalendarPlus
                        size={18}
                    />

                    Schedule Appointment

                </button>

            </div>


            {/* =========================================
                STATISTICS
            ========================================= */}

            <div className="appointment-stats">


                <div className="appointment-stat-card">

                    <div className="appointment-stat-icon">

                        <CalendarDays
                            size={20}
                        />

                    </div>


                    <div>

                        <span>
                            Total Appointments
                        </span>

                        <strong>
                            {totalAppointments}
                        </strong>

                    </div>

                </div>


                <div className="appointment-stat-card">

                    <div className="appointment-stat-icon">

                        <Clock3
                            size={20}
                        />

                    </div>


                    <div>

                        <span>
                            Scheduled
                        </span>

                        <strong>
                            {scheduledAppointments}
                        </strong>

                    </div>

                </div>


                <div className="appointment-stat-card">

                    <div className="appointment-stat-icon">

                        <CheckCircle2
                            size={20}
                        />

                    </div>


                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>
                            {completedAppointments}
                        </strong>

                    </div>

                </div>


                <div className="appointment-stat-card">

                    <div className="appointment-stat-icon">

                        <XCircle
                            size={20}
                        />

                    </div>


                    <div>

                        <span>
                            Cancelled
                        </span>

                        <strong>
                            {cancelledAppointments}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =========================================
                APPOINTMENT FORM
            ========================================= */}

            {showForm && (

                <div className="appointment-form-container">

                    <AddAppointmentForm
                        appointment={
                            editingAppointment
                        }
                        onSave={
                            handleSaveAppointment
                        }
                        onCancel={
                            closeForm
                        }
                    />

                </div>

            )}


            {/* =========================================
                APPOINTMENT TABLE CARD
            ========================================= */}

            <div className="appointments-card">


                <div className="appointments-card-header">

                    <div>

                        <div className="appointments-card-title">

                            <CalendarDays
                                size={19}
                            />

                            <h2>
                                Appointment Schedule
                            </h2>

                        </div>


                        <p>
                            View and manage scheduled
                            patient consultations.
                        </p>

                    </div>


                    <span className="appointment-count">

                        {totalAppointments}

                        {
                            totalAppointments === 1
                                ? " appointment"
                                : " appointments"
                        }

                    </span>

                </div>


                {/* =====================================
                    LOADING
                ===================================== */}

                {loading ? (

                    <div className="appointments-loading">

                        <div className="appointment-loading-spinner" />

                        <span>
                            Loading appointments...
                        </span>

                    </div>

                ) : appointments.length === 0 ? (

                    /* =================================
                       EMPTY
                    ================================= */

                    <div className="appointments-empty">

                        <div className="appointments-empty-icon">

                            <CalendarDays
                                size={30}
                            />

                        </div>


                        <h3>
                            No appointments yet
                        </h3>


                        <p>
                            Schedule a patient consultation
                            to see it appear here.
                        </p>


                        <button
                            type="button"
                            className="appointments-empty-btn"
                            onClick={openCreateForm}
                        >

                            <CalendarPlus
                                size={17}
                            />

                            Schedule Appointment

                        </button>

                    </div>

                ) : (

                    /* =================================
                       TABLE
                    ================================= */

                    <div className="appointments-table-wrapper">

                        <table className="appointments-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Patient
                                    </th>

                                    <th>
                                        Doctor
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Time
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

                                {appointments.map(
                                    appointment => {

                                        const appointmentId =
                                            appointment.appointment_id ??
                                            appointment.id;


                                        const status =
                                            appointment.status ||
                                            "Scheduled";


                                        const statusClass =
                                            getStatusClass(
                                                status
                                            );


                                        return (

                                            <tr
                                                key={
                                                    appointmentId
                                                }
                                            >


                                                {/* ID */}

                                                <td>

                                                    <span className="appointment-id">

                                                        {formatAppointmentId(appointmentId)}

                                                    </span>

                                                </td>


                                                {/* PATIENT */}

                                                <td>

                                                    <div className="appointment-person">

                                                        <div className="appointment-person-icon patient">

                                                            <UserRound
                                                                size={16}
                                                            />

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    appointment.patient_name ||
                                                                    "Patient"
                                                                }
                                                            </strong>

                                                            <span>
                                                                Patient
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* DOCTOR */}

                                                <td>

                                                    <div className="appointment-person">

                                                        <div className="appointment-person-icon doctor">

                                                            <Stethoscope
                                                                size={16}
                                                            />

                                                        </div>


                                                        <div>

                                                            <strong>

                                                                {
                                                                    appointment.doctor_name
                                                                        ? `Dr. ${appointment.doctor_name}`
                                                                        : "Doctor"
                                                                }

                                                            </strong>


                                                            <span>

                                                                {
                                                                    appointment.specialization ||
                                                                    "Medical Practitioner"
                                                                }

                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* DATE */}

                                                <td>

                                                    <div className="appointment-date-cell">

                                                        <CalendarDays
                                                            size={16}
                                                        />

                                                        <span>

                                                            {
                                                                formatDate(
                                                                    appointment.appointment_date
                                                                )
                                                            }

                                                        </span>

                                                    </div>

                                                </td>


                                                {/* TIME */}

                                                <td>

                                                    <div className="appointment-time-cell">

                                                        <Clock3
                                                            size={16}
                                                        />

                                                        <span>

                                                            {
                                                                formatTime(
                                                                    appointment.appointment_time
                                                                )
                                                            }

                                                        </span>

                                                    </div>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`appointment-status appointment-status-${statusClass}`}
                                                    >

                                                        <span className="appointment-status-dot" />

                                                        {
                                                            status
                                                        }

                                                    </span>

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="appointment-actions">


                                                        {/* PRINT */}

                                                        <button
                                                            type="button"
                                                            className="appointment-print-btn"
                                                            onClick={() =>
                                                                handlePrintAppointment(
                                                                    appointment
                                                                )
                                                            }
                                                            disabled={
                                                                printing
                                                            }
                                                            title="Print appointment"
                                                            aria-label="Print appointment"
                                                        >

                                                            <Printer
                                                                size={16}
                                                            />

                                                        </button>


                                                        {/* EDIT */}

                                                        <button
                                                            type="button"
                                                            className="appointment-edit-btn"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    appointment
                                                                )
                                                            }
                                                            title="Edit appointment"
                                                            aria-label="Edit appointment"
                                                        >

                                                            <Pencil
                                                                size={16}
                                                            />

                                                        </button>


                                                        {/* COMPLETE */}

                                                        {
                                                            statusClass ===
                                                                "scheduled" && (

                                                                <button
                                                                    type="button"
                                                                    className="appointment-complete-btn"
                                                                    onClick={() =>
                                                                        handleComplete(
                                                                            appointment
                                                                        )
                                                                    }
                                                                    title="Complete appointment"
                                                                    aria-label="Complete appointment"
                                                                >

                                                                    <Check
                                                                        size={16}
                                                                    />

                                                                </button>

                                                            )
                                                        }


                                                        {/* DELETE */}

                                                        <button
                                                            type="button"
                                                            className="appointment-delete-btn"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    appointment
                                                                )
                                                            }
                                                            title="Delete appointment"
                                                            aria-label="Delete appointment"
                                                        >

                                                            <Trash2
                                                                size={16}
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

            </div>


            {/* =========================================
                POST-CREATION SUCCESS PANEL
            ========================================= */}

            {showCreatedSuccess &&
                createdAppointment && (

                    <div
                        className="appointment-success-overlay"
                        onClick={
                            handleCloseCreatedSuccess
                        }
                    >

                        <div
                            className="appointment-success-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >


                            {/* SUCCESS ICON */}

                            <div className="appointment-success-icon">

                                <CheckCircle2
                                    size={32}
                                />

                            </div>


                            <div className="appointment-success-content">

                                <span className="appointment-success-eyebrow">
                                    Appointment Scheduled
                                </span>


                                <h2>
                                    Appointment created successfully
                                </h2>


                                <p>
                                    The patient's appointment
                                    has been added to the
                                    appointment schedule.
                                </p>

                            </div>


                            {/* APPOINTMENT SUMMARY */}

                            <div className="appointment-success-summary">


                                <div>

                                    <span>
                                        Patient
                                    </span>

                                    <strong>

                                        {
                                            createdAppointment.patient_name ||
                                            "Patient"
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Date
                                    </span>

                                    <strong>

                                        {
                                            formatDate(
                                                createdAppointment.appointment_date
                                            )
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Time
                                    </span>

                                    <strong>

                                        {
                                            formatTime(
                                                createdAppointment.appointment_time
                                            )
                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="appointment-success-actions">

                                <button
                                    type="button"
                                    className="appointment-success-done-btn"
                                    onClick={
                                        handleCloseCreatedSuccess
                                    }
                                >

                                    Done

                                </button>


                                <button
                                    type="button"
                                    className="appointment-success-print-btn"
                                    onClick={
                                        handlePrintCreatedAppointment
                                    }
                                    disabled={printing}
                                >

                                    <Printer
                                        size={17}
                                    />

                                    {
                                        printing
                                            ? "Preparing..."
                                            : "Print Appointment"
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>

    );

}


export default Appointments;