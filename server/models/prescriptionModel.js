const db = require("../config/db");

/**
 * Create a prescription with all medication items.
 *
 * The prescription and its items are created inside one transaction.
 * If anything fails, everything is rolled back.
 */
const createPrescription = async ({
    record_id,
    patient_id,
    doctor_id,
    prescription_date,
    notes,
    status = "active",
    items = [],
}) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        // ---------------------------------------------------------
        // 1. Create prescription
        // ---------------------------------------------------------
        const prescriptionResult = await client.query(
            `
            INSERT INTO prescriptions (
                record_id,
                patient_id,
                doctor_id,
                prescription_date,
                notes,
                status
            )
            VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6)
            RETURNING *
            `,
            [
                record_id,
                patient_id,
                doctor_id,
                prescription_date || null,
                notes || null,
                status,
            ]
        );

        const prescription = prescriptionResult.rows[0];

        // ---------------------------------------------------------
        // 2. Create prescription items
        // ---------------------------------------------------------
        const createdItems = [];

        for (const item of items) {
            if (!item.medicine_id) {
                throw new Error(
                    "Every prescription item must have a medicine_id."
                );
            }

            // Pull the current medicine name directly from inventory.
            // This gives us a historical snapshot on the prescription.
            const medicineResult = await client.query(
                `
                SELECT medicine_id, medicine_name
                FROM medicines
                WHERE medicine_id = $1
                `,
                [item.medicine_id]
            );

            if (medicineResult.rows.length === 0) {
                throw new Error(
                    `Medicine with ID ${item.medicine_id} was not found.`
                );
            }

            const medicine = medicineResult.rows[0];

            const itemResult = await client.query(
                `
                INSERT INTO prescription_items (
                    prescription_id,
                    medicine_id,
                    medicine_name,
                    strength,
                    dosage,
                    frequency,
                    duration,
                    route,
                    instructions
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
                `,
                [
                    prescription.prescription_id,
                    medicine.medicine_id,
                    medicine.medicine_name,
                    item.strength || null,
                    item.dosage || null,
                    item.frequency || null,
                    item.duration || null,
                    item.route || null,
                    item.instructions || null,
                ]
            );

            createdItems.push(itemResult.rows[0]);
        }

        await client.query("COMMIT");

        return {
            ...prescription,
            items: createdItems,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};


/**
 * Get all prescriptions.
 *
 * Returns prescription-level information.
 * Medication items are loaded separately so the result stays structured.
 */
const getAllPrescriptions = async () => {
    const result = await db.query(`
        SELECT
            p.prescription_id,
            p.record_id,
            p.patient_id,
            p.doctor_id,
            p.prescription_date,
            p.notes,
            p.status,
            p.created_at,
            p.updated_at,

            CONCAT(pt.first_name, ' ', pt.last_name) AS patient_name,

            CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,

            d.specialization

        FROM prescriptions p

        JOIN patients pt
            ON pt.patient_id = p.patient_id

        JOIN doctors d
            ON d.doctor_id = p.doctor_id

        ORDER BY
            p.prescription_date DESC,
            p.prescription_id DESC
    `);

    return result.rows;
};


/**
 * Get one prescription together with all medication items.
 */
const getPrescriptionById = async (prescriptionId) => {
    const prescriptionResult = await db.query(
        `
        SELECT
            p.prescription_id,
            p.record_id,
            p.patient_id,
            p.doctor_id,
            p.prescription_date,
            p.notes,
            p.status,
            p.created_at,
            p.updated_at,

            CONCAT(pt.first_name, ' ', pt.last_name) AS patient_name,

            CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,

            d.specialization

        FROM prescriptions p

        JOIN patients pt
            ON pt.patient_id = p.patient_id

        JOIN doctors d
            ON d.doctor_id = p.doctor_id

        WHERE p.prescription_id = $1
        `,
        [prescriptionId]
    );

    if (prescriptionResult.rows.length === 0) {
        return null;
    }

    const prescription = prescriptionResult.rows[0];

    const itemsResult = await db.query(
        `
        SELECT
            prescription_item_id,
            prescription_id,
            medicine_id,
            medicine_name,
            strength,
            dosage,
            frequency,
            duration,
            route,
            instructions,
            created_at

        FROM prescription_items

        WHERE prescription_id = $1

        ORDER BY prescription_item_id ASC
        `,
        [prescriptionId]
    );

    return {
        ...prescription,
        items: itemsResult.rows,
    };
};


/**
 * Get prescription(s) belonging to a medical record.
 *
 * We return an array because the database currently allows
 * more than one prescription for the same medical record.
 */
const getPrescriptionsByRecordId = async (recordId) => {
    const result = await db.query(
        `
        SELECT
            p.prescription_id,
            p.record_id,
            p.patient_id,
            p.doctor_id,
            p.prescription_date,
            p.notes,
            p.status,
            p.created_at,
            p.updated_at,

            CONCAT(pt.first_name, ' ', pt.last_name) AS patient_name,

            CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,

            d.specialization

        FROM prescriptions p

        JOIN patients pt
            ON pt.patient_id = p.patient_id

        JOIN doctors d
            ON d.doctor_id = p.doctor_id

        WHERE p.record_id = $1

        ORDER BY
            p.prescription_date DESC,
            p.prescription_id DESC
        `,
        [recordId]
    );

    const prescriptions = [];

    for (const prescription of result.rows) {
        const itemsResult = await db.query(
            `
            SELECT
                prescription_item_id,
                prescription_id,
                medicine_id,
                medicine_name,
                strength,
                dosage,
                frequency,
                duration,
                route,
                instructions,
                created_at

            FROM prescription_items

            WHERE prescription_id = $1

            ORDER BY prescription_item_id ASC
            `,
            [prescription.prescription_id]
        );

        prescriptions.push({
            ...prescription,
            items: itemsResult.rows,
        });
    }

    return prescriptions;
};


/**
 * Update prescription details.
 *
 * Medication items are intentionally not modified here.
 * They have their own replacement function below.
 */
const updatePrescription = async (
    prescriptionId,
    {
        prescription_date,
        notes,
        status,
    }
) => {
    const result = await db.query(
        `
        UPDATE prescriptions

        SET
            prescription_date = COALESCE($1, prescription_date),
            notes = $2,
            status = COALESCE($3, status),
            updated_at = CURRENT_TIMESTAMP

        WHERE prescription_id = $4

        RETURNING *
        `,
        [
            prescription_date || null,
            notes || null,
            status || null,
            prescriptionId,
        ]
    );

    return result.rows[0] || null;
};


/**
 * Replace all medication items on a prescription.
 *
 * This is useful when editing a prescription:
 *
 * old items -> delete
 * new items -> insert
 *
 * Everything happens inside one transaction.
 */
const replacePrescriptionItems = async (prescriptionId, items = []) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        // Make sure the prescription exists.
        const prescriptionResult = await client.query(
            `
            SELECT prescription_id
            FROM prescriptions
            WHERE prescription_id = $1
            `,
            [prescriptionId]
        );

        if (prescriptionResult.rows.length === 0) {
            throw new Error("Prescription not found.");
        }

        // Remove existing items.
        await client.query(
            `
            DELETE FROM prescription_items
            WHERE prescription_id = $1
            `,
            [prescriptionId]
        );

        const createdItems = [];

        // Insert replacement items.
        for (const item of items) {
            if (!item.medicine_id) {
                throw new Error(
                    "Every prescription item must have a medicine_id."
                );
            }

            const medicineResult = await client.query(
                `
                SELECT medicine_id, medicine_name
                FROM medicines
                WHERE medicine_id = $1
                `,
                [item.medicine_id]
            );

            if (medicineResult.rows.length === 0) {
                throw new Error(
                    `Medicine with ID ${item.medicine_id} was not found.`
                );
            }

            const medicine = medicineResult.rows[0];

            const itemResult = await client.query(
                `
                INSERT INTO prescription_items (
                    prescription_id,
                    medicine_id,
                    medicine_name,
                    strength,
                    dosage,
                    frequency,
                    duration,
                    route,
                    instructions
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
                `,
                [
                    prescriptionId,
                    medicine.medicine_id,
                    medicine.medicine_name,
                    item.strength || null,
                    item.dosage || null,
                    item.frequency || null,
                    item.duration || null,
                    item.route || null,
                    item.instructions || null,
                ]
            );

            createdItems.push(itemResult.rows[0]);
        }

        await client.query(
            `
            UPDATE prescriptions
            SET updated_at = CURRENT_TIMESTAMP
            WHERE prescription_id = $1
            `,
            [prescriptionId]
        );

        await client.query("COMMIT");

        return createdItems;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};


/**
 * Delete a prescription.
 *
 * prescription_items are automatically deleted because of
 * ON DELETE CASCADE on prescription_items.prescription_id.
 */
const deletePrescription = async (prescriptionId) => {
    const result = await db.query(
        `
        DELETE FROM prescriptions
        WHERE prescription_id = $1
        RETURNING *
        `,
        [prescriptionId]
    );

    return result.rows[0] || null;
};


module.exports = {
    createPrescription,
    getAllPrescriptions,
    getPrescriptionById,
    getPrescriptionsByRecordId,
    updatePrescription,
    replacePrescriptionItems,
    deletePrescription,
};