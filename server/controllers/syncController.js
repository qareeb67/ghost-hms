const syncModel = require("../models/syncModel");

// Add Operation to Sync Queue
const addToSyncQueue = async (req, res, next) => {

    try {

        const {
            table_name,
            record_id,
            operation
        } = req.body;

        const sync = await syncModel.addToSyncQueue(
            table_name,
            record_id,
            operation
        );

        res.status(201).json({
            success: true,
            message: "Operation added to sync queue",
            sync
        });

    } catch (err) {

        next(err);

    }

};

// Get Pending Sync Operations
const getPendingSync = async (req, res, next) => {

    try {

        const queue = await syncModel.getPendingSync();

        res.status(200).json({
            success: true,
            message: "Pending sync operations retrieved",
            queue
        });

    } catch (err) {

        next(err);

    }

};

// Mark Operation as Synced
const markAsSynced = async (req, res, next) => {

    try {

        const { id } = req.params;

        const sync = await syncModel.markAsSynced(id);

        if (!sync) {
            return res.status(404).json({
                success: false,
                message: "Sync record not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Operation synchronized successfully",
            sync
        });

    } catch (err) {

        next(err);

    }

};

module.exports = {
    addToSyncQueue,
    getPendingSync,
    markAsSynced
};