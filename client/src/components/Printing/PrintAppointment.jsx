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
    /* ==========================================
       FORMAT DATE
    ========================================== */

    const formatDate = (date) => {
        if (!date) return "N/A";

        const cleanDate = String(date).split("T")[0];

        const parsedDate = new Date(`${cleanDate}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return cleanDate;
        }

        return parsedDate.toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };


    /* ==========================================
       FORMAT TIME
    ========================================== */

    const formatTime = (time) => {
        if (!time) return "N/A";

        const cleanTime = String(time).slice(0, 5);

        const [hours, minutes] = cleanTime.split(":");

        const hour = Number(hours);

        if (
            Number.isNaN(hour) ||
            minutes === undefined
        ) {
            return String(time);
        }

        const suffix = hour >= 12 ? "PM" : "AM";

        const displayHour = hour % 12 || 12;

        return `${displayHour}:${minutes} ${suffix}`;
    };


    /* ==========================================
       GET PATIENT NAME
    ========================================== */

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


    /* ==========================================
       GET DOCTOR NAME
    ========================================== */

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


    /* ==========================================
       STATUS CLASS
    ========================================== */

    const getStatusClass = (status) => {
        return String(status || "Scheduled")
            .toLowerCase()
            .replace(/\s+/g, "-");
    };


    const patientName = getPatientName();
    const doctorName = getDoctorName();

    const status =
        appointment.status || "Scheduled";

    const appointmentNumber =
        formatAppointmentId(
            appointment.appointment_id ??
            appointment.id
        );

    const patientNumber =
        appointment.patient_number ||
        formatPatientId(appointment.patient_id);

    const doctorNumber =
        appointment.doctor_number ||
        formatDoctorId(appointment.doctor_id);


    /* ==========================================
       RENDER
    ========================================== */

    return (
        <div className="print-document print-appointment">

            {/* ======================================
                DOCUMENT HEADER
            ====================================== */}

            <PrintHeader
                hospitalName={hospitalName}
                hospitalAddress={hospitalAddress}
                hospitalPhone={hospitalPhone}
                hospitalEmail={hospitalEmail}
                documentTitle="Appointment Confirmation"
                documentSubtitle="Patient Appointment Record"
            />


            {/* ======================================
                APPOINTMENT OVERVIEW
            ====================================== */}

            <section className="print-section">

                <div className="print-section-heading">

                    <div>
                        <span>
                            Hospital Appointment
                        </span>

                        <h2>
                            Appointment Details
                        </h2>
                    </div>


                    <div
                        className={`print-status print-status-${getStatusClass(
                            status
                        )}`}
                    >

                        <span className="print-status-dot" />

                        {status}

                    </div>

                </div>


                <div className="print-info-grid">

                    {/* PATIENT */}

                    <div className="print-info-card">

                        <span className="print-label">
                            Patient
                        </span>

                        <strong>
                            {patientName}
                        </strong>

                    </div>


                    {/* DOCTOR */}

                    <div className="print-info-card">

                        <span className="print-label">
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

                    </div>


                    {/* DATE */}

                    <div className="print-info-card">

                        <span className="print-label">
                            Appointment Date
                        </span>

                        <strong>
                            {formatDate(
                                appointment.appointment_date
                            )}
                        </strong>

                    </div>


                    {/* TIME */}

                    <div className="print-info-card">

                        <span className="print-label">
                            Appointment Time
                        </span>

                        <strong>
                            {formatTime(
                                appointment.appointment_time
                            )}
                        </strong>

                    </div>

                </div>

            </section>


            {/* ======================================
                APPOINTMENT RECORD
            ====================================== */}

            <section className="print-section">

                <div className="print-section-title">

                    <span>
                        Record Information
                    </span>

                    <h3>
                        Appointment Summary
                    </h3>

                </div>


                <div className="print-details-table">

                    <div className="print-detail-row">

                        <span>
                            Appointment No.
                        </span>

                        <strong>
                            {appointmentNumber}
                        </strong>

                    </div>


                    <div className="print-detail-row">

                        <span>
                            Patient No.
                        </span>

                        <strong>
                            {patientNumber}
                        </strong>

                    </div>


                    <div className="print-detail-row">

                        <span>
                            Doctor No.
                        </span>

                        <strong>
                            {doctorNumber}
                        </strong>

                    </div>


                    <div className="print-detail-row">

                        <span>
                            Appointment Date
                        </span>

                        <strong>
                            {formatDate(
                                appointment.appointment_date
                            )}
                        </strong>

                    </div>


                    <div className="print-detail-row">

                        <span>
                            Appointment Time
                        </span>

                        <strong>
                            {formatTime(
                                appointment.appointment_time
                            )}
                        </strong>

                    </div>


                    <div className="print-detail-row">

                        <span>
                            Appointment Status
                        </span>

                        <strong>
                            {status}
                        </strong>

                    </div>


                    <div className="print-detail-row">

                        <span>
                            Record Created
                        </span>

                        <strong>
                            {formatDate(
                                appointment.created_at
                            )}
                        </strong>

                    </div>

                </div>

            </section>


            {/* ======================================
                IMPORTANT NOTICE
            ====================================== */}

            <section className="print-notice">

                <strong>
                    Important Notice
                </strong>

                <p>
                    Please arrive at the hospital before
                    your scheduled appointment time.
                    Patients should bring any relevant
                    medical records, prescriptions,
                    laboratory results, or identification
                    documents required for their visit.
                </p>

            </section>


            {/* ======================================
                SIGNATURES
            ====================================== */}

            <section className="print-signature-section">

                <div className="print-signature-box">

                    <div className="print-signature-line" />

                    <span>
                        Patient / Representative
                    </span>

                </div>


                <div className="print-signature-box">

                    <div className="print-signature-line" />

                    <span>
                        Hospital Representative
                    </span>

                </div>

            </section>


            {/* ======================================
                FOOTER
            ====================================== */}

            <footer className="print-document-footer">

                <span>
                    This document was generated by{" "}
                    {hospitalName}.
                </span>

                <span>
                    Appointment record •{" "}
                    {formatDate(new Date())}
                </span>

            </footer>

        </div>
    );
}


export default PrintAppointment;