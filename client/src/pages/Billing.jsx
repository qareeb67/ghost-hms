import { confirmAction } from "../components/ConfirmDialog";
import { showToast } from "../utils/notificationService";

import { useEffect, useMemo, useState } from "react";

import {
    getBills,
    createBill,
    updateBill,
    deleteBill
} from "../services/billingService";

import AddBillingForm from "../components/AddBillingForm";
import AddPaymentForm from "../components/AddPaymentForm";
import { printInvoice } from "../services/printService";
import "./Billing.css";
import { formatInvoiceId } from "../utils/hospitalIds";


function Billing() {

    const [bills, setBills] = useState([]);

    const [showForm, setShowForm] =
        useState(false);

    const [editingBill, setEditingBill] =
        useState(null);

    const [paymentBill, setPaymentBill] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    // ==========================================
    // LOAD BILLS
    // ==========================================

const loadBills = async () => {

        try {

            setLoading(true);

            const data =
                await getBills();


            const loadedBills =
                Array.isArray(data?.bills)
                    ? data.bills
                    : [];


            setBills(loadedBills);

        } catch (err) {

            console.error(
                "❌ Failed to load bills:",
                err
            );

            setBills([]);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadBills();

        const handleSyncComplete = () => {
            loadBills();
        };

        const handleOnline = () => {
            loadBills();
        };

        window.addEventListener(
            "ghost-hms-sync-complete",
            handleSyncComplete
        );

        window.addEventListener(
            "online",
            handleOnline
        );

        return () => {
            window.removeEventListener(
                "ghost-hms-sync-complete",
                handleSyncComplete
            );

            window.removeEventListener(
                "online",
                handleOnline
            );
        };

    }, []);


    


    // ==========================================
    // CREATE / UPDATE BILL
    // ==========================================

    const handleSaveBill = async (bill) => {

        try {

            if (editingBill) {

                await updateBill(
                    editingBill.bill_id,
                    bill
                );

                showToast(
                    "Bill updated successfully!"
                );

            } else {

                await createBill(bill);

                showToast(
                    "Bill created successfully!"
                );

            }


            setShowForm(false);

            setEditingBill(null);

            await loadBills();

        } catch (err) {

            console.error(
                "❌ Failed to save bill:",
                err
            );

            showToast(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to save bill."
            );

        }

    };


    // ==========================================
    // OPEN EDIT
    // ==========================================

    const handleEdit = (bill) => {

        const totalPaid =
            Number(
                bill.total_paid || 0
            );


        if (totalPaid > 0) {

            showToast(
                "Bills with recorded payments cannot be edited."
            );

            return;

        }


        setEditingBill(bill);

        setShowForm(true);

    };
    const handlePrintInvoice = async (bill) => {

        if (!bill) {
            showToast(
                "Unable to print invoice: billing information is missing."
            );

            return;
        }

        try {

            await printInvoice(bill);

        } catch (err) {

            console.error(
                "❌ Failed to print invoice:",
                err
            );

            showToast(
                err?.message ||
                "Failed to open the invoice for printing."
            );

        }

    };

    // ==========================================
    // DELETE BILL
    // ==========================================

    const handleDelete = async (id) => {

        const confirmDelete = await confirmAction({
            title: "Delete bill?",
            message: "Are you sure you want to delete this bill? This action cannot be undone.",
            confirmText: "Delete bill",
        });


        if (!confirmDelete) return;


        try {

            await deleteBill(id);

            await loadBills();

            showToast(
                "Bill deleted successfully!"
            );

        } catch (err) {

            console.error(
                "❌ Failed to delete bill:",
                err
            );

            showToast(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete bill."
            );

        }

    };


    // ==========================================
    // OPEN RECEIVE PAYMENT
    // ==========================================

    const handleReceivePayment = (bill) => {

        const billAmount =
            Number(
                bill.amount || 0
            );


        const totalPaid =
            Number(
                bill.total_paid || 0
            );


        const amountDue =
            Number(
                bill.amount_due ??
                Math.max(
                    billAmount -
                    totalPaid,
                    0
                )
            );


        // --------------------------------------
        // PREVENT PAYMENT ON FULLY PAID BILL
        // --------------------------------------

        if (
            bill.payment_status === "Paid" ||
            amountDue <= 0
        ) {

            showToast(
                "This bill has already been fully paid."
            );

            return;

        }


        setPaymentBill({

            ...bill,

            amount_due:
                amountDue,

            total_paid:
                totalPaid

        });

    };


    // ==========================================
    // PAYMENT SUCCESS
    // ==========================================

    const handlePaymentSuccess = async () => {

        try {

            setPaymentBill(null);

            await loadBills();

            showToast(
                "Payment recorded successfully!"
            );

        } catch (err) {

            console.error(
                "❌ Failed to refresh billing after payment:",
                err
            );

        }

    };


    // ==========================================
    // FORMAT CURRENCY
    // ==========================================

    const formatCurrency = (amount) => {

        return `₦${Number(
            amount || 0
        ).toLocaleString(
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


        return new Date(date).toLocaleString(
            "en-NG",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    };


    // ==========================================
    // SUMMARY
    // ==========================================

    const summary = useMemo(() => {

        const totalBills =
            bills.length;


        const totalBilled =
            bills.reduce(
                (total, bill) =>
                    total +
                    Number(
                        bill.amount || 0
                    ),
                0
            );


        const totalPaid =
            bills.reduce(
                (total, bill) =>
                    total +
                    Number(
                        bill.total_paid || 0
                    ),
                0
            );


        const totalDue =
            bills.reduce(
                (total, bill) =>
                    total +
                    Number(
                        bill.amount_due ??
                        Math.max(
                            Number(
                                bill.amount || 0
                            ) -
                            Number(
                                bill.total_paid || 0
                            ),
                            0
                        )
                    ),
                0
            );


        return {

            totalBills,

            totalBilled,

            totalPaid,

            totalDue

        };

    }, [bills]);


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="hms-page billing-page">


            {/* ==================================
                HEADER
            ================================== */}

            <div className="billing-top-bar">

                <div>

                    <h1 className="billing-page-title">
                        Billing
                    </h1>

                    <p className="billing-page-subtitle">
                        Manage patient bills, payments and outstanding balances
                    </p>

                </div>


                <button
                    className="billing-add-btn"
                    onClick={() => {

                        setEditingBill(null);

                        setShowForm(true);

                    }}
                >

                    <span className="billing-add-icon">
                        +
                    </span>

                    Add Bill

                </button>

            </div>


            {/* ==================================
                SUMMARY
            ================================== */}

            <div className="billing-summary">


                <div className="billing-summary-card">

                    <div className="billing-summary-label">
                        Total Bills
                    </div>

                    <div className="billing-summary-value">
                        {summary.totalBills}
                    </div>

                </div>


                <div className="billing-summary-card">

                    <div className="billing-summary-label">
                        Total Billed
                    </div>

                    <div className="billing-summary-value">
                        {formatCurrency(
                            summary.totalBilled
                        )}
                    </div>

                </div>


                <div className="billing-summary-card">

                    <div className="billing-summary-label">
                        Total Received
                    </div>

                    <div className="billing-summary-value billing-paid-value">
                        {formatCurrency(
                            summary.totalPaid
                        )}
                    </div>

                </div>


                <div className="billing-summary-card">

                    <div className="billing-summary-label">
                        Outstanding
                    </div>

                    <div className="billing-summary-value billing-pending-value">
                        {formatCurrency(
                            summary.totalDue
                        )}
                    </div>

                </div>


            </div>


            {/* ==================================
                BILLING FORM
            ================================== */}

            {showForm && (

                <AddBillingForm

                    bill={editingBill}

                    onSave={handleSaveBill}

                    onCancel={() => {

                        setShowForm(false);

                        setEditingBill(null);

                    }}

                />

            )}


            {/* ==================================
                RECEIVE PAYMENT FORM
            ================================== */}

            {paymentBill && (

                <AddPaymentForm

                    bill={paymentBill}

                    onSuccess={
                        handlePaymentSuccess
                    }

                    onCancel={() => {

                        setPaymentBill(null);

                    }}

                />

            )}


            {/* ==================================
                BILLING TABLE
            ================================== */}

            <div className="billing-table-card">


                <div className="billing-table-header">

                    <div>

                        <h2>
                            Billing Records
                        </h2>

                        <p>
                            Patient billing and payment history
                        </p>

                    </div>


                    <div className="billing-table-count">

                        {bills.length}{" "}

                        {
                            bills.length === 1
                                ? "bill"
                                : "bills"
                        }

                    </div>

                </div>


                {loading ? (

                    <div className="billing-loading">

                        <div className="billing-spinner"></div>

                        <p>
                            Loading billing records...
                        </p>

                    </div>

                ) : bills.length === 0 ? (

                    <div className="billing-empty">

                        <div className="billing-empty-icon">
                            ₦
                        </div>

                        <h3>
                            No billing records
                        </h3>

                        <p>
                            Create a bill to see it appear here.
                        </p>

                    </div>

                ) : (

                    <div className="billing-table-wrapper">

                        <table className="billing-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Patient
                                    </th>

                                    <th>
                                        Bill Amount
                                    </th>

                                    <th>
                                        Paid
                                    </th>

                                    <th>
                                        Due
                                    </th>

                                    <th>
                                        Service
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Method
                                    </th>

                                    <th>
                                        Payments
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {bills.map((bill) => {

                                    const billAmount =
                                        Number(
                                            bill.amount || 0
                                        );


                                    const totalPaid =
                                        Number(
                                            bill.total_paid || 0
                                        );


                                    const amountDue =
                                        Number(
                                            bill.amount_due ??
                                            Math.max(
                                                billAmount -
                                                totalPaid,
                                                0
                                            )
                                        );


                                    const isPaid =
                                        amountDue <= 0;


                                    return (

                                        <tr
                                            key={
                                                bill.bill_id
                                            }
                                        >


                                            {/* ID */}

                                            <td className="billing-id">

                                                {formatInvoiceId(bill.bill_id)}

                                            </td>


                                            {/* PATIENT */}

                                            <td>

                                                <div className="billing-patient">

                                                    <div className="billing-patient-avatar">

                                                        {
                                                            bill.patient_name
                                                                ?.charAt(0)
                                                                ?.toUpperCase()
                                                            ||
                                                            "P"
                                                        }

                                                    </div>

                                                    <span>

                                                        {
                                                            bill.patient_name
                                                            ||
                                                            "Unknown Patient"
                                                        }

                                                    </span>

                                                </div>

                                            </td>


                                            {/* BILL AMOUNT */}

                                            <td className="billing-amount">

                                                {
                                                    formatCurrency(
                                                        billAmount
                                                    )
                                                }

                                            </td>


                                            {/* PAID */}

                                            <td className="billing-paid-amount">

                                                {
                                                    formatCurrency(
                                                        totalPaid
                                                    )
                                                }

                                            </td>


                                            {/* DUE */}

                                            <td className="billing-due-amount">

                                                {
                                                    formatCurrency(
                                                        amountDue
                                                    )
                                                }

                                            </td>


                                            {/* SERVICE */}

                                            <td>

                                                <span className="billing-service">

                                                    {
                                                        bill.service ||
                                                        "—"
                                                    }

                                                </span>

                                            </td>


                                            {/* STATUS */}
                                            <td>

                                                <span
                                                    className={
                                                        isPaid
                                                            ? "billing-status billing-status-paid"
                                                            : totalPaid > 0
                                                                ? "billing-status billing-status-partial"
                                                                : "billing-status billing-status-pending"
                                                    }
                                                >

                                                    {
                                                        isPaid
                                                            ? "Paid"
                                                            : totalPaid > 0
                                                                ? "Partially Paid"
                                                                : "Pending"
                                                    }

                                                </span>

                                            </td>


                                            {/* METHOD */}

                                            <td>

                                                <span className="billing-payment-method">

                                                    {
                                                        bill.payment_method ||
                                                        "—"
                                                    }

                                                </span>

                                            </td>


                                            {/* PAYMENT COUNT */}

                                            <td>

                                                <span className="billing-payment-count">

                                                    {
                                                        Number(
                                                            bill.payment_count ||
                                                            0
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* CREATED */}

                                            <td className="billing-date">

                                                {
                                                    formatDate(
                                                        bill.created_at
                                                    )
                                                }

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="billing-actions">


                                                    {/* RECEIVE PAYMENT */}

                                                    {!isPaid && (

                                                        <button
                                                            className="billing-action-btn billing-payment-btn"
                                                            onClick={() =>
                                                                handleReceivePayment(
                                                                    bill
                                                                )
                                                            }
                                                            title="Receive payment for this bill"
                                                        >

                                                            Receive Payment

                                                        </button>

                                                    )}


                                                    {/* PAID */}

                                                    {isPaid && (

                                                        <span className="billing-paid-label">

                                                            Paid

                                                        </span>

                                                    )}


                                                    {/* EDIT */}

                                                    <button
                                                        className="billing-action-btn billing-edit-btn"
                                                        disabled={
                                                            totalPaid > 0
                                                        }
                                                        title={
                                                            totalPaid > 0
                                                                ? "Bills with payments cannot be edited"
                                                                : "Edit bill"
                                                        }
                                                        onClick={() =>
                                                            handleEdit(
                                                                bill
                                                            )
                                                        }
                                                    >

                                                        Edit

                                                    </button>
                                                    {/* PRINT INVOICE */}

                                                    <button
                                                        className="billing-action-btn billing-print-btn"
                                                        onClick={() =>
                                                            handlePrintInvoice(bill)
                                                        }
                                                        title="Print invoice"
                                                    >
                                                        Print Invoice
                                                    </button>

                                                    {/* DELETE */}

                                                    <button
                                                        className="billing-action-btn billing-delete-btn"
                                                        disabled={
                                                            totalPaid > 0
                                                        }
                                                        title={
                                                            totalPaid > 0
                                                                ? "Bills with payments cannot be deleted"
                                                                : "Delete bill"
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                bill.bill_id
                                                            )
                                                        }
                                                    >

                                                        Delete

                                                    </button>


                                                </div>

                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

}


export default Billing;