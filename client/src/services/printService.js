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
* * Open printable documents in a new browser window
* * Render React print components
* * Trigger browser print dialog
* * Keep printing logic outside individual pages
* =========================================================
  */

import React from "react";
import { createRoot } from "react-dom/client";

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

  printWindow.document.write(` <!DOCTYPE html>

  
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
               href="/src/styles/print.css"
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

  * ---
  * WAIT FOR RENDER
  * ---

  */

  setTimeout(() => {

  
   printWindow.focus();

   printWindow.print();
  

  }, 500);

  /**

  * ---
  * CLEANUP
  * ---

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
* The PatientProfileModal currently provides:
*
* {
* 
  patient,
  ```
* ```
  record
  ```
* }
*
* Therefore this function resolves the actual prescription
* from the prescription service when the prescription object
* is not supplied directly.
*
* This keeps the print action simple while preserving the
* structured prescription architecture.
* =========================================================
  */

export async function printPrescription({
patient,
record,
prescription = null,
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


/**
 * -------------------------------------------------------
 * RECORD ID
 * -------------------------------------------------------
 */

const recordId =
    record.record_id ??
    record.medical_record_id ??
    record.id ??
    null;


if (!recordId) {

    throw new Error(
        "Cannot print prescription because the medical record ID is missing."
    );

}


/**
 * -------------------------------------------------------
 * RESOLVE REAL PRESCRIPTION
 * -------------------------------------------------------
 *
 * PatientProfileModal may call:
 *
 * printPrescription({
 *     patient,
 *     record
 * });
 *
 * In that case, retrieve the structured prescription
 * from the prescription service.
 */

let resolvedPrescription =
    prescription;


if (!resolvedPrescription) {

    const {
        getPrescriptionsByRecord,
    } = await import(
        "./prescriptionService"
    );


    let response;


    try {

        response =
            await getPrescriptionsByRecord(
                recordId
            );

    } catch (error) {

        console.error(
            "Failed to load prescription for printing:",
            error
        );

        throw new Error(
            "Unable to load the prescription for printing."
        );

    }


    const prescriptions =
        Array.isArray(response)
            ? response
            : response?.prescriptions || [];


    if (
        !Array.isArray(
            prescriptions
        ) ||
        prescriptions.length === 0
    ) {

        throw new Error(
            "No prescription was found for this medical record."
        );

    }


    /**
     * Prefer the newest prescription.
     *
     * The service returns prescriptions associated
     * with this exact medical record.
     */

    resolvedPrescription =
        [...prescriptions]
            .sort((a, b) => {

                const aDate =
                    new Date(
                        a?.created_at ||
                        a?.prescription_date ||
                        0
                    ).getTime();

                const bDate =
                    new Date(
                        b?.created_at ||
                        b?.prescription_date ||
                        0
                    ).getTime();

                if (
                    bDate !== aDate
                ) {
                    return bDate - aDate;
                }


                const aId =
                    Number(
                        a?.prescription_id ??
                        a?.id ??
                        0
                    );

                const bId =
                    Number(
                        b?.prescription_id ??
                        b?.id ??
                        0
                    );

                return bId - aId;

            })[0];

}


if (!resolvedPrescription) {

    throw new Error(
        "Cannot print prescription because no prescription data was found."
    );

}


/**
 * -------------------------------------------------------
 * DOCTOR INFORMATION
 * -------------------------------------------------------
 */

const doctor = {

    name:
        record.doctor_name ||
        resolvedPrescription.doctor_name ||
        [
            record.doctor_first_name,
            record.doctor_last_name,
        ]
            .filter(Boolean)
            .join(" ") ||
        "Attending Doctor",

    specialization:
        record.specialization ||
        resolvedPrescription.specialization ||
        "",

    doctor_id:
        record.doctor_id ??
        resolvedPrescription.doctor_id ??
        null,

    doctor_number:
        record.doctor_number ??
        resolvedPrescription.doctor_number ??
        null,

    mdcn_number:
        record.mdcn_number ??
        resolvedPrescription.mdcn_number ??
        null,

};


/**
 * -------------------------------------------------------
 * NORMALIZE PRESCRIPTION
 * -------------------------------------------------------
 */

const normalizedPrescription = {

    ...resolvedPrescription,

    prescription_id:
        resolvedPrescription.prescription_id ??
        resolvedPrescription.id ??
        null,

    record_id:
        resolvedPrescription.record_id ??
        recordId,

    patient_id:
        resolvedPrescription.patient_id ??
        patient.patient_id ??
        patient.id ??
        null,

    doctor_id:
        resolvedPrescription.doctor_id ??
        record.doctor_id ??
        doctor.doctor_id ??
        null,

    prescription_date:
        resolvedPrescription.prescription_date ??
        resolvedPrescription.created_at ??
        record.visit_date ??
        new Date(),

    notes:
        resolvedPrescription.notes ??
        "",

    status:
        resolvedPrescription.status ??
        "active",

};


/**
 * -------------------------------------------------------
 * NORMALIZE MEDICINE ITEMS
 * -------------------------------------------------------
 *
 * Prefer explicitly supplied medicines.
 * Otherwise use the real structured items attached
 * to the resolved prescription.
 */

const sourceMedicines =
    Array.isArray(medicines) &&
    medicines.length > 0
        ? medicines
        : Array.isArray(
            resolvedPrescription.items
        )
            ? resolvedPrescription.items
            : Array.isArray(
                resolvedPrescription.medicines
            )
                ? resolvedPrescription.medicines
                : [];


const normalizedMedicines =
    sourceMedicines.map(
        (item) => ({

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
                item.dosage_strength ??
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

        })
    );


/**
 * -------------------------------------------------------
 * SAFETY CHECK
 * -------------------------------------------------------
 *
 * A structured prescription must contain at least one
 * actual medicine item before a medication order can be
 * printed.
 */

if (
    normalizedMedicines.length === 0
) {

    throw new Error(
        "Cannot print prescription because it contains no medicine items."
    );

}


/**
 * -------------------------------------------------------
 * RENDER PRESCRIPTION DOCUMENT
 * -------------------------------------------------------
 */

const { default: PrintPrescription } =
    await import(
        "../components/Printing/PrintPrescription"
    );


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
            record,
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
    "../components/Printing/PrintPaymentReceipt"
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
