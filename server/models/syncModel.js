const db = require("../config/db");

// Add Operation to Sync Queue
const addToSyncQueue = async (
    table_name,
    record_id,
    operation
) => {

    const query = `
        INSERT INTO sync_queue
        (
            table_name,
            record_id,
            operation
        )
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

    const values = [
        table_name,
        record_id,
        operation
    ];

    const result = await db.query(query, values);

    return result.rows[0];

};

// Get Pending Sync Operations
const getPendingSync = async () => {

    const query = `
        SELECT *
        FROM sync_queue
        WHERE sync_status = 'Pending'
        ORDER BY created_at ASC;
    `;

    const result = await db.query(query);

    return result.rows;

};

// Mark Operation as Synced
const markAsSynced = async (sync_id) => {

    const query = `
        UPDATE sync_queue
        SET
            sync_status = 'Completed',
            synced_at = CURRENT_TIMESTAMP
        WHERE sync_id = $1
        RETURNING *;
    `;

    const result = await db.query(query, [sync_id]);

    return result.rows[0];

};

module.exports = {
    addToSyncQueue,
    getPendingSync,
    markAsSynced
};