const db = require("../config/db");

// Create Medicine
const createMedicine = async (
    medicine_name,
    category,
    quantity,
    unit_price,
    expiry_date,
    manufacturer
) => {

    const query = `
        INSERT INTO medicines
        (
            medicine_name,
            category,
            quantity,
            unit_price,
            expiry_date,
            manufacturer
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
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

// Get All Medicines
const getAllMedicines = async () => {

    const query = `
        SELECT *
        FROM medicines
        ORDER BY medicine_name ASC;
    `;

    const result = await db.query(query);

    return result.rows;

};

// Get Medicine By ID
const getMedicineById = async (id) => {

    const query = `
        SELECT *
        FROM medicines
        WHERE medicine_id = $1;
    `;

    const result = await db.query(query, [id]);

    return result.rows[0];

};

module.exports = {
    createMedicine,
    getAllMedicines,
    getMedicineById
};                                                                                                                                                                                                                                                                              