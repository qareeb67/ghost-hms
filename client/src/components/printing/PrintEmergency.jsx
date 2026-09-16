import PrintHeader from "./PrintHeader";
import {
    formatEmergencyId,
    formatPatientId,
    formatDoctorId,
} from "../../utils/hospitalIds";

function PrintEmergency({
    emergency = {},
    patient = {},
    doctor = {},
    hospitalName = "Hospital Management System",
    hospitalAddress = "Nigeria",
    hospitalPhone = "",
    hospitalEmail = "",
}) {
    const displayValue = (value, fallback = "N/A") => {
        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ""
        ) {
            return fallback;
        }

        return String(value);
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "N/A";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return date.toLocaleString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (value) => {
        if (!value) {
            return "N/A";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return date.toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getPatientName = () => {
        const separatePatientName = [
            patient?.first_name,
            patient?.last_name,
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

        if (separatePatientName) {
            return separatePatientName;
        }

        if (emergency?.patient_name) {
            return emergency.patient_name;
        }

        if (emergency?.temporary_name) {
            return emergency.temporary_name;
        }

        return "Unknown Patient";
    };

    const getDoctorName = () => {
        const separateDoctorName = [
            doctor?.first_name,
            doctor?.last_name,
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

        if (separateDoctorName) {
            return separateDoctorName.startsWith("Dr.")
                ? separateDoctorName
                : `Dr. ${separateDoctorName}`;
        }

        if (emergency?.doctor_name) {
            const name = String(
                emergency.doctor_name
            ).trim();

            return name.startsWith("Dr.")
                ? name
                : `Dr. ${name}`;
        }

        if (emergency?.assigned_doctor) {
            return `Doctor No. ${formatDoctorId(
                emergency.assigned_doctor
            )}`;
        }

        return "Not assigned";
    };

    const emergencyId =
        emergency?.emergency_id ??
        emergency?.id;

    const emergencyNumber =
        formatEmergencyId(emergencyId);

    const patientName =
        getPatientName();

    const patientNumber =
        patient?.patient_number ||
        formatPatientId(
            patient?.patient_id ??
            patient?.id ??
            emergency?.patient_id
        );

    const doctorName =
        getDoctorName();

    const doctorId =
        emergency?.assigned_doctor ??
        doctor?.doctor_id ??
        doctor?.id;

    const doctorNumber =
        formatDoctorId(doctorId);

    const specialization =
        emergency?.specialization ??
        doctor?.specialization ??
        "N/A";

    const triageLevel =
        displayValue(
            emergency?.triage_level,
            "N/A"
        );

    const status =
        displayValue(
            emergency?.status,
            "Waiting"
        );

    const emergencyNotes =
        displayValue(
            emergency?.emergency_notes,
            "No emergency notes recorded."
        );

    const temporaryName =
        displayValue(
            emergency?.temporary_name,
            "Not provided"
        );

    const arrivalTime =
        formatDateTime(
            emergency?.arrival_time
        );

    const printedDate =
        formatDate(
            new Date()
        );

    return (
        <div className="print-document print-emergency">

            <PrintHeader
                hospitalName={hospitalName}
                hospitalAddress={hospitalAddress}
                hospitalPhone={hospitalPhone}
                hospitalEmail={hospitalEmail}
                documentTitle="Emergency Case Record"
                documentSubtitle="Emergency Department Clinical Record"
            />

            {/* =====================================================
                EMERGENCY CASE SUMMARY
            ====================================================== */}

            <section className="print-section">

                <div className="print-section-heading">

                    <h3>
                        Emergency Case Information
                    </h3>

                    <span className="print-record-id">
                        Case {emergencyNumber}
                    </span>

                </div>

                <div className="print-info-grid">

                    <div className="print-info-item">
                        <span>
                            Emergency No.
                        </span>

                        <strong>
                            #{emergencyNumber}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Arrival Time
                        </span>

                        <strong>
                            {arrivalTime}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Triage Level
                        </span>

                        <strong>
                            {triageLevel}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Current Status
                        </span>

                        <strong>
                            {status}
                        </strong>
                    </div>

                </div>

            </section>


            {/* =====================================================
                PATIENT INFORMATION
            ====================================================== */}

            <section className="print-section">

                <div className="print-section-heading">

                    <h3>
                        Patient Information
                    </h3>

                </div>

                <div className="print-info-grid">

                    <div className="print-info-item print-info-wide">
                        <span>
                            Patient Name
                        </span>

                        <strong>
                            {patientName}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Hospital Number
                        </span>

                        <strong>
                            {displayValue(
                                patientNumber
                            )}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Gender
                        </span>

                        <strong>
                            {displayValue(
                                patient?.gender
                            )}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Date of Birth
                        </span>

                        <strong>
                            {formatDate(
                                patient?.date_of_birth
                            )}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Phone
                        </span>

                        <strong>
                            {displayValue(
                                patient?.phone
                            )}
                        </strong>
                    </div>

                </div>

            </section>


            {/* =====================================================
                EMERGENCY PRESENTATION
            ====================================================== */}

            <section className="print-section">

                <div className="print-section-heading">

                    <h3>
                        Emergency Presentation
                    </h3>

                </div>

                <div className="print-detail-box">

                    <span>
                        Temporary / Emergency Name
                    </span>

                    <p>
                        {temporaryName}
                    </p>

                </div>

                <div className="print-detail-box">

                    <span>
                        Emergency Notes
                    </span>

                    <p className="print-preserve-text">
                        {emergencyNotes}
                    </p>

                </div>

            </section>


            {/* =====================================================
                CLINICAL ASSIGNMENT
            ====================================================== */}

            <section className="print-section">

                <div className="print-section-heading">

                    <h3>
                        Clinical Assignment
                    </h3>

                </div>

                <div className="print-info-grid">

                    <div className="print-info-item print-info-wide">
                        <span>
                            Assigned Doctor
                        </span>

                        <strong>
                            {doctorName}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Doctor No.
                        </span>

                        <strong>
                            {doctorNumber}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Specialization
                        </span>

                        <strong>
                            {displayValue(
                                specialization
                            )}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Triage
                        </span>

                        <strong>
                            {triageLevel}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Status
                        </span>

                        <strong>
                            {status}
                        </strong>
                    </div>

                </div>

            </section>


            {/* =====================================================
                PATIENT CLINICAL BACKGROUND
            ====================================================== */}

            {(patient?.allergies ||
                patient?.medical_history ||
                patient?.blood_group ||
                patient?.genotype) && (

                    <section className="print-section">

                        <div className="print-section-heading">

                            <h3>
                                Relevant Clinical Background
                            </h3>

                        </div>

                        <div className="print-info-grid">

                            <div className="print-info-item">
                                <span>
                                    Blood Group
                                </span>

                                <strong>
                                    {displayValue(
                                        patient?.blood_group
                                    )}
                                </strong>
                            </div>

                            <div className="print-info-item">
                                <span>
                                    Genotype
                                </span>

                                <strong>
                                    {displayValue(
                                        patient?.genotype
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div className="print-detail-box">

                            <span>
                                Allergies
                            </span>

                            <p className="print-preserve-text">
                                {displayValue(
                                    patient?.allergies,
                                    "No allergies recorded."
                                )}
                            </p>

                        </div>

                        <div className="print-detail-box">

                            <span>
                                Medical History
                            </span>

                            <p className="print-preserve-text">
                                {displayValue(
                                    patient?.medical_history,
                                    "No medical history recorded."
                                )}
                            </p>

                        </div>

                    </section>
                )}


            {/* =====================================================
                EMERGENCY STATUS SUMMARY
            ====================================================== */}

            <section className="print-section">

                <div className="print-section-heading">

                    <h3>
                        Emergency Status Summary
                    </h3>

                </div>

                <div className="print-info-grid">

                    <div className="print-info-item">
                        <span>
                            Case
                        </span>

                        <strong>
                            #{emergencyNumber}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Triage Level
                        </span>

                        <strong>
                            {triageLevel}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Current Status
                        </span>

                        <strong>
                            {status}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>
                            Assigned Doctor
                        </span>

                        <strong>
                            {doctorName}
                        </strong>
                    </div>

                </div>

            </section>


            {/* =====================================================
                SIGNATURES
            ====================================================== */}

            <section className="print-signature-section">

                <div className="print-signature-box">

                    <div className="print-signature-line" />

                    <span>
                        Attending Doctor
                    </span>

                </div>

                <div className="print-signature-box">

                    <div className="print-signature-line" />

                    <span>
                        Nurse / Clinical Officer
                    </span>

                </div>

                <div className="print-signature-box">

                    <div className="print-signature-line" />

                    <span>
                        Date
                    </span>

                </div>

            </section>


            {/* =====================================================
                FOOTER
            ====================================================== */}

            <footer className="print-document-footer">

                <span>
                    Emergency Case Record
                </span>

                <span>
                    Printed on {printedDate}
                </span>

            </footer>

        </div>
    );
}

export default PrintEmergency;