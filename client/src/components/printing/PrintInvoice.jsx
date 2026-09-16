import PrintHeader from "../PrintHeader";
import {
    formatInvoiceId,
    formatPatientId,
} from "../../utils/hospitalIds";


/**
 * =========================================================
 * HOSPITAL MANAGEMENT SYSTEM
 * PRINT INVOICE
 * =========================================================
 *
 * Prints the actual billing record.
 *
 * IMPORTANT:
 * - Does NOT create payments.
 * - Does NOT modify billing data.
 * - Does NOT invent taxes, discounts, or line items.
 * - Uses the billing object supplied by Billing.jsx.
 * =========================================================
 */


/*
==================================================
HELPERS
==================================================
*/

function displayValue(value, fallback = "Not provided") {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return fallback;
    }

    return String(value);

}


function formatCurrency(value) {

    const amount = Number(value || 0);

    return amount.toLocaleString(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );

}


function formatDate(value) {

    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString(
        "en-NG",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );

}


function getPatientName(invoice) {

    return (
        invoice?.patient_name ||
        invoice?.patient?.patient_name ||
        invoice?.patient?.name ||
        invoice?.patient?.full_name ||
        "Unknown Patient"
    );

}


function getPatientNumber(invoice) {

    const value =
        invoice?.patient_number ||
        invoice?.patient?.patient_number ||
        invoice?.patient_id ||
        invoice?.patient?.patient_id;

    return value ? formatPatientId(value) : "Not assigned";

}


function getInvoiceNumber(invoice) {

    const id =
        invoice?.bill_id ??
        invoice?.id ??
        null;

    if (id === null || id === undefined) {
        return "Pending";
    }

    return formatInvoiceId(id);

}


function getPaymentStatus(invoice) {

    const amount =
        Number(invoice?.amount || 0);

    const totalPaid =
        Number(invoice?.total_paid || 0);

    const amountDue =
        Math.max(
            Number(
                invoice?.amount_due ??
                amount - totalPaid
            ),
            0
        );


    if (amountDue <= 0) {
        return "Paid";
    }


    if (totalPaid > 0) {
        return "Partially Paid";
    }


    return "Pending";

}


function getStatusClass(status) {

    return status
        .toLowerCase()
        .replace(/\s+/g, "-");

}


/*
==================================================
COMPONENT
==================================================
*/

function PrintInvoice({

    invoice,

    hospitalName = "Hospital Management System",

    hospitalAddress = "Nigeria",

    hospitalPhone = "",

    hospitalEmail = "",

}) {

    if (!invoice) {

        return (
            <div className="print-document">

                <PrintHeader
                    hospitalName={hospitalName}
                    hospitalAddress={hospitalAddress}
                    hospitalPhone={hospitalPhone}
                    hospitalEmail={hospitalEmail}
                    documentTitle="Hospital Invoice"
                    documentSubtitle="Billing Document"
                />

                <section className="print-section">

                    <div className="print-alert">

                        Unable to print this invoice because
                        billing information was not provided.

                    </div>

                </section>

            </div>
        );

    }


    /*
    ==================================================
    BILL CALCULATIONS
    ==================================================
    */

    const billAmount =
        Number(invoice.amount || 0);


    const totalPaid =
        Number(invoice.total_paid || 0);


    const amountDue =
        Math.max(
            Number(
                invoice.amount_due ??
                billAmount - totalPaid
            ),
            0
        );


    const paymentStatus =
        getPaymentStatus(invoice);


    const statusClass =
        getStatusClass(paymentStatus);


    /*
    ==================================================
    PAYMENT METHOD
    ==================================================
    */

    const paymentMethod =
        invoice.payment_method ||
        (
            paymentStatus === "Pending"
                ? "No payment recorded"
                : "Recorded payment"
        );


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <main className="print-document">

            {/* =================================================
                HEADER
            ================================================= */}

            <PrintHeader
                hospitalName={hospitalName}
                hospitalAddress={hospitalAddress}
                hospitalPhone={hospitalPhone}
                hospitalEmail={hospitalEmail}
                documentTitle="Hospital Invoice"
                documentSubtitle="Patient Billing Statement"
            />


            {/* =================================================
                INVOICE INFORMATION
            ================================================= */}

            <section className="print-section">

                <div className="print-info-grid three-columns">

                    <div className="print-info-item">

                        <label>
                            Invoice Number
                        </label>

                        <strong>
                            {getInvoiceNumber(invoice)}
                        </strong>

                    </div>


                    <div className="print-info-item">

                        <label>
                            Invoice No.
                        </label>

                        <span>
                            {displayValue(
                                invoice.bill_id ??
                                invoice.id
                            )}
                        </span>

                    </div>


                    <div className="print-info-item">

                        <label>
                            Invoice Date
                        </label>

                        <span>
                            {formatDate(
                                invoice.created_at
                            )}
                        </span>

                    </div>

                </div>

            </section>


            {/* =================================================
                PATIENT INFORMATION
            ================================================= */}

            <section className="print-section">

                <div className="print-section-header">

                    <h2>
                        Patient Information
                    </h2>

                </div>


                <div className="print-patient-summary">

                    <div className="print-patient-summary-item">

                        <label>
                            Patient
                        </label>

                        <strong>
                            {getPatientName(invoice)}
                        </strong>

                    </div>


                    <div className="print-patient-summary-item">

                        <label>
                            Patient No.
                        </label>

                        <strong>
                            {getPatientNumber(invoice)}
                        </strong>

                    </div>


                    <div className="print-patient-summary-item">

                        <label>
                            Invoice No.
                        </label>

                        <strong>
                            {displayValue(
                                invoice.bill_id ??
                                invoice.id
                            )}
                        </strong>

                    </div>


                    <div className="print-patient-summary-item">

                        <label>
                            Status
                        </label>

                        <strong>

                            <span
                                className={
                                    `print-status ${statusClass}`
                                }
                            >
                                {paymentStatus}
                            </span>

                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                BILLING DETAILS
            ================================================= */}

            <section className="print-section">

                <div className="print-section-header">

                    <h2>
                        Billing Details
                    </h2>

                    <span>
                        Services & Charges
                    </span>

                </div>


                <div className="print-table-wrapper">

                    <table className="print-table">

                        <thead>

                            <tr>

                                <th style={{ width: "8%" }}>
                                    #
                                </th>

                                <th style={{ width: "57%" }}>
                                    Service
                                </th>

                                <th
                                    style={{ width: "35%" }}
                                    className="print-text-right"
                                >
                                    Amount
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            <tr>

                                <td>
                                    1
                                </td>

                                <td>
                                    <strong>
                                        {displayValue(
                                            invoice.service,
                                            "Hospital Service"
                                        )}
                                    </strong>
                                </td>

                                <td className="print-text-right">

                                    <strong>
                                        {formatCurrency(
                                            billAmount
                                        )}
                                    </strong>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </section>


            {/* =================================================
                PAYMENT INFORMATION
            ================================================= */}

            <section className="print-section">

                <div className="print-section-header">

                    <h2>
                        Payment Information
                    </h2>

                    <span>
                        Current account status
                    </span>

                </div>


                <div className="print-info-grid three-columns">

                    <div className="print-info-item">

                        <label>
                            Payment Status
                        </label>

                        <span>

                            <span
                                className={
                                    `print-status ${statusClass}`
                                }
                            >
                                {paymentStatus}
                            </span>

                        </span>

                    </div>


                    <div className="print-info-item">

                        <label>
                            Payment Method
                        </label>

                        <span>
                            {displayValue(
                                paymentMethod
                            )}
                        </span>

                    </div>


                    <div className="print-info-item">

                        <label>
                            Recorded Payments
                        </label>

                        <span>
                            {displayValue(
                                invoice.payment_count,
                                "0"
                            )}
                        </span>

                    </div>

                </div>

            </section>


            {/* =================================================
                TOTALS
            ================================================= */}

            <section className="print-section">

                <div className="print-invoice-summary">

                    <div className="print-invoice-total">

                        <div className="print-invoice-total-row">

                            <span>
                                Bill Amount
                            </span>

                            <strong>
                                {formatCurrency(
                                    billAmount
                                )}
                            </strong>

                        </div>


                        <div className="print-invoice-total-row">

                            <span>
                                Amount Paid
                            </span>

                            <strong>
                                {formatCurrency(
                                    totalPaid
                                )}
                            </strong>

                        </div>


                        <div className="print-invoice-total-row grand-total">

                            <span>
                                Balance Due
                            </span>

                            <strong>
                                {formatCurrency(
                                    amountDue
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                PAYMENT NOTE
            ================================================= */}

            <section className="print-section">

                <div className="print-text-block">

                    {paymentStatus === "Paid" && (
                        <>
                            This invoice has been fully paid.
                            Please retain this document for your
                            records.
                        </>
                    )}


                    {paymentStatus === "Partially Paid" && (
                        <>
                            This invoice has been partially paid.
                            The outstanding balance shown above
                            remains payable.
                        </>
                    )}


                    {paymentStatus === "Pending" && (
                        <>
                            No payment has been recorded against
                            this bill. The full invoice amount
                            remains outstanding.
                        </>
                    )}

                </div>

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="print-footer">

                <span>
                    <strong>
                        {hospitalName}
                    </strong>
                </span>

                <span>
                    Invoice: {getInvoiceNumber(invoice)}
                </span>

                <span>
                    Printed:{" "}
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


            {/* =================================================
                CONFIDENTIALITY
            ================================================= */}

            <div className="print-confidential">

                This document is an official billing record
                generated by {hospitalName}. Please retain it
                for your records.

            </div>

        </main>

    );

}


export default PrintInvoice;