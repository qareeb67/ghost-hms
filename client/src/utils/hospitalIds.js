export const formatHospitalId = (prefix, value) => {
    if (value === undefined || value === null || value === "") {
        return `${prefix}-UNASSIGNED`;
    }

    const numeric = Number(value);

    if (Number.isInteger(numeric) && numeric >= 0) {
        return `${prefix}-${String(numeric).padStart(6, "0")}`;
    }

    return `${prefix}-${String(value).trim()}`;
};

export const formatPatientId = (value) => formatHospitalId("PAT", value);
export const formatDoctorId = (value) => formatHospitalId("DOC", value);
export const formatAppointmentId = (value) => formatHospitalId("APT", value);
export const formatMedicalRecordId = (value) => formatHospitalId("MR", value);
export const formatPrescriptionId = (value) => formatHospitalId("RX", value);
export const formatLaboratoryId = (value) => formatHospitalId("LAB", value);
export const formatInvoiceId = (value) => formatHospitalId("INV", value);
export const formatReceiptId = (value) => formatHospitalId("REC", value);
export const formatEmergencyId = (value) => formatHospitalId("EMG", value);
export const formatMedicineId = (value) => formatHospitalId("MED", value);
export const formatUserId = (value) => formatHospitalId("USR", value);
