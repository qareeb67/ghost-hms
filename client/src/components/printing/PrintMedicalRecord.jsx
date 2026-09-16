import PrintHeader from "./PrintHeader";

import {
formatMedicalRecordId,
formatPatientId,
formatDoctorId,
} from "../../utils/hospitalIds";

function PrintMedicalRecord({
patient = {},
record = {},


hospitalName = "Hospital Management System",
hospitalAddress = "Nigeria",
hospitalPhone = "",
hospitalEmail = "",


}) {


/* =========================================================
   HELPERS
========================================================= */

const displayValue = (
    value,
    fallback = "N/A"
) => {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return fallback;
    }

    return String(value);
};


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


const formatDateTime = (date) => {

    if (!date) {
        return "N/A";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return displayValue(date);
    }

    return parsedDate.toLocaleString(
        "en-NG",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};


const calculateAge = (
    dateOfBirth
) => {

    if (!dateOfBirth) {
        return "N/A";
    }

    const birthDate =
        new Date(dateOfBirth);

    if (
        Number.isNaN(
            birthDate.getTime()
        )
    ) {
        return "N/A";
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
        : "N/A";
};


const getPatientName = () => {

    if (patient?.patient_name) {
        return patient.patient_name;
    }

    const name = [
        patient?.first_name,
        patient?.middle_name,
        patient?.last_name,
    ]
        .filter(Boolean)
        .join(" ");

    return name || "Patient";
};


const getDoctorName = () => {

    if (record?.doctor_name) {
        return record.doctor_name;
    }

    if (record?.doctor_full_name) {
        return record.doctor_full_name;
    }

    const name = [
        record?.doctor_first_name,
        record?.doctor_middle_name,
        record?.doctor_last_name,
    ]
        .filter(Boolean)
        .join(" ");

    return name || "Doctor";
};


/* =========================================================
   DATA
========================================================= */

const patientName =
    getPatientName();

const doctorName =
    getDoctorName();

const medicalRecordNumber =
    formatMedicalRecordId(
        record?.medical_record_id ??
        record?.record_id ??
        record?.id
    );

const patientNumber =
    patient?.patient_number ||
    formatPatientId(
        patient?.patient_id ??
        patient?.id
    );

const doctorNumber =
    record?.doctor_number ||
    formatDoctorId(
        record?.doctor_id
    );


const visitDate =
    record?.visit_date ||
    record?.date ||
    record?.created_at;

const followUpDate =
    record?.follow_up_date;


/* =========================================================
   RENDER
========================================================= */

return (
    <div className="print-document print-medical-record">

        {/* =================================================
            HEADER
        ================================================= */}

        <PrintHeader
            hospitalName={hospitalName}
            hospitalAddress={hospitalAddress}
            hospitalPhone={hospitalPhone}
            hospitalEmail={hospitalEmail}
            documentTitle="Medical Record"
            documentSubtitle="Patient Clinical Record"
        />


        {/* =================================================
            RECORD INTRO
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Clinical Documentation
                </span>

                <h3>
                    Patient Medical Record
                </h3>

            </div>


            <div className="print-info-grid">

                <div className="print-info-card">

                    <span className="print-label">
                        Patient
                    </span>

                    <strong>
                        {patientName}
                    </strong>

                    <small>
                        Hospital No. {patientNumber}
                    </small>

                </div>


                <div className="print-info-card">

                    <span className="print-label">
                        Attending Doctor
                    </span>

                    <strong>
                        Dr. {doctorName}
                    </strong>

                    {record?.specialization && (
                        <small>
                            {record.specialization}
                        </small>
                    )}

                </div>


                <div className="print-info-card">

                    <span className="print-label">
                        Visit Date
                    </span>

                    <strong>
                        {formatDate(visitDate)}
                    </strong>

                </div>


                <div className="print-info-card">

                    <span className="print-label">
                        Record No.
                    </span>

                    <strong>
                        {medicalRecordNumber}
                    </strong>

                </div>

            </div>

        </section>


        {/* =================================================
            PATIENT INFORMATION
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Patient Information
                </span>

                <h3>
                    Patient Details
                </h3>

            </div>


            <div className="print-info-grid">

                <div className="print-info-card">

                    <span className="print-label">
                        Full Name
                    </span>

                    <strong>
                        {patientName}
                    </strong>

                </div>


                <div className="print-info-card">

                    <span className="print-label">
                        Gender
                    </span>

                    <strong>
                        {displayValue(
                            patient?.gender
                        )}
                    </strong>

                </div>


                <div className="print-info-card">

                    <span className="print-label">
                        Date of Birth
                    </span>

                    <strong>
                        {formatDate(
                            patient?.date_of_birth
                        )}
                    </strong>

                </div>


                <div className="print-info-card">

                    <span className="print-label">
                        Age
                    </span>

                    <strong>
                        {calculateAge(
                            patient?.date_of_birth
                        )}
                    </strong>

                </div>

            </div>

        </section>


        {/* =================================================
            CONSULTATION DETAILS
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Clinical Encounter
                </span>

                <h3>
                    Consultation Details
                </h3>

            </div>


            <div className="print-details-table">

                <div className="print-detail-row">

                    <span>
                        Medical Record No.
                    </span>

                    <strong>
                        {medicalRecordNumber}
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
                        Visit Date
                    </span>

                    <strong>
                        {formatDate(visitDate)}
                    </strong>

                </div>


                <div className="print-detail-row">

                    <span>
                        Created
                    </span>

                    <strong>
                        {formatDateTime(
                            record?.created_at
                        )}
                    </strong>

                </div>

            </div>

        </section>


        {/* =================================================
            PRESENTING COMPLAINT
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Clinical Assessment
                </span>

                <h3>
                    Clinical Presentation
                </h3>

            </div>


            <div className="print-details-table">

                <div className="print-detail-row">

                    <span>
                        Chief Complaint
                    </span>

                    <strong>
                        {displayValue(
                            record?.chief_complaint
                        )}
                    </strong>

                </div>


                <div className="print-detail-row">

                    <span>
                        Diagnosis
                    </span>

                    <strong>
                        {displayValue(
                            record?.diagnosis
                        )}
                    </strong>

                </div>


                <div className="print-detail-row">

                    <span>
                        Symptoms
                    </span>

                    <strong>
                        {displayValue(
                            record?.symptoms
                        )}
                    </strong>

                </div>

            </div>

        </section>


        {/* =================================================
            VITAL SIGNS
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Clinical Measurements
                </span>

                <h3>
                    Vital Signs
                </h3>

            </div>


            <div className="print-info-grid">

                <div className="print-info-card">

                    <span className="print-label">
                        Blood Pressure
                    </span>

                    <strong>
                        {displayValue(
                            record?.blood_pressure
                        )}
                    </strong>

                </div>


                <div className="print-info-card">

                    <span className="print-label">
                        Heart Rate
                    </span>

                    <strong>
                        {displayValue(
                            record?.heart_rate
                        )}
                    </strong>

                </div>


                <div className="print-info-card">

                    <span className="print-label">
                        Temperature
                    </span>

                    <strong>
                        {displayValue(
                            record?.temperature
                        )}
                    </strong>

                </div>


                <div className="print-info-card">

                    <span className="print-label">
                        Weight
                    </span>

                    <strong>
                        {displayValue(
                            record?.weight
                        )}
                    </strong>

                </div>

            </div>

        </section>


        {/* =================================================
            ASSESSMENT
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Medical Evaluation
                </span>

                <h3>
                    Assessment
                </h3>

            </div>


            <div className="print-text-box">

                {displayValue(
                    record?.assessment,
                    "No assessment was recorded."
                )}

            </div>

        </section>


        {/* =================================================
            TREATMENT
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Clinical Management
                </span>

                <h3>
                    Treatment & Management
                </h3>

            </div>


            <div className="print-details-table">

                <div className="print-detail-row">

                    <span>
                        Treatment Plan
                    </span>

                    <strong>
                        {displayValue(
                            record?.treatment_plan
                        )}
                    </strong>

                </div>


                <div className="print-detail-row">

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

        </section>


        {/* =================================================
            PRESCRIPTION
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Medication
                </span>

                <h3>
                    Prescription
                </h3>

            </div>


            <div className="print-text-box">

                {displayValue(
                    record?.prescription,
                    "No prescription was recorded in this medical record."
                )}

            </div>

        </section>


        {/* =================================================
            ALLERGIES
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Patient Safety
                </span>

                <h3>
                    Allergies & Safety
                </h3>

            </div>


            <div className="print-text-box">

                {displayValue(
                    record?.allergies,
                    "No known allergies reported."
                )}

            </div>

        </section>


        {/* =================================================
            DOCTOR'S NOTES
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Clinical Documentation
                </span>

                <h3>
                    Doctor's Notes
                </h3>

            </div>


            <div className="print-text-box">

                {displayValue(
                    record?.notes,
                    "No additional doctor's notes were recorded."
                )}

            </div>

        </section>


        {/* =================================================
            FOLLOW-UP
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Continuing Care
                </span>

                <h3>
                    Follow-up
                </h3>

            </div>


            <div className="print-details-table">

                <div className="print-detail-row">

                    <span>
                        Follow-up Date
                    </span>

                    <strong>
                        {formatDate(
                            followUpDate
                        )}
                    </strong>

                </div>

            </div>

        </section>


        {/* =================================================
            REFERENCE INFORMATION
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


            <div className="print-details-table">

                <div className="print-detail-row">

                    <span>
                        Medical Record No.
                    </span>

                    <strong>
                        {medicalRecordNumber}
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

            </div>

        </section>


        {/* =================================================
            SIGNATURES
        ================================================= */}

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
                    Attending Doctor
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
                    Medical Record
                </span>

            </div>


            <div>

                <span>
                    Record No.
                </span>

                <strong>
                    {medicalRecordNumber}
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

export default PrintMedicalRecord;
