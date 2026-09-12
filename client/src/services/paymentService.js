
import api from "./api";


// ==================================================
// HOSPITAL MANAGEMENT SYSTEM — PAYMENT SERVICE
// ==================================================
//
// Payments are always attached to a BILL.
//
// Billing:
//     what the patient owes
//
// Payments:
//     money actually received
//
// IMPORTANT:
// Payment status is calculated by the backend.
// The frontend does NOT manually change:
//     Pending
//     Partially Paid
//     Paid
//
// ==================================================


// ==================================================
// AUTH
// ==================================================

const getToken = () => {

    return localStorage.getItem("token");

};


const getAuthConfig = () => {

    const token = getToken();


    return {

        headers: {

            Authorization:
                `Bearer ${token}`

        }

    };

};


// ==================================================
// RECORD PAYMENT FOR BILL
// ==================================================
// POST /payments/bills/:billId
// ==================================================

export const recordPayment = async (
    billId,
    payment
) => {

    if (!billId) {

        throw new Error(
            "A valid bill is required before recording payment."
        );

    }

    // Payments are intentionally online-only. Financial transactions
    // must be confirmed by the authoritative backend/database.
    if (!navigator.onLine) {

        throw new Error(
            "Payment recording requires an internet connection."
        );

    }

    const response =
        await api.post(

            `/payments/bills/${billId}`,

            {
                amount:
                    Number(
                        payment.amount
                    ),

                payment_method:
                    payment.payment_method,

                transaction_reference:
                    payment.transaction_reference ||
                    null
            },

            getAuthConfig()

        );

    return response.data;

};


// ==================================================
// GET PAYMENTS FOR A BILL
// ==================================================
//
// Backend:
// GET /payments/bills/:billId
//
// Example:
// GET /payments/bills/13
//
// ==================================================

export const getPaymentsByBill = async (
    billId
) => {

    if (!billId) {

        throw new Error(
            "A valid bill ID is required."
        );

    }


    const response =
        await api.get(

            `/payments/bills/${billId}`,

            getAuthConfig()

        );


    return response.data;

};


// ==================================================
// GET ALL PAYMENTS
// ==================================================
//
// Backend:
// GET /payments
//
// ==================================================

export const getPayments = async () => {

    const response =
        await api.get(

            "/payments",

            getAuthConfig()

        );


    return response.data;

};


// ==================================================
// GET PAYMENT BY ID
// ==================================================
//
// Backend:
// GET /payments/:id
//
// Example:
// GET /payments/25
//
// ==================================================

export const getPaymentById = async (
    paymentId
) => {

    if (!paymentId) {

        throw new Error(
            "A valid payment ID is required."
        );

    }


    const response =
        await api.get(

            `/payments/${paymentId}`,

            getAuthConfig()

        );


    return response.data;

};


// ==================================================
// PAYMENT SUMMARY
// ==================================================
//
// Backend:
// GET /payments/summary
//
// ==================================================

export const getPaymentSummary = async () => {

    const response =
        await api.get(

            "/payments/summary",

            getAuthConfig()

        );


    return response.data;

};


// ==================================================
// GET PAYMENTS BY DATE
// ==================================================
//
// Backend:
// GET /payments/by-date
//
// Example:
// /payments/by-date?start_date=2026-08-01
//                         &end_date=2026-08-24
//
// ==================================================

export const getPaymentsByDate = async (
    startDate,
    endDate
) => {

    if (!startDate || !endDate) {

        throw new Error(
            "Start date and end date are required."
        );

    }


    const response =
        await api.get(

            "/payments/by-date",

            {

                ...getAuthConfig(),

                params: {

                    start_date:
                        startDate,

                    end_date:
                        endDate

                }

            }

        );


    return response.data;

};

