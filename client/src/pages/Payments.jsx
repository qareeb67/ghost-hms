import { useEffect, useState } from "react";

import {
    getPayments,
    getPaymentSummary,
    getPaymentById
} from "../services/paymentService";

import {
    printPaymentReceipt
} from "../services/printService";

import "./Payments.css";
import { formatReceiptId, formatInvoiceId } from "../utils/hospitalIds";


function Payments() {

    const [payments, setPayments] = useState([]);

    const [summary, setSummary] = useState({
        total_payments: 0,
        total_received: 0,
        total_cash: 0,
        total_transfer: 0,
        total_card: 0,
        total_insurance: 0
    });

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [printingPaymentId, setPrintingPaymentId] = useState(null);


    const [printError, setPrintError] = useState("");


    // ==========================================
    // LOAD PAYMENTS
    // ==========================================

const loadPayments = async () => {

        try {

            setLoading(true);

            const [
                paymentsData,
                summaryData
            ] = await Promise.all([
                getPayments(),
                getPaymentSummary()
            ]);


            setPayments(
                Array.isArray(paymentsData?.payments)
                    ? paymentsData.payments
                    : []
            );


            setSummary(
                summaryData?.summary ||
                summaryData ||
                {
                    total_payments: 0,
                    total_received: 0,
                    total_cash: 0,
                    total_transfer: 0,
                    total_card: 0,
                    total_insurance: 0
                }
            );

        } catch (err) {

            console.error(
                "❌ Failed to load payments:",
                err
            );

            setPayments([]);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        loadPayments();
    }, []);


    


    // ==========================================
    // REFRESH
    // ==========================================

    const handleRefresh = async () => {

        try {

            setRefreshing(true);

            await loadPayments();

        } finally {

            setRefreshing(false);

        }

    };


    // ==========================================
    // PRINT PAYMENT RECEIPT
    // ==========================================

   const handlePrintReceipt = async (paymentId) => {

    if (!paymentId) {
        return;
    }


    try {

        setPrintError("");

        setPrintingPaymentId(paymentId);


        const response =
            await getPaymentById(
                paymentId
            );


        const payment =
            response?.payment ||
            response?.data?.payment ||
            response?.data ||
            response;


        if (!payment) {

            throw new Error(
                "Payment information could not be loaded."
            );

        }


        await printPaymentReceipt(
            payment
        );


    } catch (err) {

        console.error(
            "❌ Failed to print payment receipt:",
            err
        );


        const backendMessage =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message;


        setPrintError(
            backendMessage ||
            "Unable to print the payment receipt. Please try again."
        );


    } finally {

        setPrintingPaymentId(null);

    }

};



    // ==========================================
    // FORMAT CURRENCY
    // ==========================================

    const formatCurrency = (amount) => {

        return `₦${Number(amount || 0).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }


        const parsedDate = new Date(date);


        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }


        return parsedDate.toLocaleString(
            "en-NG",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    };


    // ==========================================
    // PAYMENT METHOD CLASS
    // ==========================================

    const getPaymentMethodClass = (method) => {

        switch (method) {

            case "Cash":
                return "payment-method-cash";

            case "Transfer":
                return "payment-method-transfer";

            case "Card":
                return "payment-method-card";

            case "Insurance":
                return "payment-method-insurance";

            default:
                return "payment-method-default";

        }

    };


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="hms-page payments-page">


            {/* ==================================
                HEADER
            ================================== */}

            <div className="payments-top-bar">

                <div>

                    <span className="payments-eyebrow">
                        FINANCIAL MANAGEMENT
                    </span>


                    <h1 className="payments-page-title">
                        Payments
                    </h1>


                    <p className="payments-page-subtitle">
                        Track money received from patient bills
                    </p>

                </div>


                <button
                    type="button"
                    className="payments-refresh-btn"
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                >

                    <span
                        className={
                            refreshing
                                ? "payments-refresh-icon payments-refreshing"
                                : "payments-refresh-icon"
                        }
                    >
                        ↻
                    </span>


                    {refreshing ? "Refreshing..." : "Refresh"}

                </button>

            </div>


            {/* ==================================
                SUMMARY
            ================================== */}

            <div className="payments-summary">


                {/* TOTAL RECEIVED */}

                <div className="payments-summary-card payments-summary-primary">

                    <div className="payments-summary-icon">
                        ₦
                    </div>


                    <div>

                        <div className="payments-summary-label">
                            Total Received
                        </div>


                        <div className="payments-summary-value">
                            {
                                formatCurrency(
                                    summary.total_received
                                )
                            }
                        </div>

                    </div>

                </div>


                {/* TOTAL PAYMENTS */}

                <div className="payments-summary-card">

                    <div className="payments-summary-label">
                        Total Payments
                    </div>


                    <div className="payments-summary-value">
                        {
                            Number(
                                summary.total_payments || 0
                            ).toLocaleString("en-NG")
                        }
                    </div>

                </div>


                {/* CASH */}

                <div className="payments-summary-card">

                    <div className="payments-summary-label">
                        Cash
                    </div>


                    <div className="payments-summary-value">
                        {
                            formatCurrency(
                                summary.total_cash
                            )
                        }
                    </div>

                </div>


                {/* TRANSFER */}

                <div className="payments-summary-card">

                    <div className="payments-summary-label">
                        Transfer
                    </div>


                    <div className="payments-summary-value">
                        {
                            formatCurrency(
                                summary.total_transfer
                            )
                        }
                    </div>

                </div>


                {/* CARD */}

                <div className="payments-summary-card">

                    <div className="payments-summary-label">
                        Card
                    </div>


                    <div className="payments-summary-value">
                        {
                            formatCurrency(
                                summary.total_card
                            )
                        }
                    </div>

                </div>


                {/* INSURANCE */}

                <div className="payments-summary-card">

                    <div className="payments-summary-label">
                        Insurance
                    </div>


                    <div className="payments-summary-value">
                        {
                            formatCurrency(
                                summary.total_insurance
                            )
                        }
                    </div>

                </div>

            </div>


            {/* ==================================
                PRINT ERROR
            ================================== */}

            {printError && (

                <div className="payments-print-error">

                    <div className="payments-print-error-icon">
                        !
                    </div>


                    <div>

                        <strong>
                            Receipt unavailable
                        </strong>


                        <p>
                            {printError}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() => setPrintError("")}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>

                </div>

            )}


            {/* ==================================
                PAYMENT TABLE
            ================================== */}

            <div className="payments-table-card">


                <div className="payments-table-header">

                    <div>

                        <h2>
                            Payment History
                        </h2>


                        <p>
                            Every financial transaction recorded by the hospital
                        </p>

                    </div>


                    <div className="payments-count">

                        {payments.length}{" "}

                        {
                            payments.length === 1
                                ? "payment"
                                : "payments"
                        }

                    </div>

                </div>


                {loading ? (

                    <div className="payments-loading">

                        <div className="payments-spinner"></div>


                        <p>
                            Loading payment records...
                        </p>

                    </div>

                ) : payments.length === 0 ? (

                    <div className="payments-empty">

                        <div className="payments-empty-icon">
                            ₦
                        </div>


                        <h3>
                            No payments recorded
                        </h3>


                        <p>
                            Payments will appear here once money is received against a bill.
                        </p>

                    </div>

                ) : (

                    <div className="payments-table-wrapper">

                        <table className="payments-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Patient
                                    </th>

                                    <th>
                                        Bill
                                    </th>

                                    <th>
                                        Service
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Method
                                    </th>

                                    <th>
                                        Reference
                                    </th>

                                    <th>
                                        Received By
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th className="payments-action-column">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {payments.map((payment) => (

                                    <tr
                                        key={formatReceiptId(payment.payment_id)}
                                    >


                                        {/* ID */}

                                        <td>

                                            <span className="payment-id">
                                                {formatReceiptId(payment.payment_id)}
                                            </span>

                                        </td>


                                        {/* PATIENT */}

                                        <td>

                                            <div className="payment-patient">

                                                <div className="payment-patient-avatar">

                                                    {
                                                        payment.patient_name
                                                            ?.charAt(0)
                                                            ?.toUpperCase()
                                                        || "P"
                                                    }

                                                </div>


                                                <span>
                                                    {
                                                        payment.patient_name ||
                                                        "Unknown Patient"
                                                    }
                                                </span>

                                            </div>

                                        </td>


                                        {/* BILL */}

                                        <td>

                                            <span className="payment-bill-id">
                                                {formatInvoiceId(payment.bill_id)}
                                            </span>

                                        </td>


                                        {/* SERVICE */}

                                        <td>

                                            <span className="payment-service">

                                                {
                                                    payment.service || "—"
                                                }

                                            </span>

                                        </td>


                                        {/* AMOUNT */}

                                        <td>

                                            <strong className="payment-amount">

                                                {
                                                    formatCurrency(
                                                        payment.payment_amount ??
                                                        payment.amount
                                                    )
                                                }

                                            </strong>

                                        </td>


                                        {/* METHOD */}

                                        <td>

                                            <span
                                                className={`payment-method ${getPaymentMethodClass(
                                                    payment.payment_method
                                                )}`}
                                            >

                                                {
                                                    payment.payment_method ||
                                                    "—"
                                                }

                                            </span>

                                        </td>


                                        {/* REFERENCE */}

                                        <td>

                                            <span className="payment-reference">

                                                {
                                                    payment.transaction_reference ||
                                                    "—"
                                                }

                                            </span>

                                        </td>


                                        {/* RECEIVED BY */}

                                        <td>

                                            <div className="payment-received-by">

                                                <div className="payment-received-avatar">

                                                    {
                                                        payment.received_by_username
                                                            ?.charAt(0)
                                                            ?.toUpperCase()
                                                        || "U"
                                                    }

                                                </div>


                                                <span>

                                                    {
                                                        payment.received_by_username ||
                                                        "Unknown User"
                                                    }

                                                </span>

                                            </div>

                                        </td>


                                        {/* DATE */}

                                        <td className="payment-date">

                                            {
                                                formatDate(
                                                    payment.payment_date ||
                                                    payment.created_at
                                                )
                                            }

                                        </td>


                                        {/* ACTION */}

                                        <td className="payments-action-cell">

                                            <button
                                                type="button"
                                                className="payment-print-btn"
                                                onClick={() =>
                                                    handlePrintReceipt(
                                                        payment.payment_id
                                                    )
                                                }
                                                disabled={
                                                    printingPaymentId ===
                                                    payment.payment_id
                                                }
                                                title="Print payment receipt"
                                            >

                                                <span className="payment-print-icon">

                                                    {
                                                        printingPaymentId ===
                                                            payment.payment_id
                                                            ? "..."
                                                            : "▣"
                                                    }

                                                </span>


                                                {
                                                    printingPaymentId ===
                                                        payment.payment_id
                                                        ? "Preparing..."
                                                        : "Receipt"
                                                }

                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


        </div>

    );

}


export default Payments;