import { showToast } from "./../utils/notificationService";

/**
 * =========================================================
 * HOSPITAL MANAGEMENT SYSTEM
 * PRINT SERVICE
 * =========================================================
 *
 * Central printing utility for Hospital Management System.
 *
 * Responsibilities:
 * - Open printable documents in a new browser window
 * - Render React print components
 * - Trigger browser print dialog
 * - Keep printing logic outside individual pages
 * =========================================================
 */

import React from "react";
import { createRoot } from "react-dom/client";
import printCssUrl from "../styles/print.css?url";


/**
 * =========================================================
 * PRINT DOCUMENT
 * =========================================================
 *
 * @param {React.ReactElement} component
 * @param {string} title
 */
export function printDocument(
    component,
    title = "Hospital Management System Document"
) {

    const printWindow = window.open(
        "",
        "_blank",
        "width=1000,height=800"
    );


    if (!printWindow) {

        showToast(
            "Unable to open the print window. Please allow pop-ups for Hospital Management System."
        );

        return;
    }


    printWindow.document.open();


    printWindow.document.write(`
        <!DOCTYPE html>

        <html>

            <head>

                <meta charset="UTF-8" />

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />

                <title>${escapeHtml(title)}</title>

                <link
                    rel="stylesheet"
                    href="${escapeHtml(printCssUrl)}"
                />

            </head>


            <body>

                <div id="print-root"></div>

            </body>

        </html>
    `);


    printWindow.document.close();


    const rootElement =
        printWindow.document.getElementById(
            "print-root"
        );


    if (!rootElement) {

        printWindow.close();

        console.error(
            "Hospital Management System printing error: print root not found."
        );

        return;
    }


    const root =
        createRoot(rootElement);


    root.render(component);


    /**
     * -------------------------------------------------------
     * WAIT FOR CSS + REACT RENDER
     * -------------------------------------------------------
     *
     * The print window is a separate document. In production
     * builds (for example Render/Vite), print.css is served as
     * a bundled asset rather than /src/styles/print.css.
     *
     * Wait for that real stylesheet to finish loading before
     * opening the browser print dialog.
     * -------------------------------------------------------
     */

    const stylesheet =
        printWindow.document.querySelector(
            'link[rel="stylesheet"]'
        );

    let printStarted = false;

    const startPrint = () => {

        if (printStarted) {
            return;
        }

        printStarted = true;

        window.setTimeout(() => {

            try {
                printWindow.focus();
                printWindow.print();
            } catch (error) {
                console.error(
                    "Hospital Management System printing error:",
                    error
                );
            }

        }, 150);
    };

    if (stylesheet) {

        stylesheet.addEventListener(
            "load",
            startPrint,
            { once: true }
        );

        stylesheet.addEventListener(
            "error",
            () => {
                console.error(
                    "Hospital Management System print stylesheet failed to load:",
                    printCssUrl
                );

                // Still allow printing rather than leaving the user
                // with a permanently open blank print window.
                startPrint();
            },
            { once: true }
        );

        // Very fast cached stylesheets may finish before listeners
        // are registered. Check the sheet and fall back safely.
        window.setTimeout(() => {
            if (stylesheet.sheet) {
                startPrint();
            }
        }, 500);

    } else {
        startPrint();
    }


    /**
     * -------------------------------------------------------
     * CLEANUP
     * -------------------------------------------------------
     */

    printWindow.onafterprint = () => {

        try {

            root.unmount();

        } catch (error) {

            console.warn(
                "Hospital Management System print cleanup warning:",
                error
            );

        }


        printWindow.close();

    };

}


/**
 * =========================================================
 * ESCAPE HTML
 * =========================================================
 */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/**
 * =========================================================
 * PRINT PATIENT MEDICAL RECORD
 * =========================================================
 *
 * Public name:
 * printMedicalRecord()
 *
 * Used by PatientProfileModal.
 * =========================================================
 */

export async function printMedicalRecord({
    patient,
    record,
}) {

    if (!patient) {

        throw new Error(
            "Cannot print medical record without patient data."
        );

    }


    if (!record) {

        throw new Error(
            "Cannot print medical record without clinical record data."
        );

    }


    const { default: PrintMedicalRecord } =
        await import(
            "../components/Printing/PrintMedicalRecord"
        );


    return printDocument(
        React.createElement(
            PrintMedicalRecord,
            {
                patient,
                record,
            }
        ),
        "Patient Clinical Record"
    );

}


/**
 * =========================================================
 * PRINT PATIENT RECORD
 * =========================================================
 *
 * Alias kept for compatibility with older code.
 * =========================================================
 */

export async function printPatientRecord(patient) {

    if (!patient) {

        throw new Error(
            "Cannot print patient record without patient data."
        );

    }


    const { default: PrintPatientRecord } =
        await import(
            "../components/printing/PrintPatientRecord"
        );


    return printDocument(
        React.createElement(
            PrintPatientRecord,
            {
                patient,
            }
        ),
        "Patient Medical Record"
    );

}


/**
 * =========================================================
 * PRINT APPOINTMENT
 * =========================================================
 */

export function printAppointment(appointment) {

    return import(
        "../components/Printing/PrintAppointment"
    ).then(({ default: PrintAppointment }) => {

        printDocument(
            React.createElement(
                PrintAppointment,
                {
                    appointment,
                }
            ),
            "Appointment"
        );

    });

}


/**
 * =========================================================
 * PRINT EMERGENCY
 * =========================================================
 */

export function printEmergency(emergency) {

    return import(
        "../components/printing/PrintEmergency"
    ).then(({ default: PrintEmergency }) => {

        printDocument(
            React.createElement(
                PrintEmergency,
                {
                    emergency,
                }
            ),
            "Emergency Case"
        );

    });

}


/**
 * =========================================================
 * PRINT PRESCRIPTION
 * =========================================================
 *
 * Prints the structured prescription currently stored in
 * the prescriptions / prescription_items tables.
 *
 * Expected input:
 *
 * {
 *     patient,
 *     record,
 *     prescription,
 *     medicines
 * }
 *
 * IMPORTANT:
 * - Does NOT rebuild the prescription from
 *   record.prescription.
 * - Does NOT invent medicine objects.
 * - Uses the actual structured prescription data.
 * =========================================================
 */

export async function printPrescription({
    patient,
    record,
    prescription,
    medicines = [],
}) {

    if (!patient) {

        throw new Error(
            "Cannot print prescription without patient data."
        );

    }


    if (!record) {

        throw new Error(
            "Cannot print prescription without clinical record data."
        );

    }


    if (!prescription) {

        throw new Error(
            "Cannot print prescription without prescription data."
        );

    }


    const { default: PrintPrescription } =
        await import(
            "../components/Printing/PrintPrescription"
        );


    /**
     * -------------------------------------------------------
     * DOCTOR INFORMATION
     * -------------------------------------------------------
     *
     * PrintPrescription expects a separate doctor object.
     *
     * The medical record already contains the doctor name
     * and specialization returned by the backend.
     */

    const doctor = {

        name:
            record.doctor_name ||
            prescription.doctor_name ||
            "Attending Doctor",

        specialization:
            record.specialization ||
            prescription.specialization ||
            "",

        doctor_id:
            record.doctor_id ||
            prescription.doctor_id ||
            null,

    };


    /**
     * -------------------------------------------------------
     * NORMALIZE PRESCRIPTION
     * -------------------------------------------------------
     *
     * Keep the real prescription object intact.
     *
     * We only provide safe fallback values where necessary.
     */

    const normalizedPrescription = {

        ...prescription,

        prescription_id:
            prescription.prescription_id ??
            prescription.id ??
            null,

        record_id:
            prescription.record_id ??
            record.record_id ??
            record.id ??
            null,

        patient_id:
            prescription.patient_id ??
            patient.patient_id ??
            patient.id ??
            null,

        doctor_id:
            prescription.doctor_id ??
            record.doctor_id ??
            doctor.doctor_id ??
            null,

        prescription_date:
            prescription.prescription_date ??
            prescription.created_at ??
            record.visit_date ??
            new Date(),

        notes:
            prescription.notes ??
            "",

        status:
            prescription.status ??
            "active",

    };


    /**
     * -------------------------------------------------------
     * NORMALIZE MEDICINE ITEMS
     * -------------------------------------------------------
     *
     * These are the REAL prescription_items returned by
     * the prescription service.
     */

    const normalizedMedicines =
        Array.isArray(medicines)
            ? medicines.map((item) => ({

                ...item,

                medicine_id:
                    item.medicine_id ??
                    item.id ??
                    null,

                medicine_name:
                    item.medicine_name ??
                    item.name ??
                    "",

                strength:
                    item.strength ??
                    item.dosage ??
                    "",

                dosage:
                    item.dosage ??
                    "",

                frequency:
                    item.frequency ??
                    "",

                duration:
                    item.duration ??
                    "",

                route:
                    item.route ??
                    "",

                instructions:
                    item.instructions ??
                    item.instruction ??
                    "",

            }))
            : [];


    /**
     * -------------------------------------------------------
     * SAFETY CHECK
     * -------------------------------------------------------
     *
     * A structured prescription should contain at least
     * one medicine item.
     */

    if (normalizedMedicines.length === 0) {

        throw new Error(
            "Cannot print prescription because it contains no medicine items."
        );

    }


    /**
     * -------------------------------------------------------
     * RENDER PRESCRIPTION DOCUMENT
     * -------------------------------------------------------
     */

    return printDocument(
        React.createElement(
            PrintPrescription,
            {
                patient,
                doctor,
                prescription:
                    normalizedPrescription,
                medicines:
                    normalizedMedicines,
            }
        ),
        "Prescription"
    );

}

/**
 * =========================================================
 * PRINT PAYMENT RECEIPT
 * =========================================================
 */

export async function printPaymentReceipt(payment) {

    if (!payment) {

        throw new Error(
            "Cannot print payment receipt without payment data."
        );

    }


    const {
        default: PrintPaymentReceipt
    } = await import(
        "../components/printing/PrintPaymentReceipt"
    );


    return printDocument(
        React.createElement(
            PrintPaymentReceipt,
            {
                payment,
            }
        ),
        "Payment Receipt"
    );

}
/**
 * =========================================================
 * PRINT INVOICE
 * =========================================================
 */

export async function printInvoice(invoice) {

    if (!invoice) {

        throw new Error(
            "Cannot print invoice without billing data."
        );

    }


    const { default: PrintInvoice } =
        await import(
            "../components/printing/PrintInvoice"
        );


    return printDocument(
        React.createElement(
            PrintInvoice,
            {
                invoice,
            }
        ),
        "Hospital Invoice"
    );

}