import { useEffect, useState } from "react";

import {
    Users,
    Stethoscope,
    CalendarDays,
    Banknote,
    UserPlus,
    CalendarPlus,
    FilePlus2,
    Pill,
    ArrowUpRight,
    Clock3,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

import { getDashboardStats } from "../services/dashboardService";
import { getAppointments } from "../services/appointmentService";


function Dashboard() {

    const navigate = useNavigate();


    /* ==========================================
       LOGGED-IN USER
    ========================================== */

    const [currentUser, setCurrentUser] = useState({
        username: "User",
        role: "staff",
    });


    /* ==========================================
       DASHBOARD STATISTICS
    ========================================== */

    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        appointments: 0,
        revenue: 0,
    });


    /* ==========================================
       TODAY'S APPOINTMENTS
    ========================================== */

    const [todayAppointments, setTodayAppointments] =
        useState([]);

    const [appointmentsLoading, setAppointmentsLoading] =
        useState(true);


    /* ==========================================
       LOAD USER
    ========================================== */

const loadDashboard = async () => {

        try {

            const data =
                await getDashboardStats();


            setStats(data);

        } catch (error) {

            console.error(
                "Failed to load dashboard:",
                error
            );

        }

    };

const getLocalDateString = () => {

        const now = new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                now.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;

    };

const normalizeAppointmentDate = (
        date
    ) => {

        if (!date) {

            return "";

        }


        if (
            typeof date !== "string"
        ) {

            return "";

        }


        /*
        Handles:

        2026-08-20

        2026-08-20T10:00:00.000Z

        2026-08-20 10:00:00
        */

        return date
            .trim()
            .split("T")[0]
            .split(" ")[0];

    };

const loadTodayAppointments = async () => {

        try {

            setAppointmentsLoading(true);


            const data =
                await getAppointments();


            const appointments =
                Array.isArray(
                    data?.appointments
                )
                    ? data.appointments
                    : [];


            /*
            Local hospital date.
            */

            const today =
                getLocalDateString();


            /*
            Filter today's appointments.
            */

            const filteredAppointments =
                appointments
                    .filter((appointment) => {

                        const appointmentDate =
                            normalizeAppointmentDate(
                                appointment.appointment_date
                            );


                        return (
                            appointmentDate ===
                            today
                        );

                    })
                    .sort((a, b) => {

                        const timeA =
                            a.appointment_time ||
                            "00:00";

                        const timeB =
                            b.appointment_time ||
                            "00:00";


                        return timeA.localeCompare(
                            timeB
                        );

                    });


            setTodayAppointments(
                filteredAppointments
            );


        } catch (error) {

            console.error(
                "Failed to load today's appointments:",
                error
            );


            setTodayAppointments([]);

        } finally {

            setAppointmentsLoading(false);

        }

    };

    useEffect(() => {

        const storedUser =
            localStorage.getItem("user");


        if (storedUser) {

            try {

                const user =
                    JSON.parse(storedUser);


                setCurrentUser({

                    username:
                        user.username ||
                        "User",

                    role:
                        user.role ||
                        "staff",

                });


            } catch (error) {

                console.error(
                    "Failed to load user:",
                    error
                );

            }

        }

    }, []);


    /* ==========================================
       LOAD DASHBOARD
    ========================================== */

    useEffect(() => {

        loadDashboard();

        loadTodayAppointments();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    /* ==========================================
       LOAD DASHBOARD STATS
    ========================================== */

    


    /* ==========================================
       GET LOCAL DATE
       
       Important:
       We intentionally do NOT use
       toISOString() because that converts
       the date to UTC.
    ========================================== */

    


    /* ==========================================
       NORMALIZE APPOINTMENT DATE
    ========================================== */

    


    /* ==========================================
       LOAD TODAY'S APPOINTMENTS
    ========================================== */

    


    /* ==========================================
       FORMAT ROLE
    ========================================== */

    const formatRole = (role) => {

        if (!role) {

            return "Staff";

        }


        return (
            role.charAt(0).toUpperCase() +
            role.slice(1)
        );

    };


    /* ==========================================
       FORMAT APPOINTMENT TIME
    ========================================== */

    const formatAppointmentTime = (
        time
    ) => {

        if (!time) {

            return "Time not set";

        }


        const [hours, minutes] =
            time.split(":");


        const date =
            new Date();


        date.setHours(
            Number(hours),
            Number(minutes),
            0,
            0
        );


        return date.toLocaleTimeString(
            "en-NG",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }
        );

    };


    /* ==========================================
       STATISTICS
    ========================================== */

    const statCards = [

        {
            title:
                "Total Patients",

            value:
                stats.patients,

            icon:
                Users,

            description:
                "Registered patients",

            path:
                "/patients",
        },


        {
            title:
                "Doctors",

            value:
                stats.doctors,

            icon:
                Stethoscope,

            description:
                "Registered doctors",

            path:
                "/doctors",
        },


        {
            title:
                "Appointments",

            value:
                stats.appointments,

            icon:
                CalendarDays,

            description:
                "Total appointments",

            path:
                "/appointments",
        },


        {
            title:
                "Revenue",

            value:
                `₦${Number(
                    stats.revenue
                ).toLocaleString()}`,

            icon:
                Banknote,

            description:
                "Total recorded revenue",

            path:
                "/billing",
        },

    ];


    /* ==========================================
       QUICK ACTIONS
    ========================================== */

    const quickActions = [

        {
            title:
                "Register Patient",

            description:
                "Add a new patient",

            icon:
                UserPlus,

            path:
                "/patients",
        },


        {
            title:
                "Book Appointment",

            description:
                "Schedule an appointment",

            icon:
                CalendarPlus,

            path:
                "/appointments",
        },


        {
            title:
                "Medical Record",

            description:
                "Create a medical record",

            icon:
                FilePlus2,

            path:
                "/medical-records",
        },


        {
            title:
                "Medicines",

            description:
                "Manage medicines",

            icon:
                Pill,

            path:
                "/medicines",
        },

    ];


    /* ==========================================
       RENDER
    ========================================== */

    return (

        <div className="hms-page dashboard-page">


            {/* ======================================
                WELCOME SECTION
            ====================================== */}

            <section className="dashboard-welcome">

                <div>

                    <p className="dashboard-eyebrow">
                        Hospital Overview
                    </p>


                    <h1>

                        Welcome back,{" "}

                        {currentUser.username}

                        {" "}👋

                    </h1>


                    <p className="dashboard-subtitle">

                        Here's what's happening
                        across the hospital today.

                    </p>


                    <span className="dashboard-role">

                        {formatRole(
                            currentUser.role
                        )}

                    </span>

                </div>


                <div className="dashboard-date">

                    <Clock3 size={17} />

                    <span>
                        Today's Overview
                    </span>

                </div>

            </section>


            {/* ======================================
                STATISTICS
            ====================================== */}

            <section className="stats-grid">

                {statCards.map((stat) => {

                    const Icon =
                        stat.icon;


                    return (

                        <button
                            className="stat-card"
                            key={stat.title}
                            type="button"
                            onClick={() =>
                                navigate(
                                    stat.path
                                )
                            }
                        >

                            <div className="stat-card-top">

                                <div className="stat-icon">

                                    <Icon size={21} />

                                </div>


                                <ArrowUpRight
                                    size={17}
                                    className="stat-arrow"
                                />

                            </div>


                            <div className="stat-card-content">

                                <span className="stat-title">

                                    {stat.title}

                                </span>


                                <strong className="stat-value">

                                    {stat.value}

                                </strong>


                                <span className="stat-description">

                                    {stat.description}

                                </span>

                            </div>

                        </button>

                    );

                })}

            </section>


            {/* ======================================
                DASHBOARD GRID
            ====================================== */}

            <section className="dashboard-grid">


                {/* ==================================
                    TODAY'S APPOINTMENTS
                ================================== */}

                <div className="dashboard-panel appointments-panel">

                    <div className="panel-header">

                        <div>

                            <h2>
                                Today's Appointments
                            </h2>

                            <p>
                                Your upcoming schedule
                            </p>

                        </div>


                        <button
                            className="panel-link"
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/appointments"
                                )
                            }
                        >

                            View all

                            <ArrowUpRight
                                size={15}
                            />

                        </button>

                    </div>


                    <div className="today-appointments">

                        {appointmentsLoading ? (

                            <div className="appointments-dashboard-loading">

                                <div className="dashboard-loading-spinner"></div>

                                <p>
                                    Loading today's appointments...
                                </p>

                            </div>

                        ) : todayAppointments.length === 0 ? (

                            <div className="appointments-dashboard-empty">

                                <div className="appointments-empty-icon">

                                    <CalendarDays
                                        size={25}
                                    />

                                </div>


                                <h3>
                                    No appointments today
                                </h3>


                                <p>
                                    Your schedule is clear for today.
                                </p>


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/appointments"
                                        )
                                    }
                                >
                                    Schedule Appointment
                                </button>

                            </div>

                        ) : (

                            <div className="appointment-list">

                                {todayAppointments
                                    .slice(0, 5)
                                    .map(
                                        (
                                            appointment
                                        ) => (

                                            <div
                                                className="dashboard-appointment"
                                                key={
                                                    appointment.appointment_id ??
                                                    appointment.id
                                                }
                                            >

                                                <div className="appointment-time">

                                                    <Clock3
                                                        size={15}
                                                    />

                                                    <span>

                                                        {formatAppointmentTime(
                                                            appointment.appointment_time
                                                        )}

                                                    </span>

                                                </div>


                                                <div className="appointment-patient">

                                                    <div className="appointment-patient-avatar">

                                                        {appointment
                                                            .patient_name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                            "P"}

                                                    </div>


                                                    <div>

                                                        <strong>

                                                            {
                                                                appointment.patient_name ||
                                                                "Unknown Patient"
                                                            }

                                                        </strong>


                                                        <span>

                                                            Dr.{" "}

                                                            {
                                                                appointment.doctor_name ||
                                                                "Unknown Doctor"
                                                            }

                                                            {" • "}

                                                            {
                                                                appointment.specialization ||
                                                                "General"
                                                            }

                                                        </span>

                                                    </div>

                                                </div>


                                                <span
                                                    className={`dashboard-appointment-status ${(
                                                        appointment.status ||
                                                        "Scheduled"
                                                    )
                                                        .toLowerCase()
                                                        .replace(
                                                            /\s+/g,
                                                            "-"
                                                        )}`}
                                                >

                                                    {
                                                        appointment.status ||
                                                        "Scheduled"
                                                    }

                                                </span>

                                            </div>

                                        )
                                    )}

                            </div>

                        )}

                    </div>

                </div>


                {/* ==================================
                    QUICK ACTIONS
                ================================== */}

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <div>

                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Common hospital tasks
                            </p>

                        </div>

                    </div>


                    <div className="quick-actions">

                        {quickActions.map(
                            (action) => {

                                const Icon =
                                    action.icon;


                                return (

                                    <button
                                        className="quick-action"
                                        key={
                                            action.title
                                        }
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                action.path
                                            )
                                        }
                                    >

                                        <div className="quick-action-icon">

                                            <Icon size={19} />

                                        </div>


                                        <div className="quick-action-text">

                                            <strong>

                                                {
                                                    action.title
                                                }

                                            </strong>


                                            <span>

                                                {
                                                    action.description
                                                }

                                            </span>

                                        </div>


                                        <ArrowUpRight
                                            size={16}
                                            className="quick-action-arrow"
                                        />

                                    </button>

                                );

                            }
                        )}

                    </div>

                </div>

            </section>


            {/* ======================================
                RECENT ACTIVITY
            ====================================== */}

            <section className="dashboard-panel activity-panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            Recent Activity
                        </h2>

                        <p>
                            Latest activity across
                            the hospital
                        </p>

                    </div>

                </div>


                <div className="activity-empty">

                    <div className="activity-empty-icon">

                        <Clock3 size={22} />

                    </div>


                    <div>

                        <strong>
                            Activity tracking
                        </strong>


                        <p>
                            Recent hospital activity
                            will appear here as the
                            system is used.
                        </p>

                    </div>

                </div>

            </section>


        </div>

    );

}


export default Dashboard;