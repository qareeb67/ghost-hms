import PrintHeader from "../Printing/PrintHeader";
import {
    formatReceiptId,
    formatInvoiceId,
} from "../../utils/hospitalIds";


function PrintPaymentReceipt({
    payment = {},
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
        fallback = "—"
    ) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return fallback;

        }

        return String(value);

    };


    const formatCurrency = (value) => {

        return `₦${Number(
            value || 0
        ).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;

    };


    const formatDate = (value) => {

        if (!value) {

            return "—";

        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }


        return date.toLocaleString(
            "en-NG",
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        );

    };


    /* =========================================================
       PAYMENT DATA
    ========================================================= */

    const paymentId =
        payment?.payment_id ??
        payment?.id;


    const billId =
        payment?.bill_id;


    const patientName =
        payment?.patient_name ||
        "Unknown Patient";


    const service =
        payment?.service ||
        "—";


    const amountPaid =
        Number(
            payment?.payment_amount ??
            payment?.amount ??
            0
        );


    const billAmount =
        Number(
            payment?.bill_amount ??
            payment?.amount_due_before_payment ??
            payment?.bill_total ??
            0
        );


    const totalPaid =
        Number(
            payment?.total_paid ??
            payment?.total_paid_after_payment ??
            amountPaid
        );


    const amountDue =
        Number(
            payment?.amount_due ??
            payment?.outstanding_amount ??
            Math.max(
                billAmount - totalPaid,
                0
            )
        );


    const paymentMethod =
        payment?.payment_method ||
        "—";


    const transactionReference =
        payment?.transaction_reference;


    const receivedBy =
        payment?.received_by_username ||
        payment?.received_by_name ||
        payment?.received_by ||
        "Unknown User";


    const paymentDate =
        payment?.payment_date ||
        payment?.created_at;


    const paymentStatus =
        payment?.payment_status ||
        payment?.status ||
        (
            amountDue <= 0
                ? "Paid"
                : "Payment Received"
        );


    const receiptNumber =
        formatReceiptId(paymentId);


    const invoiceNumber =
        formatInvoiceId(billId);


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="print-document print-payment-receipt">


            {/* =================================================
                HEADER
            ================================================= */}

            <PrintHeader
                hospitalName={hospitalName}
                hospitalAddress={hospitalAddress}
                hospitalPhone={hospitalPhone}
                hospitalEmail={hospitalEmail}
                documentTitle="Payment Receipt"
                documentSubtitle="Official Confirmation of Payment Received"
            />


            {/* =================================================
                RECEIPT INFORMATION
            ================================================= */}

            <section className="print-section">

                <div className="print-section-heading">

                    <div>

                        <span>
                            Financial Transaction
                        </span>

                        <h2>
                            Payment Receipt
                        </h2>

                    </div>

                </div>


                <div className="print-info-grid">


                    <div className="print-info-card">

                        <span className="print-label">
                            Receipt No.
                        </span>

                        <strong>
                            {receiptNumber}
                        </strong>

                    </div>


                    <div className="print-info-card">

                        <span className="print-label">
                            Invoice No.
                        </span>

                        <strong>
                            {invoiceNumber}
                        </strong>

                    </div>


                    <div className="print-info-card">

                        <span className="print-label">
                            Payment Date
                        </span>

                        <strong>
                            {formatDate(paymentDate)}
                        </strong>

                    </div>


                </div>

            </section>


            {/* =================================================
                PATIENT INFORMATION
            ================================================= */}

            <section className="print-section">

                <div className="print-section-heading">

                    <div>

                        <span>
                            Patient Details
                        </span>

                        <h2>
                            Patient Information
                        </h2>

                    </div>

                </div>


                <div className="print-info-grid">


                    <div className="print-info-card">

                        <span className="print-label">
                            Patient
                        </span>

                        <strong>
                            {patientName}
                        </strong>

                    </div>


                    <div className="print-info-card">

                        <span className="print-label">
                            Service
                        </span>

                        <strong>
                            {service}
                        </strong>

                    </div>


                </div>

            </section>


            {/* =================================================
                PAYMENT DETAILS
            ================================================= */}

            <section className="print-section">

                <div className="print-section-heading">

                    <div>

                        <span>
                            Transaction
                        </span>

                        <h2>
                            Payment Details
                        </h2>

                    </div>

                </div>


                <table className="print-details-table">

                    <tbody>


                        <tr className="print-detail-row">

                            <td>
                                Amount Received
                            </td>

                            <td className="print-payment-amount">

                                {formatCurrency(
                                    amountPaid
                                )}

                            </td>

                        </tr>


                        <tr className="print-detail-row">

                            <td>
                                Payment Method
                            </td>

                            <td>

                                <strong>
                                    {paymentMethod}
                                </strong>

                            </td>

                        </tr>


                        <tr className="print-detail-row">

                            <td>
                                Transaction Reference
                            </td>

                            <td>
                                {displayValue(
                                    transactionReference
                                )}
                            </td>

                        </tr>


                        <tr className="print-detail-row">

                            <td>
                                Received By
                            </td>

                            <td>
                                {receivedBy}
                            </td>

                        </tr>


                    </tbody>

                </table>

            </section>


            {/* =================================================
                ACCOUNT SUMMARY
            ================================================= */}

            <section className="print-section">

                <div className="print-section-heading">

                    <div>

                        <span>
                            Billing Summary
                        </span>

                        <h2>
                            Account Summary
                        </h2>

                    </div>

                </div>


                <table className="print-details-table">

                    <tbody>


                        <tr className="print-detail-row">

                            <td>
                                Bill Amount
                            </td>

                            <td>
                                {formatCurrency(
                                    billAmount
                                )}
                            </td>

                        </tr>


                        <tr className="print-detail-row">

                            <td>
                                Total Paid
                            </td>

                            <td>
                                {formatCurrency(
                                    totalPaid
                                )}
                            </td>

                        </tr>


                        <tr className="print-detail-row print-payment-balance-row">

                            <td>
                                Outstanding Balance
                            </td>

                            <td>
                                {formatCurrency(
                                    amountDue
                                )}
                            </td>

                        </tr>


                    </tbody>

                </table>

            </section>


            {/* =================================================
                PAYMENT STATUS
            ================================================= */}

            <div className="print-payment-status">

                <strong>
                    {paymentStatus}
                </strong>

                <span>
                    Payment successfully recorded
                </span>

            </div>


            {/* =================================================
                SIGNATURES
            ================================================= */}

            <div className="print-signature-section">


                <div className="print-signature-box">

                    <div className="print-signature-line"></div>

                    <span>
                        Received By
                    </span>

                    <strong>
                        {receivedBy}
                    </strong>

                </div>


                <div className="print-signature-box">

                    <div className="print-signature-line"></div>

                    <span>
                        Authorized Signature
                    </span>

                </div>


            </div>


            {/* =================================================
                NOTICE
            ================================================= */}

            <div className="print-notice">

                <strong>
                    Important:
                </strong>

                <span>
                    Please retain this receipt as proof of payment.
                </span>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="print-document-footer">

                <span>
                    {hospitalName}
                </span>

                <span>
                    Payment Receipt {receiptNumber}
                </span>

                <span>
                    Printed {formatDate(new Date())}
                </span>

            </div>


        </div>

    );

}


export default PrintPaymentReceipt;