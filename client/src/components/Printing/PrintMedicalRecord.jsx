import PrintHeader from "./PrintHeader";
import {
    formatMedicalRecordId,
    formatPatientId,
} from "../../utils/hospitalIds";

function PrintMedicalRecord({
    patient,
    record,
    hospitalName = "Hospital Management System",
    hospitalAddress = "Nigeria",
    hospitalPhone = "",
    hospitalEmail = "",
}) {
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

        return String(value);
    };

    const medicalRecordNumber =
        formatMedicalRecordId(
            record?.medical_record_id ??
            record?.record_id ??
            record?.id
        );

    const formatDate = (value) => {
        if (!value) {
            return "Not provided";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Not provided";
        }

        return date.toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "Not provided";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Not provided";
        }

        return date.toLocaleString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) {
            return null;
        }

        const birthDate = new Date(dateOfBirth);

        if (Number.isNaN(birthDate.getTime())) {
            return null;
        }

        const today = new Date();

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
                today.getDate() < birthDate.getDate()
            )
        ) {
            age--;
        }

        return age >= 0 ? age : null;
    };

    const getPatientName = () => {
        const name = [
            patient?.first_name,
            patient?.last_name,
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

        return name || "Patient";
    };

    const getDoctorName = () => {
        if (record?.doctor_name) {
            return record.doctor_name;
        }

        const doctorName = [
            record?.doctor_first_name,
            record?.doctor_last_name,
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

        return doctorName || "Doctor not assigned";
    };

    const age =
        calculateAge(patient?.date_of_birth);

    const patientNumber =
        patient?.patient_number ||
        formatPatientId(
            patient?.patient_id ??
            patient?.id
        );

    if (!patient || !record) {
        return (
            <div className="print-medical-record-empty">
                <strong>
                    Unable to prepare medical record
                </strong>

                <span>
                    Patient or clinical record data is missing.
                </span>
            </div>
        );
    }

    return (
        <div className="print-medical-record">
            <PrintHeader
                hospitalName={hospitalName}
                hospitalAddress={hospitalAddress}
                hospitalPhone={hospitalPhone}
                hospitalEmail={hospitalEmail}
                documentTitle="PATIENT CLINICAL RECORD"
                documentSubtitle="Clinical Consultation & Treatment Record"
            />

            {/* =====================================================
                DOCUMENT META
            ====================================================== */}

            <section className="print-record-meta">
                <div className="print-record-meta-item">
                    <span>Document Type</span>
                    <strong>Clinical Record</strong>
                </div>

                <div className="print-record-meta-item">
                    <span>Record Number</span>
                    <strong>
                        {medicalRecordNumber}
                    </strong>
                </div>

                <div className="print-record-meta-item">
                    <span>Visit Date</span>
                    <strong>
                        {formatDate(record?.visit_date)}
                    </strong>
                </div>

                <div className="print-record-meta-item">
                    <span>Printed</span>
                    <strong>
                        {formatDateTime(new Date())}
                    </strong>
                </div>
            </section>

            {/* =====================================================
                PATIENT INFORMATION
            ====================================================== */}

            <section className="print-record-section">
                <div className="print-section-heading">
                    <span className="print-section-number">
                        01
                    </span>

                    <div>
                        <h2>Patient Information</h2>
                        <p>
                            Patient identification and demographic details
                        </p>
                    </div>
                </div>

                <div className="print-info-grid">
                    <div className="print-info-item print-info-wide">
                        <span>Patient Name</span>
                        <strong>{getPatientName()}</strong>
                    </div>

                    <div className="print-info-item">
                        <span>Patient Number</span>
                        <strong>
                            {displayValue(patientNumber)}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>Gender</span>
                        <strong>
                            {displayValue(patient?.gender)}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>Date of Birth</span>
                        <strong>
                            {formatDate(patient?.date_of_birth)}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>Age</span>
                        <strong>
                            {age !== null
                                ? `${age} years`
                                : "Not provided"}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>Phone Number</span>
                        <strong>
                            {displayValue(patient?.phone)}
                        </strong>
                    </div>

                    <div className="print-info-item print-info-wide">
                        <span>Address</span>
                        <strong>
                            {displayValue(patient?.address)}
                        </strong>
                    </div>
                </div>
            </section>

            {/* =====================================================
                CLINICIAN / VISIT
            ====================================================== */}

            <section className="print-record-section">
                <div className="print-section-heading">
                    <span className="print-section-number">
                        02
                    </span>

                    <div>
                        <h2>Consultation Details</h2>
                        <p>
                            Attending clinician and clinical encounter
                        </p>
                    </div>
                </div>

                <div className="print-info-grid">
                    <div className="print-info-item print-info-wide">
                        <span>Attending Doctor</span>
                        <strong>
                            {getDoctorName()}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>Specialization</span>
                        <strong>
                            {displayValue(
                                record?.specialization
                            )}
                        </strong>
                    </div>

                    <div className="print-info-item">
                        <span>Visit Date</span>
                        <strong>
                            {formatDate(record?.visit_date)}
                        </strong>
                    </div>
                </div>
            </section>

            {/* =====================================================
                CLINICAL PRESENTATION
            ====================================================== */}

            <section className="print-record-section">
                <div className="print-section-heading">
                    <span className="print-section-number">
                        03
                    </span>

                    <div>
                        <h2>Clinical Presentation</h2>
                        <p>
                            Presenting complaint, symptoms and clinical history
                        </p>
                    </div>
                </div>

                <div className="print-clinical-block">
                    <div className="print-clinical-field">
                        <span>Chief Complaint</span>
                        <p>
                            {displayValue(
                                record?.chief_complaint
                            )}
                        </p>
                    </div>

                    <div className="print-clinical-field">
                        <span>Symptoms</span>
                        <p>
                            {displayValue(
                                record?.symptoms
                            )}
                        </p>
                    </div>

                    <div className="print-clinical-field">
                        <span>
                            History of Present Illness
                        </span>
                        <p>
                            {displayValue(
                                record?.history_of_present_illness
                            )}
                        </p>
                    </div>
                </div>
            </section>

            {/* =====================================================
                VITAL SIGNS
            ====================================================== */}

            <section className="print-record-section">
                <div className="print-section-heading">
                    <span className="print-section-number">
                        04
                    </span>

                    <div>
                        <h2>Vital Signs</h2>
                        <p>
                            Measurements documented during the visit
                        </p>
                    </div>
                </div>

                <div className="print-vitals-grid">
                    <div className="print-vital-card">
                        <span>Blood Pressure</span>
                        <strong>
                            {displayValue(
                                record?.blood_pressure
                            )}
                        </strong>
                    </div>

                    <div className="print-vital-card">
                        <span>Temperature</span>
                        <strong>
                            {displayValue(
                                record?.temperature,
                                "Not recorded"
                            )}
                        </strong>
                    </div>

                    <div className="print-vital-card">
                        <span>Pulse Rate</span>
                        <strong>
                            {displayValue(
                                record?.pulse_rate,
                                "Not recorded"
                            )}
                        </strong>
                    </div>

                    <div className="print-vital-card">
                        <span>Respiratory Rate</span>
                        <strong>
                            {displayValue(
                                record?.respiratory_rate,
                                "Not recorded"
                            )}
                        </strong>
                    </div>

                    <div className="print-vital-card">
                        <span>Oxygen Saturation</span>
                        <strong>
                            {displayValue(
                                record?.oxygen_saturation,
                                "Not recorded"
                            )}
                        </strong>
                    </div>

                    <div className="print-vital-card">
                        <span>Weight</span>
                        <strong>
                            {displayValue(
                                record?.weight,
                                "Not recorded"
                            )}
                        </strong>
                    </div>

                    <div className="print-vital-card">
                        <span>Height</span>
                        <strong>
                            {displayValue(
                                record?.height,
                                "Not recorded"
                            )}
                        </strong>
                    </div>
                </div>
            </section>

            {/* =====================================================
                ASSESSMENT
            ====================================================== */}

            <section className="print-record-section">
                <div className="print-section-heading">
                    <span className="print-section-number">
                        05
                    </span>

                    <div>
                        <h2>Clinical Assessment</h2>
                        <p>
                            Diagnosis and clinical impression
                        </p>
                    </div>
                </div>

                <div className="print-assessment-box">
                    <span>Diagnosis</span>

                    <strong>
                        {displayValue(
                            record?.diagnosis
                        )}
                    </strong>
                </div>
            </section>

            {/* =====================================================
                TREATMENT
            ====================================================== */}

            <section className="print-record-section">
                <div className="print-section-heading">
                    <span className="print-section-number">
                        06
                    </span>

                    <div>
                        <h2>Treatment & Management</h2>
                        <p>
                            Treatment plan, prescription and investigations
                        </p>
                    </div>
                </div>

                <div className="print-clinical-block">
                    <div className="print-clinical-field">
                        <span>Prescription</span>
                        <p>
                            {displayValue(
                                record?.prescription
                            )}
                        </p>
                    </div>

                    <div className="print-clinical-field">
                        <span>Treatment Plan</span>
                        <p>
                            {displayValue(
                                record?.treatment_plan
                            )}
                        </p>
                    </div>

                    <div className="print-clinical-field">
                        <span>Investigation Notes</span>
                        <p>
                            {displayValue(
                                record?.investigation_notes
                            )}
                        </p>
                    </div>
                </div>
            </section>

            {/* =====================================================
                SAFETY
            ====================================================== */}

            <section className="print-record-section print-safety-section">
                <div className="print-section-heading">
                    <span className="print-section-number">
                        07
                    </span>

                    <div>
                        <h2>Allergies & Safety</h2>
                        <p>
                            Clinically relevant safety information
                        </p>
                    </div>
                </div>

                <div className="print-safety-box">
                    <span>Allergies</span>

                    <strong>
                        {displayValue(
                            record?.allergies,
                            "No known allergies reported"
                        )}
                    </strong>
                </div>
            </section>

            {/* =====================================================
                CLINICAL NOTES
            ====================================================== */}

            <section className="print-record-section">
                <div className="print-section-heading">
                    <span className="print-section-number">
                        08
                    </span>

                    <div>
                        <h2>Doctor's Notes</h2>
                        <p>
                            Additional clinical observations and notes
                        </p>
                    </div>
                </div>

                <div className="print-notes-box">
                    {displayValue(
                        record?.notes
                    )}
                </div>
            </section>

            {/* =====================================================
                FOLLOW UP
            ====================================================== */}

            <section className="print-record-section">
                <div className="print-section-heading">
                    <span className="print-section-number">
                        09
                    </span>

                    <div>
                        <h2>Follow-up</h2>
                        <p>
                            Recommended next clinical review
                        </p>
                    </div>
                </div>

                <div className="print-follow-up-box">
                    <div>
                        <span>Follow-up Date</span>
                        <strong>
                            {formatDate(
                                record?.follow_up_date
                            )}
                        </strong>
                    </div>
                </div>
            </section>

            {/* =====================================================
                SIGNATURE
            ====================================================== */}

            <section className="print-signature-section">
                <div className="print-signature-block">
                    <div className="print-signature-line" />
                    <strong>
                        {getDoctorName()}
                    </strong>
                    <span>Attending Doctor</span>
                </div>

                <div className="print-signature-block">
                    <div className="print-signature-line" />
                    <strong>
                        __________________________
                    </strong>
                    <span>Date / Signature</span>
                </div>
            </section>

            {/* =====================================================
                CONFIDENTIALITY
            ====================================================== */}

            <div className="print-confidentiality">
                <strong>CONFIDENTIAL MEDICAL DOCUMENT</strong>

                <span>
                    This document contains confidential clinical
                    information and should be handled in accordance
                    with applicable hospital privacy and records
                    procedures.
                </span>
            </div>

            {/* =====================================================
                FOOTER
            ====================================================== */}

            <footer className="print-document-footer">
                <span>
                    Patient Clinical Record
                </span>

                <span>
                    Medical Record {medicalRecordNumber}
                </span>
            </footer>

            {/* Browser-only print control */}
            <button
                type="button"
                className="no-print print-document-button"
                onClick={() => window.print()}
            >
                Print Medical Record
            </button>
        </div>
    );
}

export default PrintMedicalRecord;