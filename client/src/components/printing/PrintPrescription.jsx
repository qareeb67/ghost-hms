import PrintHeader from "./PrintHeader";

import {
formatPatientId,
formatDoctorId,
} from "../../utils/hospitalIds";

function PrintPrescription({
patient = {},
doctor = {},
prescription = {},
medicines = [],
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

    if (doctor?.doctor_name) {
        return doctor.doctor_name;
    }

    if (doctor?.full_name) {
        return doctor.full_name;
    }

    if (record?.doctor_name) {
        return record.doctor_name;
    }

    const name = [
        doctor?.first_name ??
            record?.doctor_first_name,
        doctor?.middle_name ??
            record?.doctor_middle_name,
        doctor?.last_name ??
            record?.doctor_last_name,
    ]
        .filter(Boolean)
        .join(" ");

    return name || "Doctor";
};


/* =========================================================
   PRESCRIPTION ITEMS
========================================================= */

const prescriptionItems =
    Array.isArray(medicines) &&
    medicines.length > 0
        ? medicines
        : Array.isArray(
            prescription?.items
        )
            ? prescription.items
            : Array.isArray(
                prescription?.medicines
            )
                ? prescription.medicines
                : [];


/* =========================================================
   DATA
========================================================= */

const patientName =
    getPatientName();

const doctorName =
    getDoctorName();

const patientNumber =
    patient?.patient_number ||
    "";

const doctorNumber =
    doctor?.doctor_number ||
    record?.doctor_number ||
    formatDoctorId(
        doctor?.doctor_id ??
        record?.doctor_id
    );

const specialization =
    doctor?.specialization ||
    record?.specialization ||
    "";

const prescriptionNumber =
    prescription?.prescription_number ||
    prescription?.prescription_id ||
    prescription?.id ||
    "N/A";

const prescriptionDate =
    prescription?.prescription_date ||
    prescription?.date ||
    prescription?.created_at ||
    record?.visit_date ||
    record?.created_at;

const prescriptionNotes =
    prescription?.notes ||
    prescription?.instructions ||
    record?.prescription_notes ||
    "";

const allergies =
    record?.allergies ||
    patient?.allergies ||
    "";


/* =========================================================
   RENDER
========================================================= */

return (
    <div className="print-document print-prescription">

        {/* =================================================
            HEADER
        ================================================= */}

        <PrintHeader
            hospitalName={hospitalName}
            hospitalAddress={hospitalAddress}
            hospitalPhone={hospitalPhone}
            hospitalEmail={hospitalEmail}
            documentTitle="Prescription"
            documentSubtitle="Patient Medication Order"
        />


        {/* =================================================
            PRESCRIPTION INTRO
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Medication Documentation
                </span>

                <h3>
                    Prescription Details
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
                        Patient No. {patientNumber}
                    </small>

                </div>


                <div className="print-info-card">

                    <span className="print-label">
                        Prescribing Doctor
                    </span>

                    <strong>
                        Dr. {doctorName}
                    </strong>

                    {specialization && (
                        <small>
                            {specialization}
                        </small>
                    )}

                </div>


                <div className="print-info-card">

                    <span className="print-label">
                        Prescription Date
                    </span>

                    <strong>
                        {formatDate(
                            prescriptionDate
                        )}
                    </strong>

                </div>


                <div className="print-info-card">

                    <span className="print-label">
                        Prescription No.
                    </span>

                    <strong>
                        {prescriptionNumber}
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


            <div className="print-details-table">

                <div className="print-detail-row">

                    <span>
                        Full Name
                    </span>

                    <strong>
                        {patientName}
                    </strong>

                </div>


                <div className="print-detail-row">

                     <span>
                        Patient No.
                    </span>

                     <strong>
                            {displayValue(
                                patientNumber
                            )}
                        </strong>

                </div>


                <div className="print-detail-row">

                    <span>
                        Medical Record No.
                    </span>

                    <strong>
                        {record?.medical_record_id ||
                            record?.record_id ||
                            "N/A"}
                    </strong>

                </div>

            </div>

        </section>


        {/* =================================================
            DOCTOR INFORMATION
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Clinical Provider
                </span>

                <h3>
                    Prescribing Doctor
                </h3>

            </div>


            <div className="print-details-table">

                <div className="print-detail-row">

                    <span>
                        Doctor
                    </span>

                    <strong>
                        Dr. {doctorName}
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
                        Specialization
                    </span>

                    <strong>
                        {displayValue(
                            specialization
                        )}
                    </strong>

                </div>


                {(doctor?.mdcn_number ||
                    doctor?.license_number ||
                    record?.mdcn_number) && (

                    <div className="print-detail-row">

                        <span>
                            Professional Registration
                        </span>

                        <strong>
                            {doctor?.mdcn_number ||
                                doctor?.license_number ||
                                record?.mdcn_number}
                        </strong>

                    </div>

                )}

            </div>

        </section>


        {/* =================================================
            MEDICATIONS
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Medication Order
                </span>

                <h3>
                    Prescribed Medicines
                </h3>

            </div>


            {prescriptionItems.length > 0 ? (

                <div className="print-details-table">

                    <div className="print-detail-row">

                        <span>
                            Medicine
                        </span>

                        <strong>
                            Instructions
                        </strong>

                    </div>


                    {prescriptionItems.map(
                        (item, index) => {

                            const medicineName =
                                item?.medicine_name ||
                                item?.name ||
                                item?.medicine?.medicine_name ||
                                "Medicine";

                            const strength =
                                item?.strength ||
                                item?.dose_strength ||
                                "";

                            const dosage =
                                item?.dosage ||
                                item?.dose ||
                                "";

                            const frequency =
                                item?.frequency ||
                                "";

                            const duration =
                                item?.duration ||
                                "";

                            const route =
                                item?.route ||
                                "";

                            const instructions =
                                item?.instructions ||
                                "";

                            return (
                                <div
                                    key={
                                        item?.prescription_item_id ??
                                        item?.medicine_id ??
                                        `${medicineName}-${index}`
                                    }
                                    className="print-detail-row"
                                >

                                    <span>

                                        <strong>
                                            {index + 1}.{" "}
                                            {medicineName}
                                        </strong>

                                        {strength && (
                                            <>
                                                {" "}
                                                • {strength}
                                            </>
                                        )}

                                    </span>


                                    <strong>

                                        {[
                                            dosage &&
                                                `Dosage: ${dosage}`,
                                            frequency &&
                                                `Frequency: ${frequency}`,
                                            duration &&
                                                `Duration: ${duration}`,
                                            route &&
                                                `Route: ${route}`,
                                            instructions &&
                                                instructions,
                                        ]
                                            .filter(Boolean)
                                            .join(" • ") ||
                                            "As directed"
                                        }

                                    </strong>

                                </div>
                            );

                        }
                    )}

                </div>

            ) : (

                <div className="print-text-box">

                    {displayValue(
                        record?.prescription,
                        "No structured prescription items were recorded."
                    )}

                </div>

            )}

        </section>


        {/* =================================================
            ADDITIONAL INSTRUCTIONS
        ================================================= */}

        {prescriptionNotes && (

            <section className="print-section">

                <div className="print-section-title">

                    <span>
                        Patient Guidance
                    </span>

                    <h3>
                        Additional Instructions
                    </h3>

                </div>


                <div className="print-text-box">

                    {prescriptionNotes}

                </div>

            </section>

        )}


        {/* =================================================
            ALLERGY WARNING
        ================================================= */}

        <section className="print-section">

            <div className="print-section-title">

                <span>
                    Patient Safety
                </span>

                <h3>
                    Allergy Information
                </h3>

            </div>


            <div className="print-text-box">

                {allergies
                    ? `Known allergies: ${allergies}`
                    : "No known allergies reported."
                }

            </div>

        </section>


        {/* =================================================
            PRESCRIPTION REFERENCES
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
                        Prescription No.
                    </span>

                    <strong>
                        {prescriptionNumber}
                    </strong>

                </div>


                <div className="print-detail-row">

                    <span>
                        Patient No.
                    </span>

                     <strong>
                            {displayValue(
                                patientNumber
                            )}
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
                    Prescribing Doctor
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
                    Prescription
                </span>

            </div>


            <div>

                <span>
                    Prescription No.
                </span>

                <strong>
                    {prescriptionNumber}
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

export default PrintPrescription;
