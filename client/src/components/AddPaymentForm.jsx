import { useEffect, useMemo, useState } from "react";

import { recordPayment } from "../services/paymentService";

import "./AddPaymentForm.css";


function AddPaymentForm({
    bill,
    onSuccess,
    onCancel
}) {

    const [amount, setAmount] =
        useState("");

    const [paymentMethod, setPaymentMethod] =
        useState("");

    const [transactionReference, setTransactionReference] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");


    // ==========================================
    // BILL VALUES
    // ==========================================

    const billAmount =
        Number(
            bill?.amount || 0
        );


    const totalPaid =
        Number(
            bill?.total_paid || 0
        );


    const amountDue =
        Number(
            bill?.amount_due ??
            Math.max(
                billAmount - totalPaid,
                0
            )
        );


    // ==========================================
    // LIVE REMAINING BALANCE
    // ==========================================

    const paymentAmount =
        Number(amount || 0);


    const remainingAfterPayment =
        useMemo(() => {

            return Math.max(
                amountDue - paymentAmount,
                0
            );

        }, [
            amountDue,
            paymentAmount
        ]);


    // ==========================================
    // LOAD DEFAULT PAYMENT AMOUNT
    // ==========================================

    useEffect(() => {

        if (bill) {

            setAmount("");

            setPaymentMethod("");

            setTransactionReference("");

            setError("");

        }

    }, [bill]);


    // ==========================================
    // FORMAT CURRENCY
    // ==========================================

    const formatCurrency = (value) => {

        return `₦${Number(
            value || 0
        ).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

    };


    // ==========================================
    // HANDLE SUBMIT
    // ==========================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        // Prevent duplicate submissions even if the handler is triggered
        // programmatically before the button becomes disabled.
        if (saving) {

            return;

        }

        setError("");


        // --------------------------------------
        // VALIDATE BILL
        // --------------------------------------

        if (!bill?.bill_id) {

            setError(
                "A valid bill is required."
            );

            return;

        }


        // --------------------------------------
        // VALIDATE AMOUNT
        // --------------------------------------

        if (
            !amount ||
            paymentAmount <= 0
        ) {

            setError(
                "Please enter a valid payment amount."
            );

            return;

        }


        // --------------------------------------
        // PREVENT OVERPAYMENT
        // --------------------------------------

        if (
            paymentAmount > amountDue
        ) {

            setError(
                `Payment cannot exceed the outstanding balance of ${formatCurrency(
                    amountDue
                )}.`
            );

            return;

        }


        // --------------------------------------
        // VALIDATE PAYMENT METHOD
        // --------------------------------------

        if (!paymentMethod) {

            setError(
                "Please select a payment method."
            );

            return;

        }


        // --------------------------------------
        // TRANSACTION REFERENCE
        // --------------------------------------

        const cleanReference =
            transactionReference.trim();


        try {

            setSaving(true);


            // ==================================
            // RECORD PAYMENT
            // ==================================

            await recordPayment(

                bill.bill_id,

                {

                    amount:
                        paymentAmount,

                    payment_method:
                        paymentMethod,

                    transaction_reference:
                        cleanReference ||
                        null

                }

            );


            // ==================================
            // SUCCESS
            // ==================================

            if (onSuccess) {

                await onSuccess();

            }

        } catch (err) {

            console.error(
                "❌ Failed to record payment:",
                err
            );


            const backendMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message;


            setError(
                backendMessage ||
                "Failed to record payment. Please try again."
            );

        } finally {

            setSaving(false);

        }

    };


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="payment-form-overlay">

            <div className="payment-form-modal">


                {/* ==================================
                    HEADER
                ================================== */}

                <div className="payment-form-header">

                    <div>

                        <span className="payment-form-eyebrow">
                            BILL PAYMENT
                        </span>

                        <h2>
                            Receive Payment
                        </h2>

                        <p>
                            Record money received against this patient bill.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="payment-form-close"
                        onClick={onCancel}
                        disabled={saving}
                        aria-label="Close payment form"
                    >
                        ×
                    </button>

                </div>


                {/* ==================================
                    BILL INFORMATION
                ================================== */}

                <div className="payment-bill-summary">


                    <div className="payment-bill-patient">

                        <div className="payment-bill-avatar">

                            {
                                bill?.patient_name
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                ||
                                "P"
                            }

                        </div>


                        <div>

                            <span className="payment-bill-label">
                                Patient
                            </span>

                            <strong>
                                {
                                    bill?.patient_name ||
                                    "Unknown Patient"
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="payment-bill-service">

                        <span className="payment-bill-label">
                            Service
                        </span>

                        <strong>
                            {
                                bill?.service ||
                                "—"
                            }
                        </strong>

                    </div>


                    <div className="payment-bill-id">

                        <span className="payment-bill-label">
                            Bill
                        </span>

                        <strong>
                            #{bill?.bill_id}
                        </strong>

                    </div>

                </div>


                {/* ==================================
                    FINANCIAL SUMMARY
                ================================== */}

                <div className="payment-financial-grid">


                    <div className="payment-financial-card">

                        <span>
                            Bill Amount
                        </span>

                        <strong>
                            {
                                formatCurrency(
                                    billAmount
                                )
                            }
                        </strong>

                    </div>


                    <div className="payment-financial-card">

                        <span>
                            Already Paid
                        </span>

                        <strong className="payment-financial-paid">
                            {
                                formatCurrency(
                                    totalPaid
                                )
                            }
                        </strong>

                    </div>


                    <div className="payment-financial-card payment-financial-due">

                        <span>
                            Outstanding
                        </span>

                        <strong>
                            {
                                formatCurrency(
                                    amountDue
                                )
                            }
                        </strong>

                    </div>

                </div>


                {/* ==================================
                    FORM
                ================================== */}

                <form
                    className="payment-form"
                    onSubmit={handleSubmit}
                >


                    {/* ==============================
                        PAYMENT AMOUNT
                    ============================== */}

                    <div className="payment-form-group">

                        <label htmlFor="payment_amount">

                            Amount Received

                            <span className="payment-required">
                                *
                            </span>

                        </label>


                        <div className="payment-amount-input">

                            <span>
                                ₦
                            </span>


                            <input
                                id="payment_amount"
                                type="number"
                                min="0.01"
                                max={amountDue}
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    saving ||
                                    amountDue <= 0
                                }
                                autoFocus
                                required
                            />

                        </div>


                        <div className="payment-amount-helper">

                            <span>
                                Maximum:
                            </span>

                            <strong>
                                {
                                    formatCurrency(
                                        amountDue
                                    )
                                }
                            </strong>

                        </div>

                    </div>


                    {/* ==============================
                        PAYMENT METHOD
                    ============================== */}

                    <div className="payment-form-group">

                        <label htmlFor="payment_method">

                            Payment Method

                            <span className="payment-required">
                                *
                            </span>

                        </label>


                        <select
                            id="payment_method"
                            value={paymentMethod}
                            onChange={(event) =>
                                setPaymentMethod(
                                    event.target.value
                                )
                            }
                            disabled={saving}
                            required
                        >

                            <option value="">
                                Select payment method
                            </option>

                            <option value="Cash">
                                Cash
                            </option>

                            <option value="Transfer">
                                Bank Transfer
                            </option>

                            <option value="Card">
                                Card
                            </option>

                            <option value="Insurance">
                                Insurance
                            </option>

                        </select>

                    </div>


                    {/* ==============================
                        TRANSACTION REFERENCE
                    ============================== */}

                    <div className="payment-form-group">

                        <label htmlFor="transaction_reference">

                            Transaction Reference

                            <span className="payment-optional">
                                Optional
                            </span>

                        </label>


                        <input
                            id="transaction_reference"
                            type="text"
                            placeholder="e.g. TRX-849302"
                            value={
                                transactionReference
                            }
                            onChange={(event) =>
                                setTransactionReference(
                                    event.target.value
                                )
                            }
                            disabled={saving}
                            maxLength={100}
                        />


                        <span className="payment-field-help">

                            Recommended for transfers and card payments.

                        </span>

                    </div>


                    {/* ==================================
                        LIVE BALANCE
                    ================================== */}

                    <div className="payment-balance-preview">

                        <div>

                            <span>
                                Remaining Balance
                            </span>

                            <strong>
                                {
                                    formatCurrency(
                                        remainingAfterPayment
                                    )
                                }
                            </strong>

                        </div>


                        <div
                            className={
                                remainingAfterPayment === 0
                                    ? "payment-balance-status payment-balance-status-paid"
                                    : "payment-balance-status payment-balance-status-partial"
                            }
                        >

                            {
                                remainingAfterPayment === 0
                                    ? "Bill will be Paid"
                                    : "Bill will remain Partially Paid"
                            }

                        </div>

                    </div>


                    {/* ==================================
                        ERROR
                    ================================== */}

                    {error && (

                        <div className="payment-form-error">

                            <span>
                                !
                            </span>

                            <p>
                                {error}
                            </p>

                        </div>

                    )}


                    {/* ==================================
                        ACTIONS
                    ================================== */}

                    <div className="payment-form-actions">

                        <button
                            type="button"
                            className="payment-cancel-btn"
                            onClick={onCancel}
                            disabled={saving}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="payment-submit-btn"
                            disabled={
                                saving ||
                                amountDue <= 0
                            }
                        >

                            {saving
                                ? "Recording Payment..."
                                : "Record Payment"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}


export default AddPaymentForm;