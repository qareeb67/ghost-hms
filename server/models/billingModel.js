const db = require("../config/db");


// ==================================================
// HOSPITAL MANAGEMENT SYSTEM — BILLING MODEL
// ==================================================
//
// Billing represents what the patient owes.
//
// Payments represent actual money received.
//
// Relationship:
//
// billing.bill_id
//        ↓
// payments.bill_id
//
// One bill can have MANY payments.
//
// ==================================================


// ==================================================
// CREATE BILL
// ==================================================

const createBill = async (
    patient_id,
    amount,
    service,
    created_by
) => {

    const query = `
        INSERT INTO billing (
            patient_id,
            amount,
            service,
            payment_status,
            created_by
        )
        VALUES (
            $1,
            $2,
            $3,
            'Pending',
            $4
        )
        RETURNING *;
    `;

    const values = [
        patient_id,
        amount,
        service,
        created_by
    ];

    const result = await db.query(
        query,
        values
    );

    return result.rows[0];

};


// ==================================================
// GET ALL BILLS
// ==================================================

const getAllBills = async () => {

    const query = `
        SELECT

            b.bill_id,

            b.patient_id,

            p.first_name || ' ' || p.last_name
                AS patient_name,

            b.amount,

            b.service,

            b.payment_status,

            COALESCE(
                payment_totals.total_paid,
                0
            ) AS total_paid,

            GREATEST(
                b.amount -
                COALESCE(
                    payment_totals.total_paid,
                    0
                ),
                0
            ) AS amount_due,

            latest_payment.payment_method
                AS payment_method,

            latest_payment.payment_date
                AS last_payment_date,

            COALESCE(
                payment_totals.payment_count,
                0
            ) AS payment_count,

            b.created_by,

            creator.username
                AS created_by_username,

            b.created_at,

            b.updated_at

        FROM billing b

        INNER JOIN patients p
            ON b.patient_id = p.patient_id

        LEFT JOIN users creator
            ON b.created_by = creator.user_id


        -- ==========================================
        -- PAYMENT TOTALS
        -- ==========================================

        LEFT JOIN (
            SELECT

                bill_id,

                SUM(amount) AS total_paid,

                COUNT(*) AS payment_count

            FROM payments

            GROUP BY bill_id

        ) payment_totals

            ON payment_totals.bill_id = b.bill_id


        -- ==========================================
        -- LATEST PAYMENT
        -- ==========================================

        LEFT JOIN LATERAL (

            SELECT

                pay.payment_method,

                pay.payment_date

            FROM payments pay

            WHERE pay.bill_id = b.bill_id

            ORDER BY
                pay.payment_date DESC,
                pay.payment_id DESC

            LIMIT 1

        ) latest_payment

            ON TRUE


        ORDER BY
            b.created_at DESC,
            b.bill_id DESC;
    `;


    const result = await db.query(query);

    return result.rows;

};


// ==================================================
// GET BILL BY ID
// ==================================================

const getBillById = async (id) => {

    const query = `
        SELECT

            b.bill_id,

            b.patient_id,

            p.first_name || ' ' || p.last_name
                AS patient_name,

            b.amount,

            b.service,

            b.payment_status,

            COALESCE(
                payment_totals.total_paid,
                0
            ) AS total_paid,

            GREATEST(
                b.amount -
                COALESCE(
                    payment_totals.total_paid,
                    0
                ),
                0
            ) AS amount_due,

            latest_payment.payment_method
                AS payment_method,

            latest_payment.payment_date
                AS last_payment_date,

            COALESCE(
                payment_totals.payment_count,
                0
            ) AS payment_count,

            b.created_by,

            creator.username
                AS created_by_username,

            b.created_at,

            b.updated_at

        FROM billing b

        INNER JOIN patients p
            ON b.patient_id = p.patient_id

        LEFT JOIN users creator
            ON b.created_by = creator.user_id


        -- ==========================================
        -- PAYMENT TOTALS
        -- ==========================================

        LEFT JOIN (
            SELECT

                bill_id,

                SUM(amount) AS total_paid,

                COUNT(*) AS payment_count

            FROM payments

            GROUP BY bill_id

        ) payment_totals

            ON payment_totals.bill_id = b.bill_id


        -- ==========================================
        -- LATEST PAYMENT
        -- ==========================================

        LEFT JOIN LATERAL (

            SELECT

                pay.payment_method,

                pay.payment_date

            FROM payments pay

            WHERE pay.bill_id = b.bill_id

            ORDER BY
                pay.payment_date DESC,
                pay.payment_id DESC

            LIMIT 1

        ) latest_payment

            ON TRUE


        WHERE b.bill_id = $1;
    `;

    const result = await db.query(
        query,
        [id]
    );

    return result.rows[0];

};


// ==================================================
// UPDATE BILL
// ==================================================

const updateBill = async (
    bill_id,
    patient_id,
    amount,
    service
) => {

    const query = `
        UPDATE billing

        SET

            patient_id = $1,

            amount = $2,

            service = $3,

            updated_at = CURRENT_TIMESTAMP

        WHERE bill_id = $4

        RETURNING *;
    `;

    const values = [
        patient_id,
        amount,
        service,
        bill_id
    ];

    const result = await db.query(
        query,
        values
    );

    return result.rows[0];

};


// ==================================================
// DELETE BILL
// ==================================================

const deleteBill = async (bill_id) => {

    const query = `
        DELETE FROM billing

        WHERE bill_id = $1

        RETURNING *;
    `;

    const result = await db.query(
        query,
        [bill_id]
    );

    return result.rows[0];

};


// ==================================================
// GET BILLING SUMMARY
// ==================================================

const getBillingSummary = async () => {

    const query = `
        SELECT

            COUNT(*) AS total_bills,

            COUNT(*) FILTER (
                WHERE payment_status = 'Paid'
            ) AS paid_bills,

            COUNT(*) FILTER (
                WHERE payment_status = 'Partially Paid'
            ) AS partially_paid_bills,

            COUNT(*) FILTER (
                WHERE payment_status = 'Pending'
            ) AS pending_bills,

            COALESCE(
                SUM(amount),
                0
            ) AS total_billed,

            COALESCE(
                SUM(
                    COALESCE(payment_totals.total_paid, 0)
                ),
                0
            ) AS total_paid,

            COALESCE(
                SUM(
                    GREATEST(
                        amount -
                        COALESCE(
                            payment_totals.total_paid,
                            0
                        ),
                        0
                    )
                ),
                0
            ) AS total_due

        FROM billing b

        LEFT JOIN (

            SELECT

                bill_id,

                SUM(amount) AS total_paid

            FROM payments

            GROUP BY bill_id

        ) payment_totals

            ON payment_totals.bill_id = b.bill_id;
    `;

    const result = await db.query(query);

    return result.rows[0];

};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    createBill,

    getAllBills,

    getBillById,

    updateBill,

    deleteBill,

    getBillingSummary

};