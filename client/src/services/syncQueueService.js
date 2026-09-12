
import {
    offlineGetAll,
    offlineCreate,
    offlineUpdate,
    offlineDelete
} from "./offlineService";


/*
==================================================
QUEUE OPERATION
==================================================

Hospital Management System Offline Sync Queue

Responsibilities:

1. Store CREATE / UPDATE / DELETE / COMPLETE operations.
2. Prevent duplicate operations.
3. Collapse repeated UPDATE operations.
4. Preserve CREATE → UPDATE ordering.
5. Preserve serverId when available.
6. Keep retry information.
7. Never perform synchronization itself.

Synchronization belongs to:

syncEngine.js

==================================================
*/


export const queueOperation = async (
    operation
) => {

    if (!operation) {

        throw new Error(
            "Cannot queue an empty operation."
        );

    }


    if (!operation.type) {

        throw new Error(
            "Cannot queue operation without a type."
        );

    }


    if (!operation.storeName) {

        throw new Error(
            "Cannot queue operation without a storeName."
        );

    }


    const queue =
        await offlineGetAll(
            "sync_queue"
        );


    /*
    ==================================================
    CREATE
    ==================================================
    */

    if (
        operation.type === "CREATE"
    ) {

        const localId =
            operation.data?.id;


        /*
        ----------------------------------------------
        DUPLICATE CREATE
        ----------------------------------------------
        */

        if (
            localId !== undefined &&
            localId !== null
        ) {

            const duplicate =
                queue.find(
                    (item) =>

                        item.status === "pending"

                        &&

                        item.type === "CREATE"

                        &&

                        item.storeName ===
                            operation.storeName

                        &&

                        String(
                            item.data?.id
                        ) ===
                        String(localId)
                );


            if (duplicate) {

                console.log(
                    "ℹ️ Duplicate CREATE ignored:",
                    duplicate.id
                );


                return duplicate;

            }

        }

    }


    /*
    ==================================================
    UPDATE
    ==================================================
    */

    if (
        operation.type === "UPDATE"
    ) {

        const recordId =
            operation.recordId;


        /*
        ----------------------------------------------
        FIND EXISTING UPDATE
        ----------------------------------------------
        */

        const existingUpdate =
            queue.find(
                (item) =>

                    item.status === "pending"

                    &&

                    item.type === "UPDATE"

                    &&

                    item.storeName ===
                        operation.storeName

                    &&

                    String(
                        item.recordId
                    ) ===
                    String(recordId)
            );


        /*
        ----------------------------------------------
        MERGE UPDATE
        ----------------------------------------------

        Multiple offline edits should become ONE
        pending UPDATE.

        Example:

        Doctor:
        Cardiology
          ↓
        Neurology
          ↓
        Pediatrics

        Queue should contain:

        ONE UPDATE

        containing the latest state.
        ----------------------------------------------
        */

        if (existingUpdate) {

            const mergedOperation = {

                ...existingUpdate,

                ...operation,

                id:
                    existingUpdate.id,

                recordId:
                    existingUpdate.recordId,

                /*
                New serverId wins only when available.
                */

                serverId:
                    operation.serverId ??
                    existingUpdate.serverId ??
                    null,

                status:
                    "pending",

                attempts:
                    existingUpdate.attempts || 0,

                createdAt:
                    existingUpdate.createdAt,

                updatedAt:
                    new Date().toISOString(),

                lastAttemptAt:
                    null,

                lastError:
                    null,

                lastFailedAt:
                    null

            };


            await offlineUpdate(
                "sync_queue",
                mergedOperation
            );


            console.log(
                "🔄 UPDATE operation merged:",
                existingUpdate.id
            );


            return mergedOperation;

        }

    }


    /*
    ==================================================
    DELETE
    ==================================================
    */

    if (
        operation.type === "DELETE"
    ) {

        const recordId =
            operation.recordId;


        /*
        ----------------------------------------------
        DUPLICATE DELETE
        ----------------------------------------------
        */

        const duplicateDelete =
            queue.find(
                (item) =>

                    item.status === "pending"

                    &&

                    item.type === "DELETE"

                    &&

                    item.storeName ===
                        operation.storeName

                    &&

                    String(
                        item.recordId
                    ) ===
                    String(recordId)
            );


        if (duplicateDelete) {

            console.log(
                "ℹ️ Duplicate DELETE ignored:",
                duplicateDelete.id
            );


            return duplicateDelete;

        }


        /*
        ----------------------------------------------
        LOCAL-ONLY CREATE → DELETE
        ----------------------------------------------

        If a record was:

        CREATE offline

        and then

        DELETE offline

        there is no reason to send CREATE to the server.

        We remove the pending CREATE operation and
        do NOT create a DELETE operation.

        The local record has already been removed.

        ----------------------------------------------
        */

        const pendingCreate =
            queue.find(
                (item) =>

                    item.status === "pending"

                    &&

                    item.type === "CREATE"

                    &&

                    item.storeName ===
                        operation.storeName

                    &&

                    String(
                        item.data?.id
                    ) ===
                    String(recordId)
            );


        if (pendingCreate) {

            /*
            ------------------------------------------
            REMOVE CREATE
            ------------------------------------------
            */

            await offlineDelete(
                "sync_queue",
                pendingCreate.id
            );


            /*
            ------------------------------------------
            REMOVE ANY PENDING UPDATE
            ------------------------------------------
            */

            const pendingUpdate =
                queue.find(
                    (item) =>

                        item.status === "pending"

                        &&

                        item.type === "UPDATE"

                        &&

                        item.storeName ===
                            operation.storeName

                        &&

                        String(
                            item.recordId
                        ) ===
                        String(recordId)
                );


            if (pendingUpdate) {

                await offlineDelete(
                    "sync_queue",
                    pendingUpdate.id
                );

            }


            console.log(
                "🗑️ Local-only CREATE/UPDATE cancelled by DELETE:",
                recordId
            );


            return {

                cancelled:
                    true,

                localOnly:
                    true,

                recordId

            };

        }

    }


    /*
    ==================================================
    CREATE QUEUE RECORD
    ==================================================
    */

    const queuedOperation = {

        ...operation,

        status:
            "pending",

        attempts:
            operation.attempts || 0,

        createdAt:
            operation.createdAt ||
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

        lastAttemptAt:
            null,

        lastError:
            null,

        lastFailedAt:
            null

    };


    /*
    ==================================================
    SAVE QUEUED OPERATION
    ==================================================
    */

    const savedOperation =
        await offlineCreate(
            "sync_queue",
            queuedOperation
        );


    console.log(
        "📥 Operation queued:",
        savedOperation
    );


    return savedOperation;

};


/*
==================================================
GET PENDING OPERATIONS
==================================================
*/

export const getPendingOperations =
async () => {

    const queue =
        await offlineGetAll(
            "sync_queue"
        );


    return queue

        .filter(
            (item) =>

                item.status ===
                "pending"
        )

        .sort(
            (a, b) => {

                const aTime =
                    new Date(
                        a.createdAt || 0
                    ).getTime();


                const bTime =
                    new Date(
                        b.createdAt || 0
                    ).getTime();


                /*
                If timestamps are identical,
                IndexedDB IDs provide a stable fallback.
                */

                if (
                    aTime === bTime
                ) {

                    return (
                        Number(a.id || 0) -
                        Number(b.id || 0)
                    );

                }


                return (
                    aTime -
                    bTime
                );

            }
        );

};


/*
==================================================
MARK OPERATION PROCESSING
==================================================
*/

export const markOperationProcessing =
async (
    operation
) => {

    if (!operation?.id) {

        throw new Error(
            "Cannot mark operation processing without an ID."
        );

    }


    const updatedOperation = {

        ...operation,

        status:
            "processing",

        attempts:
            (operation.attempts || 0) + 1,

        lastAttemptAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

        lastError:
            null

    };


    return await offlineUpdate(
        "sync_queue",
        updatedOperation
    );

};


/*
==================================================
MARK OPERATION FAILED
==================================================
*/

export const markOperationFailed =
async (
    operation,
    error
) => {

    if (!operation?.id) {

        throw new Error(
            "Cannot mark operation failed without an ID."
        );

    }


    const updatedOperation = {

        ...operation,

        /*
        ----------------------------------------------
        IMPORTANT

        Failed operations return to pending.

        The sync engine can retry them when the
        network becomes available again.
        ----------------------------------------------
        */

        status:
            "pending",

        lastError:
            error?.response?.data?.message ||
            error?.message ||
            String(error),

        lastErrorDetails:
            error?.response?.data
                ? JSON.stringify(
                    error.response.data
                )
                : null,

        lastErrorStatus:
            error?.response?.status ??
            null,

        lastFailedAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    console.warn(
        "⚠️ Sync operation failed and returned to pending:",
        updatedOperation
    );


    return await offlineUpdate(
        "sync_queue",
        updatedOperation
    );

};


/*
==================================================
MARK OPERATION PENDING
==================================================
*/

export const markOperationPending =
async (
    operation
) => {

    if (!operation?.id) {

        throw new Error(
            "Cannot reset operation without an ID."
        );

    }


    const updatedOperation = {

        ...operation,

        status:
            "pending",

        updatedAt:
            new Date().toISOString(),

        lastAttemptAt:
            null

    };


    return await offlineUpdate(
        "sync_queue",
        updatedOperation
    );

};


/*
==================================================
REMOVE QUEUED OPERATION
==================================================
*/

export const removeQueuedOperation =
async (
    id
) => {

    if (
        id === undefined ||
        id === null
    ) {

        throw new Error(
            "Cannot remove queue operation without ID."
        );

    }


    console.log(
        "🗑️ Removing synchronized operation:",
        id
    );


    return await offlineDelete(
        "sync_queue",
        id
    );

};

