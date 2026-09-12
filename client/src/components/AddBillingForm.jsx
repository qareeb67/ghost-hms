import { showToast } from "../utils/notificationService";

import {
    useEffect,
    useState
} from "react";

import {
    getPatients
} from "../services/patientService";

import {
    recordPayment,
    getPaymentsByBill
} from "../services/paymentService";

import "./AddBillingForm.css";


function AddBillingForm({
    bill,
    onSave,
    onCancel,
    onPaymentRecorded
}) {


    // ==========================================
    // STATE
    // ==========================================

    const [patients, setPatients] =
        useState([]);

    const [loadingPatients, setLoadingPatients] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [recordingPayment, setRecordingPayment] =
        useState(false);

    const [payments, setPayments] =
        useState([]);

    const [loadingPayments, setLoadingPayments] =
        useState(false);


    const [paymentData, setPaymentData] =
        useState({

            amount: "",

            payment_method: "",

            transaction_reference: ""

        });


    const [formData, setFormData] =
        useState({

            patient_id: "",

            amount: "",

            service: ""

        });


    // ==========================================
    // LOAD PATIENTS
    // ==========================================

    useEffect(() => {

        const loadPatients = async () => {

            try {

                setLoadingPatients(true);

                const data =
                    await getPatients();

                setPatients(

                    Array.isArray(
                        data?.patients
                    )
                        ? data.patients
                        : []

                );

            } catch (err) {

                console.error(
                    "❌ Failed to load patients:",
                    err
                );

                setPatients([]);

            } finally {

                setLoadingPatients(false);

            }

        };


        loadPatients();

    }, []);


    // ==========================================
    // LOAD BILL
    // ==========================================

    useEffect(() => {

        if (!bill) {

            setFormData({

                patient_id: "",

                amount: "",

                service: ""

            });

            setPayments([]);

            setPaymentData({

                amount: "",

                payment_method: "",

                transaction_reference: ""

            });

            return;

        }


        setFormData({

            patient_id:
                bill.patient_id
                    ? String(
                        bill.patient_id
                    )
                    : "",

            amount:
                bill.amount ?? "",

            service:
                bill.service || ""

        });


        const loadPayments = async () => {

            if (!bill.bill_id) {
                return;
            }


            try {

                setLoadingPayments(true);

                const data =
                    await getPaymentsByBill(
                        bill.bill_id
                    );


                setPayments(

                    Array.isArray(
                        data?.payments
                    )
                        ? data.payments
                        : []

                );

            } catch (err) {

                console.error(
                    "❌ Failed to load bill payments:",
                    err
                );

                setPayments([]);

            } finally {

                setLoadingPayments(false);

            }

        };


        loadPayments();

    }, [bill]);


    // ==========================================
    // HANDLE BILL INPUT
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(
            previous => ({

                ...previous,

                [name]: value

            })
        );

    };


    // ==========================================
    // HANDLE PAYMENT INPUT
    // ==========================================

    const handlePaymentChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setPaymentData(
            previous => ({

                ...previous,

                [name]: value

            })
        );

    };


    // ==========================================
    // FORMAT CURRENCY
    // ==========================================

    const formatCurrency = (
        amount
    ) => {

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
    // CURRENT BILL NUMBERS
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
        Math.max(

            Number(
                bill?.amount_due ??
                billAmount -
                totalPaid
            ),

            0

        );


    // ==========================================
    // SAVE BILL
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // --------------------------------------
        // PATIENT
        // --------------------------------------

        if (!formData.patient_id) {

            showToast(
                "Please select a patient."
            );

            return;

        }


        // --------------------------------------
        // AMOUNT
        // --------------------------------------

        if (
            !formData.amount ||
            Number(
                formData.amount
            ) <= 0
        ) {

            showToast(
                "Please enter a valid bill amount."
            );

            return;

        }


        // --------------------------------------
        // SERVICE
        // --------------------------------------

        if (
            !formData.service.trim()
        ) {

            showToast(
                "Please enter the service provided."
            );

            return;

        }


        try {

            setSaving(true);


            const billData = {

                patient_id:
                    Number(
                        formData.patient_id
                    ),

                amount:
                    Number(
                        formData.amount
                    ),

                service:
                    formData.service.trim()

            };


            await onSave(
                billData
            );

        } catch (err) {

            console.error(
                "❌ Failed to save bill:",
                err
            );

        } finally {

            setSaving(false);

        }

    };


    // ==========================================
    // RECORD PAYMENT
    // ==========================================

    const handleRecordPayment = async () => {

        if (!bill?.bill_id) {

            showToast(
                "This bill must be saved before recording a payment."
            );

            return;

        }


        if (
            !paymentData.amount ||
            Number(
                paymentData.amount
            ) <= 0
        ) {

            showToast(
                "Please enter a valid payment amount."
            );

            return;

        }


        if (!paymentData.payment_method) {

            showToast(
                "Please select a payment method."
            );

            return;

        }


        if (
            Number(
                paymentData.amount
            ) > amountDue
        ) {

            showToast(

                `Payment cannot exceed the outstanding balance of ${formatCurrency(
                    amountDue
                )}.`

            );

            return;

        }


        try {

            setRecordingPayment(true);


            const result =
                await recordPayment(

                    bill.bill_id,

                    {

                        amount:
                            Number(
                                paymentData.amount
                            ),

                        payment_method:
                            paymentData.payment_method,

                        transaction_reference:
                            paymentData
                                .transaction_reference
                                .trim() ||
                            null

                    }

                );


            // ==================================
            // UPDATE PAYMENT HISTORY
            // ==================================

            if (
                result?.payment
            ) {

                setPayments(
                    previous => [

                        result.payment,

                        ...previous

                    ]
                );

            }


            // ==================================
            // CLEAR PAYMENT FORM
            // ==================================

            setPaymentData({

                amount: "",

                payment_method: "",

                transaction_reference: ""

            });


            // ==================================
            // NOTIFY BILLING PAGE
            // ==================================

            if (
                typeof onPaymentRecorded ===
                "function"
            ) {

                await onPaymentRecorded(
                    result
                );

            }


            showToast(
                "Payment recorded successfully."
            );

        } catch (err) {

            console.error(
                "❌ Failed to record payment:",
                err
            );


            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to record payment.";


            showToast(message);

        } finally {

            setRecordingPayment(false);

        }

    };


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <form
            className="billing-form"
            onSubmit={
                handleSubmit
            }
        >


            {/* ==================================
                HEADER
            ================================== */}

            <div className="billing-form-header">

                <div>

                    <span className="billing-form-eyebrow">

                        {bill
                            ? "Billing Record"
                            : "New Billing Record"}

                    </span>


                    <h2>

                        {bill
                            ? "Edit Bill"
                            : "Create New Bill"}

                    </h2>


                    <p>

                        {bill

                            ? "Update the bill details. Payments are recorded separately."

                            : "Create a billing record for a patient and healthcare service."}

                    </p>

                </div>


                {bill && (

                    <div
                        className={

                            bill.payment_status ===
                            "Paid"

                                ? "billing-form-status billing-form-status-paid"

                                : bill.payment_status ===
                                  "Partially Paid"

                                    ? "billing-form-status billing-form-status-partial"

                                    : "billing-form-status billing-form-status-pending"

                        }
                    >

                        {bill.payment_status ||
                            "Pending"}

                    </div>

                )}

            </div>


            {/* ==================================
                BILL DETAILS
            ================================== */}

            <div className="billing-form-grid">


                {/* PATIENT */}

                <div className="billing-form-group">

                    <label htmlFor="patient_id">

                        Patient

                        <span className="billing-required">
                            *
                        </span>

                    </label>


                    <select
                        id="patient_id"
                        name="patient_id"
                        value={
                            formData.patient_id
                        }
                        onChange={
                            handleChange
                        }
                        disabled={
                            loadingPatients ||
                            saving ||
                            Boolean(
                                bill?.payment_status ===
                                "Paid"
                            )
                        }
                        required
                    >

                        <option value="">

                            {loadingPatients

                                ? "Loading patients..."

                                : "Select patient"}

                        </option>


                        {patients.map(
                            patient => (

                                <option
                                    key={
                                        patient.patient_id
                                    }
                                    value={
                                        patient.patient_id
                                    }
                                >

                                    {
                                        patient.first_name
                                    }{" "}

                                    {
                                        patient.last_name
                                    }

                                </option>

                            )
                        )}

                    </select>


                    {!loadingPatients &&
                        patients.length === 0 && (

                            <span className="billing-field-help billing-field-error">

                                No patients available.
                                Please create a patient first.

                            </span>

                        )}

                </div>


                {/* AMOUNT */}

                <div className="billing-form-group">

                    <label htmlFor="amount">

                        Bill Amount

                        <span className="billing-required">
                            *
                        </span>

                    </label>


                    <div className="billing-amount-input">

                        <span>
                            ₦
                        </span>


                        <input
                            id="amount"
                            type="number"
                            name="amount"
                            placeholder="0.00"
                            value={
                                formData.amount
                            }
                            onChange={
                                handleChange
                            }
                            min="0.01"
                            step="0.01"
                            disabled={
                                saving ||
                                Boolean(
                                    bill?.payment_status ===
                                    "Paid"
                                )
                            }
                            required
                        />

                    </div>


                    <span className="billing-field-help">

                        Total amount the patient owes.

                    </span>

                </div>


                {/* SERVICE */}

                <div className="billing-form-group billing-form-group-full">

                    <label htmlFor="service">

                        Service

                        <span className="billing-required">
                            *
                        </span>

                    </label>


                    <input
                        id="service"
                        type="text"
                        name="service"
                        placeholder="e.g. Consultation, Laboratory Test, Admission"
                        value={
                            formData.service
                        }
                        onChange={
                            handleChange
                        }
                        disabled={
                            saving ||
                            Boolean(
                                bill?.payment_status ===
                                "Paid"
                            )
                        }
                        required
                    />


                    <span className="billing-field-help">

                        Describe the healthcare service being billed.

                    </span>

                </div>


                {/* ==================================
                    PAYMENT SECTION
                ================================== */}

                {bill && (

                    <div className="billing-payment-section">


                        <div className="billing-payment-section-header">

                            <div>

                                <h3>
                                    Payment & Balance
                                </h3>

                                <p>
                                    Record money actually received against this bill.
                                </p>

                            </div>

                        </div>


                        {/* BALANCE */}

                        <div className="billing-payment-info">


                            <div className="billing-payment-info-item">

                                <span>
                                    Bill Amount
                                </span>

                                <strong>
                                    {formatCurrency(
                                        billAmount
                                    )}
                                </strong>

                            </div>


                            <div className="billing-payment-info-item">

                                <span>
                                    Total Paid
                                </span>

                                <strong className="billing-payment-paid">

                                    {formatCurrency(
                                        totalPaid
                                    )}

                                </strong>

                            </div>


                            <div className="billing-payment-info-item">

                                <span>
                                    Amount Due
                                </span>

                                <strong
                                    className={
                                        amountDue > 0
                                            ? "billing-payment-pending"
                                            : "billing-payment-paid"
                                    }
                                >

                                    {formatCurrency(
                                        amountDue
                                    )}

                                </strong>

                            </div>

                        </div>


                        {/* ==================================
                            RECORD PAYMENT FORM
                        ================================== */}

                        {amountDue > 0 && (

                            <div className="billing-payment-entry">


                                <div className="billing-form-group">

                                    <label htmlFor="payment_amount">

                                        Payment Amount

                                        <span className="billing-required">
                                            *
                                        </span>

                                    </label>


                                    <div className="billing-amount-input">

                                        <span>
                                            ₦
                                        </span>


                                        <input
                                            id="payment_amount"
                                            type="number"
                                            name="amount"
                                            placeholder="0.00"
                                            value={
                                                paymentData.amount
                                            }
                                            onChange={
                                                handlePaymentChange
                                            }
                                            min="0.01"
                                            max={
                                                amountDue
                                            }
                                            step="0.01"
                                            disabled={
                                                recordingPayment
                                            }
                                        />

                                    </div>


                                    <span className="billing-field-help">

                                        Maximum:
                                        {" "}
                                        {formatCurrency(
                                            amountDue
                                        )}

                                    </span>

                                </div>


                                <div className="billing-form-group">

                                    <label htmlFor="payment_method">

                                        Payment Method

                                        <span className="billing-required">
                                            *
                                        </span>

                                    </label>


                                    <select
                                        id="payment_method"
                                        name="payment_method"
                                        value={
                                            paymentData.payment_method
                                        }
                                        onChange={
                                            handlePaymentChange
                                        }
                                        disabled={
                                            recordingPayment
                                        }
                                    >

                                        <option value="">
                                            Select method
                                        </option>

                                        <option value="Cash">
                                            Cash
                                        </option>

                                        <option value="Card">
                                            Card / POS
                                        </option>

                                        <option value="Transfer">
                                            Bank Transfer
                                        </option>

                                        <option value="Insurance">
                                            Insurance
                                        </option>

                                    </select>

                                </div>


                                <div className="billing-form-group billing-form-group-full">

                                    <label htmlFor="transaction_reference">

                                        Transaction Reference

                                    </label>


                                    <input
                                        id="transaction_reference"
                                        type="text"
                                        name="transaction_reference"
                                        placeholder="Optional reference, receipt number, transfer reference..."
                                        value={
                                            paymentData.transaction_reference
                                        }
                                        onChange={
                                            handlePaymentChange
                                        }
                                        maxLength={100}
                                        disabled={
                                            recordingPayment
                                        }
                                    />

                                    <span className="billing-field-help">

                                        Recommended for transfers and electronic payments.

                                    </span>

                                </div>


                                <button
                                    type="button"
                                    className="billing-record-payment-btn"
                                    onClick={
                                        handleRecordPayment
                                    }
                                    disabled={
                                        recordingPayment
                                    }
                                >

                                    {recordingPayment

                                        ? "Recording Payment..."

                                        : "Record Payment"}

                                </button>

                            </div>

                        )}


                        {/* FULLY PAID */}

                        {amountDue <= 0 && (

                            <div className="billing-new-bill-notice">

                                <div className="billing-new-bill-notice-icon">
                                    ✓
                                </div>


                                <div>

                                    <strong>
                                        Bill Fully Paid
                                    </strong>

                                    <p>
                                        No additional payment can be recorded for this bill.
                                    </p>

                                </div>

                            </div>

                        )}


                        {/* ==================================
                            PAYMENT HISTORY
                        ================================== */}

                        <div className="billing-payment-history">

                            <div className="billing-payment-history-header">

                                <h4>
                                    Payment History
                                </h4>

                                <span>
                                    {payments.length}
                                    {" "}
                                    payment
                                    {payments.length === 1
                                        ? ""
                                        : "s"}
                                </span>

                            </div>


                            {loadingPayments ? (

                                <div className="billing-payment-history-empty">

                                    Loading payment history...

                                </div>

                            ) : payments.length === 0 ? (

                                <div className="billing-payment-history-empty">

                                    No payments recorded for this bill yet.

                                </div>

                            ) : (

                                <div className="billing-payment-history-list">

                                    {payments.map(
                                        payment => (

                                            <div
                                                className="billing-payment-history-item"
                                                key={
                                                    payment.payment_id
                                                }
                                            >

                                                <div>

                                                    <strong>

                                                        {formatCurrency(
                                                            payment.amount
                                                        )}

                                                    </strong>


                                                    <span>

                                                        {
                                                            payment.payment_method
                                                        }

                                                    </span>

                                                </div>


                                                <div>

                                                    <span>

                                                        {
                                                            payment.received_by_username ||
                                                            "Staff"
                                                        }

                                                    </span>


                                                    <small>

                                                        {
                                                            payment.transaction_reference ||
                                                            "No reference"
                                                        }

                                                    </small>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                )}


                {/* ==================================
                    NEW BILL NOTICE
                ================================== */}

                {!bill && (

                    <div className="billing-new-bill-notice">

                        <div className="billing-new-bill-notice-icon">

                            ₦

                        </div>


                        <div>

                            <strong>
                                New bills start as Pending
                            </strong>

                            <p>
                                Create the bill first, then record payments against it.
                            </p>

                        </div>

                    </div>

                )}

            </div>


            {/* ==================================
                ACTIONS
            ================================== */}

            <div className="billing-form-actions">


                <button
                    type="button"
                    className="billing-cancel-btn"
                    onClick={
                        onCancel
                    }
                    disabled={
                        saving ||
                        recordingPayment
                    }
                >

                    Close

                </button>


                {bill?.payment_status !== "Paid" && (

                    <button
                        type="submit"
                        className="billing-save-btn"
                        disabled={
                            saving ||
                            loadingPatients ||
                            patients.length === 0
                        }
                    >

                        {saving

                            ? "Saving..."

                            : "Save Bill Changes"}

                    </button>

                )}

            </div>

        </form>

    );

}


export default AddBillingForm;