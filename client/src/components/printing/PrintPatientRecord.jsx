
import PrintHeader from "./PrintHeader";

function PrintPatientRecord({
    patient,
    hospitalName = "Hospital Management System",
    hospitalAddress = "Nigeria",
    hospitalPhone = "",
    hospitalEmail = "",
}) {
    if (!patient) {
        return null;
    }

    /* =========================================================
       HELPERS
       ========================================================= */

    const getValue = (value, fallback = "Not provided") => {
        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {
            return fallback;
        }

        return String(value).trim();
    };

    const formatDate = (date) => {
        if (!date) {
            return "Not provided";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not provided";
        }

        return parsedDate.toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
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

    const getFullName = () => {
        const firstName = getValue(
            patient.first_name,
            ""
        );

        const lastName = getValue(
            patient.last_name,
            ""
        );

        return `${firstName} ${lastName}`
            .trim()
            .replace(/\s+/g, " ");
    };

    const getStatus = () => {
        return getValue(
            patient.patient_status ||
                patient.status,
            "Active"
        );
    };

    const age = calculateAge(
        patient.date_of_birth
    );

    const fullName = getFullName();

    /* =========================================================
       PRINT
       ========================================================= */

    const handlePrint = () => {
        window.print();
    };

    /* =========================================================
       RENDER
       ========================================================= */

    return (
        <div className="print-patient-record">

            {/* =================================================
                PRINT ACTION BAR
            ================================================= */}

            <div className="print-action-bar no-print">

                <button
                    type="button"
                    onClick={handlePrint}
                    className="print-button"
                >
                    Print Patient Record
                </button>

            </div>


            {/* =================================================
                PRINT DOCUMENT
            ================================================= */}

            <div className="print-document">

                <PrintHeader
                    hospitalName={hospitalName}
                    hospitalAddress={hospitalAddress}
                    hospitalPhone={hospitalPhone}
                    hospitalEmail={hospitalEmail}
                    documentTitle="PATIENT MEDICAL RECORD"
                    documentSubtitle="Patient Registration & Clinical Information"
                />


                {/* =================================================
                    PATIENT IDENTITY
                ================================================= */}

                <section className="print-section patient-identity-section">

                    <div className="print-section-heading">

                        <h2>
                            Patient Identity
                        </h2>

                        <span>
                            Official Patient Record
                        </span>

                    </div>


                    <div className="patient-print-identity">

                        <div className="patient-print-avatar">
                            {patient.first_name
                                ?.charAt(0)
                                .toUpperCase() || "P"}
                        </div>


                        <div className="patient-print-primary">

                            <h3>
                                {fullName}
                            </h3>

                            <div className="patient-print-meta">

                                <span>
                                    Patient No:{" "}
                                    <strong>
                                        {getValue(
                                            patient.patient_number
                                        )}
                                    </strong>
                                </span>

                                <span>
                                    Status:{" "}
                                    <strong>
                                        {getStatus()}
                                    </strong>
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <section className="print-section">

                    <div className="print-section-heading">

                        <h2>
                            Personal Information
                        </h2>

                    </div>


                    <div className="print-grid">

                        <div className="print-field">
                            <span>First Name</span>
                            <strong>
                                {getValue(
                                    patient.first_name
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Last Name</span>
                            <strong>
                                {getValue(
                                    patient.last_name
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Gender</span>
                            <strong>
                                {getValue(
                                    patient.gender
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Date of Birth</span>
                            <strong>
                                {formatDate(
                                    patient.date_of_birth
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Age</span>
                            <strong>
                                {age !== null
                                    ? `${age} years`
                                    : "Not provided"}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Marital Status</span>
                            <strong>
                                {getValue(
                                    patient.marital_status
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Occupation</span>
                            <strong>
                                {getValue(
                                    patient.occupation
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Nationality</span>
                            <strong>
                                {getValue(
                                    patient.nationality
                                )}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    CONTACT INFORMATION
                ================================================= */}

                <section className="print-section">

                    <div className="print-section-heading">

                        <h2>
                            Contact Information
                        </h2>

                    </div>


                    <div className="print-grid">

                        <div className="print-field">
                            <span>Phone Number</span>
                            <strong>
                                {getValue(
                                    patient.phone
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Email Address</span>
                            <strong>
                                {getValue(
                                    patient.email
                                )}
                            </strong>
                        </div>


                        <div className="print-field print-field-wide">
                            <span>Residential Address</span>
                            <strong>
                                {getValue(
                                    patient.address
                                )}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    NIGERIAN DEMOGRAPHICS
                ================================================= */}

                <section className="print-section">

                    <div className="print-section-heading">

                        <h2>
                            Nigerian Demographics
                        </h2>

                    </div>


                    <div className="print-grid">

                        <div className="print-field">
                            <span>Nationality</span>
                            <strong>
                                {getValue(
                                    patient.nationality
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>State of Origin</span>
                            <strong>
                                {getValue(
                                    patient.state_of_origin
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>LGA</span>
                            <strong>
                                {getValue(
                                    patient.lga
                                )}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    MEDICAL INFORMATION
                ================================================= */}

                <section className="print-section">

                    <div className="print-section-heading">

                        <h2>
                            Medical Information
                        </h2>

                    </div>


                    <div className="print-grid">

                        <div className="print-field">
                            <span>Blood Group</span>
                            <strong>
                                {getValue(
                                    patient.blood_group
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Genotype</span>
                            <strong>
                                {getValue(
                                    patient.genotype
                                )}
                            </strong>
                        </div>

                    </div>


                    <div className="print-text-field">

                        <span>
                            Allergies
                        </span>

                        <div>
                            {getValue(
                                patient.allergies
                            )}
                        </div>

                    </div>


                    <div className="print-text-field">

                        <span>
                            Medical History
                        </span>

                        <div>
                            {getValue(
                                patient.medical_history
                            )}
                        </div>

                    </div>

                </section>


                {/* =================================================
                    EMERGENCY CONTACT
                ================================================= */}

                <section className="print-section">

                    <div className="print-section-heading">

                        <h2>
                            Emergency Contact
                        </h2>

                    </div>


                    <div className="print-grid">

                        <div className="print-field">
                            <span>Name</span>
                            <strong>
                                {getValue(
                                    patient.emergency_contact_name
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Relationship</span>
                            <strong>
                                {getValue(
                                    patient.emergency_contact_relationship
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Phone Number</span>
                            <strong>
                                {getValue(
                                    patient.emergency_contact_phone
                                )}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    REGISTRATION INFORMATION
                ================================================= */}

                <section className="print-section">

                    <div className="print-section-heading">

                        <h2>
                            Registration Information
                        </h2>

                    </div>


                    <div className="print-grid">

                        <div className="print-field">
                            <span>Patient Number</span>
                            <strong>
                                {getValue(
                                    patient.patient_number
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Registration Date</span>
                            <strong>
                                {formatDate(
                                    patient.registration_date ||
                                        patient.created_at
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Last Updated</span>
                            <strong>
                                {formatDate(
                                    patient.updated_at
                                )}
                            </strong>
                        </div>


                        <div className="print-field">
                            <span>Patient Status</span>
                            <strong>
                                {getStatus()}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    CONFIDENTIALITY NOTICE
                ================================================= */}

                <section className="print-confidentiality">

                    <strong>
                        Confidential Medical Information
                    </strong>

                    <p>
                        This document contains confidential
                        patient information and is intended
                        only for authorized healthcare,
                        administrative, and clinical use.
                        Unauthorized disclosure or distribution
                        is prohibited.
                    </p>

                </section>


                {/* =================================================
                    SIGNATURE AREA
                ================================================= */}

                <section className="print-signature-section">

                    <div className="print-signature">

                        <div className="print-signature-line" />

                        <span>
                            Authorized Officer
                        </span>

                    </div>


                    <div className="print-signature">

                        <div className="print-signature-line" />

                        <span>
                            Date
                        </span>

                    </div>

                </section>


                {/* =================================================
                    DOCUMENT FOOTER
                ================================================= */}

                <footer className="print-document-footer">

                    <span>
                        {hospitalName}
                    </span>

                    <span>
                        Patient Medical Record
                    </span>

                    <span>
                        Printed{" "}
                        {new Date().toLocaleDateString(
                            "en-NG",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            }
                        )}
                    </span>

                </footer>

            </div>

        </div>
    );
}

export default PrintPatientRecord;

