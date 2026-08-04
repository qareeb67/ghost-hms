const db = require("../config/db");

// Create Bill
const createBill = async (
    patient_id,
    amount,
    service,
    payment_status,
    payment_method
) => {

    const query = `
        INSERT INTO billing
        (
            patient_id,
            amount,
            service,
            payment_status,
            payment_method
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const values = [
        patient_id,
        amount,
        service,
        payment_status,
        payment_method
    ];

    const result = await db.query(query, values);

    return result.rows[0];

};

// Get All Bills
const getAllBills = async () => {

    const query = `
        SELECT *
        FROM billing
        ORDER BY created_at DESC;
    `;

    const result = await db.query(query);

    return result.rows;

};

// Get Bill By ID
const getBillById = async (id) => {

    const query = `
        SELECT *
        FROM billing
        WHERE bill_id = $1;
    `;

    const result = await db.query(query, [id]);

    return result.rows[0];

};

module.exports = {
    createBill,
    getAllBills,
    getBillById
};