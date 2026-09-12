const db = require("../config/db");


// ==================================================
// HOSPITAL MANAGEMENT SYSTEM — PAYMENT MODEL
// ==================================================
//
// Payments represent actual money received.
//
// Billing = what the patient owes.
// Payments = what the hospital actually received.
//
// A single bill can have multiple payments.
//
// ==================================================


// ==================================================
// CREATE PAYMENT
// ==================================================

const createPayment = async (
    bill_id,
    amount,
    payment_method,
    transaction_reference = null,
    received_by = null
) => {

    const client = await db.connect();

    try {

        await client.query("BEGIN");


        // ==========================================
        // GET BILL
        // ==========================================

        const billResult = await client.query(
            `
                SELECT
                    bill_id,
                    amount,
                    payment_status

                FROM billing

                WHERE bill_id = $1

                FOR UPDATE;
            `,
            [bill_id]
        );


        if (billResult.rows.length === 0) {

            throw new Error(
                "Bill not found."
            );

        }


        const bill =
            billResult.rows[0];


        // ==========================================
        // GET TOTAL PAID
        // ==========================================

        const paidResult = await client.query(
            `
                SELECT
                    COALESCE(
                        SUM(amount),
                        0
                    ) AS total_paid

                FROM payments

                WHERE bill_id = $1;
            `,
            [bill_id]
        );


        const totalPaid =
            Number(
                paidResult.rows[0].total_paid
            );


        const billAmount =
            Number(bill.amount);


        const paymentAmount =
            Number(amount);


        const outstanding =
            billAmount - totalPaid;

        // ==========================================
        // PREVENT PAYMENT ON FULLY PAID BILL
        // ==========================================

        if (outstanding <= 0) {

            throw new Error(
                "This bill has already been fully paid."
            );

        }

        // ==========================================
        // PREVENT OVERPAYMENT
        // ==========================================

        if (paymentAmount > outstanding) {

            throw new Error(
                `Payment exceeds outstanding balance of ₦${outstanding.toFixed(2)}.`
            );

        }


        // ==========================================
        // CREATE PAYMENT
        // ==========================================

        const paymentResult =
            await client.query(
                `
                    INSERT INTO payments (
                        bill_id,
                        amount,
                        payment_method,
                        transaction_reference,
                        received_by
                    )

                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    )

                    RETURNING *;
                `,
                [
                    bill_id,
                    paymentAmount,
                    payment_method,
                    transaction_reference,
                    received_by
                ]
            );


        const payment =
            paymentResult.rows[0];


        // ==========================================
        // CALCULATE NEW TOTAL
        // ==========================================

        const newTotalPaid =
            totalPaid + paymentAmount;


        const newOutstanding =
            billAmount - newTotalPaid;


        // ==========================================
        // DETERMINE BILL STATUS
        // ==========================================

        let newStatus = "Pending";


        if (newOutstanding <= 0) {

            newStatus = "Paid";

        } else if (newTotalPaid > 0) {

            newStatus = "Partially Paid";

        }


        // ==========================================
        // UPDATE BILL STATUS
        // ==========================================

        // ==========================================
        // UPDATE BILL STATUS
        // ==========================================
        //
        // The payment module controls bill payment status.
        //
        // Billing does not currently use an updated_at
        // column, so only payment_status is updated.
        //
        // ==========================================

        await client.query(
            `
        UPDATE billing

        SET
            payment_status = $1

        WHERE bill_id = $2;
    `,
            [
                newStatus,
                bill_id
            ]
        );

        await client.query("COMMIT");


        return {

            payment,

            bill_amount:
                billAmount,

            total_paid:
                newTotalPaid,

            amount_due:
                Math.max(
                    newOutstanding,
                    0
                ),

            payment_status:
                newStatus

        };

    } catch (err) {

        await client.query("ROLLBACK");

        throw err;

    } finally {

        client.release();

    }

};


// ==================================================
// GET PAYMENT BY ID
// ==================================================

const getPaymentById = async (
    payment_id
) => {

    const query = `
        SELECT

            pay.payment_id,

            pay.bill_id,

            b.patient_id,

            p.first_name || ' ' ||
            p.last_name
                AS patient_name,

            b.service,

            b.amount
                AS bill_amount,

            pay.amount
                AS payment_amount,

            pay.payment_method,

            pay.transaction_reference,

            pay.received_by,

            u.username
                AS received_by_username,

            pay.payment_date,

            pay.created_at

        FROM payments pay

        INNER JOIN billing b
            ON pay.bill_id = b.bill_id

        INNER JOIN patients p
            ON b.patient_id = p.patient_id

        LEFT JOIN users u
            ON pay.received_by = u.user_id

        WHERE pay.payment_id = $1;
    `;


    const result =
        await db.query(
            query,
            [payment_id]
        );


    return result.rows[0];

};


// ==================================================
// GET PAYMENTS FOR BILL
// ==================================================

const getPaymentsByBill = async (
    bill_id
) => {

    const query = `
        SELECT

            pay.payment_id,

            pay.bill_id,

            pay.amount,

            pay.payment_method,

            pay.transaction_reference,

            pay.received_by,

            u.username
                AS received_by_username,

            pay.payment_date,

            pay.created_at

        FROM payments pay

        LEFT JOIN users u
            ON pay.received_by = u.user_id

        WHERE pay.bill_id = $1

        ORDER BY
            pay.payment_date DESC,
            pay.payment_id DESC;
    `;


    const result =
        await db.query(
            query,
            [bill_id]
        );


    return result.rows;

};


// ==================================================
// GET ALL PAYMENTS
// ==================================================

const getAllPayments = async () => {

    const query = `
        SELECT

            pay.payment_id,

            pay.bill_id,

            b.patient_id,

            p.first_name || ' ' ||
            p.last_name
                AS patient_name,

            b.service,

            b.amount
                AS bill_amount,

            pay.amount
                AS payment_amount,

            pay.payment_method,

            pay.transaction_reference,

            pay.received_by,

            u.username
                AS received_by_username,

            pay.payment_date,

            pay.created_at

        FROM payments pay

        INNER JOIN billing b
            ON pay.bill_id = b.bill_id

        INNER JOIN patients p
            ON b.patient_id = p.patient_id

        LEFT JOIN users u
            ON pay.received_by = u.user_id

        ORDER BY
            pay.payment_date DESC,
            pay.payment_id DESC;
    `;


    const result =
        await db.query(query);


    return result.rows;

};


// ==================================================
// PAYMENT SUMMARY
// ==================================================

const getPaymentSummary = async () => {

    const query = `
        SELECT

            COUNT(*) AS total_payments,

            COALESCE(
                SUM(amount),
                0
            ) AS total_received,

            COALESCE(
                SUM(amount)
                FILTER (
                    WHERE payment_method = 'Cash'
                ),
                0
            ) AS total_cash,

            COALESCE(
                SUM(amount)
                FILTER (
                    WHERE payment_method = 'Card'
                ),
                0
            ) AS total_card,

            COALESCE(
                SUM(amount)
                FILTER (
                    WHERE payment_method = 'Transfer'
                ),
                0
            ) AS total_transfer,

            COALESCE(
                SUM(amount)
                FILTER (
                    WHERE payment_method = 'Insurance'
                ),
                0
            ) AS total_insurance

        FROM payments;
    `;


    const result =
        await db.query(query);


    return result.rows[0];

};


// ==================================================
// GET PAYMENTS BY DATE
// ==================================================

const getPaymentsByDate = async (
    startDate,
    endDate
) => {

    const query = `
        SELECT

            pay.payment_id,

            pay.bill_id,

            p.first_name || ' ' ||
            p.last_name
                AS patient_name,

            pay.amount,

            pay.payment_method,

            pay.transaction_reference,

            u.username
                AS received_by_username,

            pay.payment_date

        FROM payments pay

        INNER JOIN billing b
            ON pay.bill_id = b.bill_id

        INNER JOIN patients p
            ON b.patient_id = p.patient_id

        LEFT JOIN users u
            ON pay.received_by = u.user_id

        WHERE pay.payment_date >= $1

        AND pay.payment_date < $2

        ORDER BY pay.payment_date DESC;
    `;


    const result =
        await db.query(
            query,
            [
                startDate,
                endDate
            ]
        );


    return result.rows;

};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    createPayment,

    getPaymentById,

    getPaymentsByBill,

    getAllPayments,

    getPaymentSummary,

    getPaymentsByDate

};