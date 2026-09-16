import PrintHeader from "./PrintHeader";

import {
    formatAppointmentId,
    formatPatientId,
    formatDoctorId,
} from "../../utils/hospitalIds";


function PrintAppointment({
    appointment = {},

    hospitalName = "Hospital Management System",
    hospitalAddress = "Nigeria",
    hospitalPhone = "",
    hospitalEmail = "",
}) {

    /* =========================================================
       FORMAT DATE
    ========================================================= */

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        const cleanDate =
            String(date).split("T")[0];

        const parsedDate =
            new Date(`${cleanDate}T00:00:00`);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return cleanDate;
        }

        return parsedDate.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );
    };


    /* =========================================================
       FORMAT TIME
    ========================================================= */

    const formatTime = (time) => {

        if (!time) {
            return "N/A";
        }

        const cleanTime =
            String(time).slice(0, 5);

        const [hours, minutes] =
            cleanTime.split(":");

        const hour =
            Number(hours);

        if (
            Number.isNaN(hour) ||
            minutes === undefined
        ) {
            return String(time);
        }

        const suffix =
            hour >= 12
                ? "PM"
                : "AM";

        const displayHour =
            hour % 12 || 12;

        return `${displayHour}:${minutes} ${suffix}`;
    };


    /* =========================================================
       PATIENT NAME
    ========================================================= */

    const getPatientName = () => {

        if (appointment.patient_name) {
            return appointment.patient_name;
        }

        if (
            appointment.first_name ||
            appointment.last_name
        ) {
            return [
                appointment.first_name,
                appointment.last_name,
            ]
                .filter(Boolean)
                .join(" ");
        }

        return "Patient";
    };


    /* =========================================================
       DOCTOR NAME
    ========================================================= */

    const getDoctorName = () => {

        if (appointment.doctor_name) {
            return appointment.doctor_name;
        }

        if (
            appointment.doctor_first_name ||
            appointment.doctor_last_name
        ) {
            return [
                appointment.doctor_first_name,
                appointment.doctor_last_name,
            ]
                .filter(Boolean)
                .join(" ");
        }

        return "Doctor";
    };


    /* =========================================================
       STATUS
    ========================================================= */

    const getStatusClass = (status) => {

        return String(
            status || "Scheduled"
        )
            .toLowerCase()
            .replace(/\s+/g, "-");
    };


    /* =========================================================
       DATA
    ========================================================= */

    const patientName =
        getPatientName();

    const doctorName =
        getDoctorName();

    const status =
        appointment.status ||
        "Scheduled";

    const appointmentNumber =
        formatAppointmentId(
            appointment.appointment_id ??
            appointment.id
        );

    const patientNumber =
        appointment.patient_number ||
        formatPatientId(
            appointment.patient_id
        );

    const doctorNumber =
        appointment.doctor_number ||
        formatDoctorId(
            appointment.doctor_id
        );

    const appointmentDate =
        formatDate(
            appointment.appointment_date
        );

    const appointmentTime =
        formatTime(
            appointment.appointment_time
        );


    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="print-document print-appointment">

            {/* =================================================
                HEADER
            ================================================= */}

            <PrintHeader
                hospitalName={hospitalName}
                hospitalAddress={hospitalAddress}
                hospitalPhone={hospitalPhone}
                hospitalEmail={hospitalEmail}
                documentTitle="Appointment Confirmation"
                documentSubtitle="Patient Appointment Record"
            />


            {/* =================================================
                CONFIRMATION BANNER
            ================================================= */}

            <section className="appointment-confirmation-banner">

                <div className="appointment-confirmation-icon">
                    ✓
                </div>

                <div className="appointment-confirmation-content">

                    <span>
                        APPOINTMENT CONFIRMATION
                    </span>

                    <h2>
                        Your appointment has been scheduled
                    </h2>

                    <p>
                        Please keep this document for
                        your hospital visit.
                    </p>

                </div>


                <div
                    className={`appointment-confirmation-status print-status print-status-${getStatusClass(
                        status
                    )}`}
                >

                    <span className="print-status-dot" />

                    {status}

                </div>

            </section>


            {/* =================================================
                APPOINTMENT HERO
            ================================================= */}

            <section className="appointment-hero-card">

                <div className="appointment-hero-main">

                    <span>
                        Appointment Date
                    </span>

                    <strong>
                        {appointmentDate}
                    </strong>

                </div>


                <div className="appointment-hero-divider" />


                <div className="appointment-hero-main">

                    <span>
                        Appointment Time
                    </span>

                    <strong>
                        {appointmentTime}
                    </strong>

                </div>


                <div className="appointment-hero-number">

                    <span>
                        Appointment No.
                    </span>

                    <strong>
                        {appointmentNumber}
                    </strong>

                </div>

            </section>


            {/* =================================================
                PATIENT & DOCTOR
            ================================================= */}

            <section className="print-section">

                <div className="print-section-title">

                    <span>
                        Visit Participants
                    </span>

                    <h3>
                        Patient & Doctor
                    </h3>

                </div>


                <div className="appointment-participants-grid">

                    {/* PATIENT */}

                    <div className="appointment-participant-card">

                        <div className="appointment-participant-icon patient">
                            P
                        </div>

                        <div>

                            <span>
                                Patient
                            </span>

                            <strong>
                                {patientName}
                            </strong>

                            <small>
                                Hospital No.{" "}
                                {patientNumber}
                            </small>

                        </div>

                    </div>


                    {/* DOCTOR */}

                    <div className="appointment-participant-card">

                        <div className="appointment-participant-icon doctor">
                            D
                        </div>

                        <div>

                            <span>
                                Attending Doctor
                            </span>

                            <strong>
                                Dr. {doctorName}
                            </strong>

                            {appointment.specialization && (
                                <small>
                                    {appointment.specialization}
                                </small>
                            )}

                            {doctorNumber && (
                                <small>
                                    Doctor No.{" "}
                                    {doctorNumber}
                                </small>
                            )}

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                VISIT INFORMATION
            ================================================= */}

            <section className="print-section">

                <div className="print-section-title">

                    <span>
                        Visit Information
                    </span>

                    <h3>
                        Appointment Details
                    </h3>

                </div>


                <div className="appointment-details-grid">

                    <div className="appointment-detail-card">

                        <span>
                            Date
                        </span>

                        <strong>
                            {appointmentDate}
                        </strong>

                    </div>


                    <div className="appointment-detail-card">

                        <span>
                            Time
                        </span>

                        <strong>
                            {appointmentTime}
                        </strong>

                    </div>


                    <div className="appointment-detail-card">

                        <span>
                            Status
                        </span>

                        <strong>
                            {status}
                        </strong>

                    </div>


                    <div className="appointment-detail-card">

                        <span>
                            Created
                        </span>

                        <strong>
                            {formatDate(
                                appointment.created_at
                            )}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                REASON
            ================================================= */}

            <section className="print-section">

                <div className="print-section-title">

                    <span>
                        Visit Information
                    </span>

                    <h3>
                        Reason for Appointment
                    </h3>

                </div>


                <div className="appointment-reason-box">

                    <span>
                        Purpose of Visit
                    </span>

                    <p>
                        {appointment.reason
                            ? appointment.reason
                            : "No reason was provided for this appointment."
                        }
                    </p>

                </div>

            </section>


            {/* =================================================
                RECORD IDENTIFICATION
            ================================================= */}

            <section className="print-section">

                <div className="print-section-title">

                    <span>
                        Record Information
                    </span>

                    <h3>
                        Hospital References
                    </h3>

                </div>


                <div className="appointment-reference-grid">

                    <div>

                        <span>
                            Appointment No.
                        </span>

                        <strong>
                            {appointmentNumber}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Patient No.
                        </span>

                        <strong>
                            {patientNumber}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Doctor No.
                        </span>

                        <strong>
                            {doctorNumber}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                IMPORTANT NOTICE
            ================================================= */}

            <section className="appointment-notice">

                <div className="appointment-notice-icon">
                    !
                </div>

                <div>

                    <strong>
                        Important Notice
                    </strong>

                    <p>
                        Please arrive at the hospital
                        before your scheduled appointment
                        time. Bring your identification,
                        relevant medical records,
                        prescriptions, laboratory results,
                        and any other documents required
                        for your visit.
                    </p>

                </div>

            </section>


            {/* =================================================
                SIGNATURES
            ================================================= */}

            <section className="appointment-signature-section">

                <div className="appointment-signature-box">

                    <div className="appointment-signature-line" />

                    <span>
                        Patient / Representative
                    </span>

                </div>


                <div className="appointment-signature-box">

                    <div className="appointment-signature-line" />

                    <span>
                        Hospital Representative
                    </span>

                </div>

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="print-document-footer">

                <div>

                    <strong>
                        {hospitalName}
                    </strong>

                    <span>
                        Appointment Confirmation
                    </span>

                </div>


                <div>

                    <span>
                        Appointment No.
                    </span>

                    <strong>
                        {appointmentNumber}
                    </strong>

                </div>


                <div>

                    <span>
                        Printed
                    </span>

                    <strong>
                        {formatDate(new Date())}
                    </strong>

                </div>

            </footer>

        </div>
    );
}


export default PrintAppointment;