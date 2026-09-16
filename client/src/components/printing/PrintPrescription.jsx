import PrintHeader from "./PrintHeader";

function PrintPrescription({
hospitalName = "Hospital Management System",
hospitalAddress = "Nigeria",
hospitalPhone = "",
hospitalEmail = "",


patient = {},
doctor = {},
prescription = {},
medicines = [],


}) {
const formatDate = (value) => {
if (!value) return "—";

    
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const patientName =
    patient.name ||
    [patient.first_name, patient.last_name]
        .filter(Boolean)
        .join(" ") ||
    "Patient";

const doctorName =
    doctor.name ||
    [doctor.first_name, doctor.last_name]
        .filter(Boolean)
        .join(" ") ||
    "Attending Doctor";

const prescriptionDate =
    prescription.date ||
    prescription.created_at ||
    new Date();

return (
    <div className="print-document print-prescription">

        <PrintHeader
            hospitalName={hospitalName}
            hospitalAddress={hospitalAddress}
            hospitalPhone={hospitalPhone}
            hospitalEmail={hospitalEmail}
            documentTitle="PRESCRIPTION"
            documentSubtitle="Medication Order"
        />

        {/* =====================================================
            PATIENT INFORMATION
           ===================================================== */}

        <section className="print-section prescription-patient-section">

            <div className="print-section-heading">
                <h2>Patient Information</h2>
            </div>

            <div className="print-info-grid">

                <div className="print-info-item">
                    <span>Patient Name</span>
                    <strong>{patientName}</strong>
                </div>

                <div className="print-info-item">
                    <span>Patient Number</span>
                    <strong>
                        {patient.patient_number || "—"}
                    </strong>
                </div>

                <div className="print-info-item">
                    <span>Date of Birth</span>
                    <strong>
                        {formatDate(patient.date_of_birth)}
                    </strong>
                </div>

                <div className="print-info-item">
                    <span>Gender</span>
                    <strong>
                        {patient.gender || "—"}
                    </strong>
                </div>

                <div className="print-info-item">
                    <span>Phone</span>
                    <strong>
                        {patient.phone || "—"}
                    </strong>
                </div>

                <div className="print-info-item">
                    <span>Prescription Date</span>
                    <strong>
                        {formatDate(prescriptionDate)}
                    </strong>
                </div>

            </div>

        </section>


        {/* =====================================================
            PRESCRIBING DOCTOR
           ===================================================== */}

        <section className="print-section">

            <div className="print-section-heading">
                <h2>Prescribing Doctor</h2>
            </div>

            <div className="print-doctor-box">

                <div>
                    <span>Doctor</span>
                    <strong>{doctorName}</strong>
                </div>

                {doctor.specialization && (
                    <div>
                        <span>Specialization</span>
                        <strong>
                            {doctor.specialization}
                        </strong>
                    </div>
                )}

                {doctor.license_number && (
                    <div>
                        <span>License Number</span>
                        <strong>
                            {doctor.license_number}
                        </strong>
                    </div>
                )}

            </div>

        </section>


        {/* =====================================================
            PRESCRIPTION DETAILS
           ===================================================== */}

        <section className="print-section">

            <div className="print-section-heading">
                <h2>Prescription</h2>

                {prescription.reference && (
                    <span>
                        Ref: {prescription.reference}
                    </span>
                )}
            </div>


            {medicines.length > 0 ? (

                <div className="print-table-wrapper">

                    <table className="print-table prescription-table">

                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Medicine</th>
                                <th>Dosage</th>
                                <th>Frequency</th>
                                <th>Duration</th>
                                <th>Route</th>
                                <th>Instructions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {medicines.map((medicine, index) => (

                                <tr
                                    key={
                                        medicine.medicine_id ||
                                        medicine.id ||
                                        index
                                    }
                                >

                                    <td>
                                        {index + 1}
                                    </td>

                                    <td>
                                        <strong>
                                            {medicine.medicine_name ||
                                                medicine.name ||
                                                "—"}
                                        </strong>

                                        {medicine.category && (
                                            <small>
                                                {medicine.category}
                                            </small>
                                        )}
                                    </td>

                                    <td>
                                        {medicine.dosage ||
                                            medicine.strength ||
                                            "—"}
                                    </td>

                                    <td>
                                        {medicine.frequency ||
                                            "—"}
                                    </td>

                                    <td>
                                        {medicine.duration ||
                                            "—"}
                                    </td>

                                    <td>
                                        {medicine.route ||
                                            "—"}
                                    </td>

                                    <td>
                                        {medicine.instructions ||
                                            medicine.instruction ||
                                            "—"}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            ) : (

                <div className="print-empty-state">
                    <p>
                        No medication items were added to this
                        prescription.
                    </p>
                </div>

            )}

        </section>


        {/* =====================================================
            PRESCRIPTION NOTES
           ===================================================== */}

        {(prescription.notes ||
            prescription.instructions ||
            prescription.prescription) && (

            <section className="print-section">

                <div className="print-section-heading">
                    <h2>Additional Instructions</h2>
                </div>

                <div className="print-notes-box">

                    <p>
                        {prescription.notes ||
                            prescription.instructions ||
                            prescription.prescription}
                    </p>

                </div>

            </section>
        )}


        {/* =====================================================
            ALLERGY WARNING
           ===================================================== */}

        {patient.allergies && (

            <section className="print-warning">

                <strong>Allergies</strong>

                <p>
                    {patient.allergies}
                </p>

            </section>
        )}


        {/* =====================================================
            SIGNATURE
           ===================================================== */}

        <section className="print-signature-section">

            <div className="print-signature">

                <div className="print-signature-line" />

                <strong>
                    {doctorName}
                </strong>

                <span>
                    Prescribing Doctor
                </span>

            </div>


            <div className="print-signature">

                <div className="print-signature-line" />

                <strong>
                    {formatDate(prescriptionDate)}
                </strong>

                <span>
                    Date
                </span>

            </div>

        </section>


        {/* =====================================================
            FOOTER
           ===================================================== */}

        <footer className="print-document-footer">

            <span>
                {hospitalName}
            </span>

            <span>
                Prescription generated from the hospital
                management system.
            </span>

        </footer>

    </div>
);


}

export default PrintPrescription;
