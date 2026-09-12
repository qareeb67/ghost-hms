const db = require("../config/db");

/*
==================================================
HOSPITAL MANAGEMENT SYSTEM - MEDICINE MODEL
==================================================
Database access layer for medicines.

Responsibilities:
- Create medicine
- Retrieve medicines
- Retrieve medicine by ID
- Update medicine
- Delete medicine
- Search medicines

Keep business logic inside controllers/services.
Keep SQL inside this model.
==================================================
*/


// ==================================================
// SELECT FIELDS
// ==================================================

const MEDICINE_FIELDS = `
    medicine_id,
    medicine_name,
    category,
    quantity,
    unit_price,
    expiry_date,
    manufacturer,
    created_at
`;


// ==================================================
// CREATE MEDICINE
// ==================================================

const createMedicine = async (
    medicine_name,
    category,
    quantity,
    unit_price,
    expiry_date,
    manufacturer
) => {

    const query = `
        INSERT INTO medicines (
            medicine_name,
            category,
            quantity,
            unit_price,
            expiry_date,
            manufacturer
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING ${MEDICINE_FIELDS};
    `;

    const values = [
        medicine_name,
        category,
        quantity,
        unit_price,
        expiry_date,
        manufacturer
    ];

    const result = await db.query(query, values);

    return result.rows[0];
};


// ==================================================
// GET ALL MEDICINES
// ==================================================

const getAllMedicines = async () => {

    const query = `
        SELECT
            ${MEDICINE_FIELDS}
        FROM medicines
        ORDER BY medicine_name ASC, medicine_id ASC;
    `;

    const result = await db.query(query);

    return result.rows;
};


// ==================================================
// GET MEDICINE BY ID
// ==================================================

const getMedicineById = async (medicine_id) => {

    const query = `
        SELECT
            ${MEDICINE_FIELDS}
        FROM medicines
        WHERE medicine_id = $1;
    `;

    const result = await db.query(
        query,
        [medicine_id]
    );

    return result.rows[0] || null;
};


// ==================================================
// UPDATE MEDICINE
// ==================================================

const updateMedicine = async (
    medicine_id,
    medicine_name,
    category,
    quantity,
    unit_price,
    expiry_date,
    manufacturer
) => {

    const query = `
        UPDATE medicines
        SET
            medicine_name = $1,
            category = $2,
            quantity = $3,
            unit_price = $4,
            expiry_date = $5,
            manufacturer = $6
        WHERE medicine_id = $7
        RETURNING ${MEDICINE_FIELDS};
    `;

    const values = [
        medicine_name,
        category,
        quantity,
        unit_price,
        expiry_date,
        manufacturer,
        medicine_id
    ];

    const result = await db.query(
        query,
        values
    );

    return result.rows[0] || null;
};


// ==================================================
// DELETE MEDICINE
// ==================================================

const deleteMedicine = async (medicine_id) => {

    const query = `
        DELETE FROM medicines
        WHERE medicine_id = $1
        RETURNING ${MEDICINE_FIELDS};
    `;

    const result = await db.query(
        query,
        [medicine_id]
    );

    return result.rows[0] || null;
};


// ==================================================
// SEARCH MEDICINES
// ==================================================

const searchMedicines = async (keyword) => {

    const searchTerm = `%${keyword.trim()}%`;

    const query = `
        SELECT
            ${MEDICINE_FIELDS}
        FROM medicines
        WHERE
            medicine_name ILIKE $1
            OR category ILIKE $1
            OR manufacturer ILIKE $1
        ORDER BY
            medicine_name ASC,
            medicine_id ASC;
    `;

    const result = await db.query(
        query,
        [searchTerm]
    );

    return result.rows;
};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {
    createMedicine,
    getAllMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine,
    searchMedicines
};