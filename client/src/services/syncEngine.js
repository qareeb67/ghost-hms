
import api from "./api";

import {
    offlineGetAll,
    offlineUpdate,
    offlineDelete
} from "./offlineService";

import {
    resolveLocalRelations
} from "./offlineDataService";

import {
    getPendingOperations,
    removeQueuedOperation,
    markOperationProcessing,
    markOperationPending,
    markOperationFailed
} from "./syncQueueService";


/*
==================================================
HOSPITAL MANAGEMENT SYSTEM SYNC ENGINE
==================================================

Responsibilities:

1. Synchronize offline CREATE operations.
2. Synchronize offline UPDATE operations.
3. Synchronize offline COMPLETE operations.
4. Synchronize offline DELETE operations.
5. Reconcile server records into IndexedDB.
6. Preserve local IndexedDB IDs.
7. Respect CREATE -> UPDATE dependencies.
8. Stop safely when connectivity is lost.

IMPORTANT:

IndexedDB:
    id
        = local record identifier

Server:
    patient_id
    doctor_id
    appointment_id
    etc.
        = server identifier

The two identifiers must NEVER be confused.
==================================================
*/


/*
==================================================
AUTH
==================================================
*/

const getToken = () => {

    return localStorage.getItem(
        "token"
    );

};


const getAuthConfig = () => {

    const token =
        getToken();

    return {

        headers: {

            Authorization:
                `Bearer ${token}`

        }

    };

};


/*
==================================================
NETWORK
==================================================
*/

const isOnline = () => {

    return (
        typeof navigator !== "undefined" &&
        navigator.onLine === true
    );

};


/*
==================================================
STORE CONFIGURATION
==================================================
*/

const STORE_CONFIG = {

    patients: {

        idField:
            "patient_id",

        endpoint:
            "/patients",

        responseKey:
            "patient",

        updateMethod:
            "put"

    },


    doctors: {

        idField:
            "doctor_id",

        endpoint:
            "/doctors",

        responseKey:
            "doctor",

        updateMethod:
            "put"

    },


    appointments: {

        idField:
            "appointment_id",

        endpoint:
            "/appointments",

        responseKey:
            "appointment",

        updateMethod:
            "put"

    },


    medical_records: {

        idField:
            "record_id",

        endpoint:
            "/medical-records",

        responseKey:
            "medicalRecord",

        updateMethod:
            "patch"

    },


    laboratory: {

        idField:
            "test_id",

        endpoint:
            "/laboratory",

        responseKey:
            "laboratoryTest",

        updateMethod:
            "patch"

    },


    billing: {

        idField:
            "bill_id",

        endpoint:
            "/billing",

        responseKey:
            "bill",

        updateMethod:
            "patch"

    },


    medicines: {

        idField:
            "medicine_id",

        endpoint:
            "/medicines",

        responseKey:
            "medicine",

        updateMethod:
            "patch"

    },


    emergency: {

        idField:
            "emergency_id",

        endpoint:
            "/emergency",

        responseKey:
            "emergency",

        updateMethod:
            "patch",

        completeEndpoint:
            "/emergency",

        completeResponseKey:
            "emergency",

        completeMethod:
            "patch"

    }

};


/*
==================================================
GET STORE CONFIG
==================================================
*/

const getStoreConfig = (
    storeName
) => {

    const config =
        STORE_CONFIG[
            storeName
        ];


    if (!config) {

        throw new Error(
            `Unsupported sync store: ${storeName}`
        );

    }


    return config;

};


/*
==================================================
CLEAN PAYLOAD
==================================================

Removes IndexedDB-only metadata.

The server must never receive:

    id
    _syncStatus
    _localOnly
    etc.

Also removes empty values and normalizes
date_of_birth.
==================================================
*/

const cleanPayload = (
    record
) => {

    if (!record) {

        return {};

    }


    const payload = {
        ...record
    };


    /*
    ----------------------------------------------
    REMOVE INDEXEDDB METADATA
    ----------------------------------------------
    */

    [
        "id",
        "_syncStatus",
        "_localOnly",
        "_createdOffline",
        "_updatedOffline",
        "_createdAt",
        "_updatedAt",
        "_syncedAt"
    ].forEach(
        (field) => {

            delete payload[field];

        }
    );


    /*
    ----------------------------------------------
    REMOVE EMPTY VALUES
    ----------------------------------------------
    */

    Object.keys(
        payload
    ).forEach(
        (key) => {

            const value =
                payload[key];


            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                delete payload[key];

            }

        }
    );


    /*
    ----------------------------------------------
    NORMALIZE DATE OF BIRTH
    ----------------------------------------------
    */

    if (
        payload.date_of_birth
    ) {

        const date =
            new Date(
                payload.date_of_birth
            );


        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {

            payload.date_of_birth =
                date
                    .toISOString()
                    .split("T")[0];

        }

    }


    return payload;

};


/*
==================================================
PREPARE CREATE PAYLOAD
==================================================

Central CREATE payload preparation.

All CREATE operations pass through this function.

Only resources with a special server contract
receive resource-specific transformation.

Other resources safely receive the cleaned payload.
==================================================
*/

const prepareCreatePayload = (
    storeName,
    payload
) => {

    /*
    ----------------------------------------------
    DEFAULT
    ----------------------------------------------

    Patients, doctors, medical records, laboratory,
    billing, medicines and emergency currently use
    the generic cleaned payload.
    */

    if (
        storeName !== "appointments"
    ) {

        return payload;

    }


    /*
    ----------------------------------------------
    APPOINTMENTS
    ----------------------------------------------
    */

    const patientId =
        Number(
            payload?.patient_id
        );


    const doctorId =
        Number(
            payload?.doctor_id
        );


    const appointmentDate =
        typeof payload?.appointment_date === "string"
            ? payload.appointment_date.split("T")[0]
            : payload?.appointment_date;


    const appointmentTime =
        typeof payload?.appointment_time === "string"
            ? payload.appointment_time.slice(0, 5)
            : payload?.appointment_time;


    const status =
        payload?.status ||
        "Scheduled";


    /*
    ----------------------------------------------
    VALIDATE PATIENT
    ----------------------------------------------
    */

    if (
        !Number.isInteger(patientId) ||
        patientId < 1
    ) {

        throw new Error(
            "Cannot sync appointment: valid patient_id is required."
        );

    }


    /*
    ----------------------------------------------
    VALIDATE DOCTOR
    ----------------------------------------------
    */

    if (
        !Number.isInteger(doctorId) ||
        doctorId < 1
    ) {

        throw new Error(
            "Cannot sync appointment: valid doctor_id is required."
        );

    }


    /*
    ----------------------------------------------
    VALIDATE DATE
    ----------------------------------------------
    */

    if (
        typeof appointmentDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(
            appointmentDate
        )
    ) {

        throw new Error(
            "Cannot sync appointment: appointment_date must be YYYY-MM-DD."
        );

    }


    /*
    ----------------------------------------------
    VALIDATE TIME
    ----------------------------------------------
    */

    if (
        typeof appointmentTime !== "string" ||
        !/^([01]\d|2[0-3]):([0-5]\d)$/.test(
            appointmentTime
        )
    ) {

        throw new Error(
            "Cannot sync appointment: appointment_time must be HH:MM."
        );

    }


    /*
    ----------------------------------------------
    VALIDATE STATUS
    ----------------------------------------------
    */

    if (
        ![
            "Scheduled",
            "Completed",
            "Cancelled"
        ].includes(
            status
        )
    ) {

        throw new Error(
            "Cannot sync appointment: status must be Scheduled, Completed, or Cancelled."
        );

    }


    /*
    ----------------------------------------------
    BUILD FINAL APPOINTMENT PAYLOAD
    ----------------------------------------------
    */

    const prepared = {

        patient_id:
            patientId,

        doctor_id:
            doctorId,

        appointment_date:
            appointmentDate,

        appointment_time:
            appointmentTime,

        status

    };


    /*
    ----------------------------------------------
    OPTIONAL REASON
    ----------------------------------------------
    */

    if (
        payload?.reason !== undefined &&
        payload?.reason !== null &&
        String(
            payload.reason
        ).trim() !== ""
    ) {

        prepared.reason =
            String(
                payload.reason
            );

    }


    return prepared;

};


/*
==================================================
FIND LOCAL RECORD
==================================================
*/

const findLocalRecord = async (
    storeName,
    identifier
) => {

    if (
        identifier === undefined ||
        identifier === null
    ) {

        return null;

    }


    const config =
        getStoreConfig(
            storeName
        );


    const records =
        await offlineGetAll(
            storeName
        );


    const identifierString =
        String(
            identifier
        );


    const found =
        records.find(
            (
                record
            ) => {

                const localId =
                    record?.id;


                const serverId =
                    record?.[
                        config.idField
                    ];


                return (

                    localId !== undefined &&
                    localId !== null &&
                    String(
                        localId
                    ) === identifierString

                ) || (

                    serverId !== undefined &&
                    serverId !== null &&
                    String(
                        serverId
                    ) === identifierString

                );

            }
        );


    return found || null;

};


/*
==================================================
MARK LOCAL RECORD AS SYNCED
==================================================
*/

const markRecordSynced = async (
    storeName,
    localRecord,
    serverRecord
) => {

    if (!localRecord) {

        return null;

    }


    const syncedRecord = {

        ...serverRecord,

        /*
        ------------------------------------------
        ALWAYS PRESERVE LOCAL INDEXEDDB ID
        ------------------------------------------
        */

        id:
            localRecord.id,

        /*
        ------------------------------------------
        SYNC STATE
        ------------------------------------------
        */

        _syncStatus:
            "synced",

        _localOnly:
            false,

        _createdOffline:
            false,

        _updatedOffline:
            false,

        _syncedAt:
            new Date().toISOString()

    };


    await offlineUpdate(
        storeName,
        syncedRecord
    );


    return syncedRecord;

};


/*
==================================================
SYNC CREATE
==================================================
*/

const syncCreate = async (
    operation
) => {

    const {

        storeName,
        data

    } = operation;


    const config =
        getStoreConfig(
            storeName
        );


    console.log(
        `📤 Sync CREATE: ${storeName}`,
        operation
    );


    /*
    ----------------------------------------------
    FIND LOCAL RECORD
    ----------------------------------------------
    */

    let localRecord =
        await findLocalRecord(
            storeName,
            data?.id
        );


    /*
    ----------------------------------------------
    FALLBACK TO QUEUED DATA
    ----------------------------------------------
    */

    if (!localRecord) {

        localRecord =
            data;

    }


    if (!localRecord) {

        throw new Error(
            `Cannot sync CREATE. No local ${storeName} record found.`
        );

    }


    /*
    ----------------------------------------------
    CLEAN PAYLOAD
    ----------------------------------------------
    */

    let payload =
        cleanPayload(
            localRecord
        );


    /*
    ----------------------------------------------
    RESOLVE LOCAL RELATIONS
    ----------------------------------------------
    */

    const relationResult =
        await resolveLocalRelations(
            localRecord
        );


    if (
        relationResult.unresolved.length > 0
    ) {

        console.log(
            `⏳ ${storeName} CREATE deferred. Waiting for referenced records to synchronize.`,
            relationResult.unresolved
        );


        return {

            deferred:
                true

        };

    }


    payload = {

        ...payload,

        ...relationResult.payload

    };


    /*
    ----------------------------------------------
    PREPARE RESOURCE-SPECIFIC CREATE PAYLOAD
    ----------------------------------------------
    */

    payload =
        prepareCreatePayload(
            storeName,
            payload
        );


    /*
    ----------------------------------------------
    NEVER SEND SERVER ID
    ----------------------------------------------
    */

    delete payload[
        config.idField
    ];


    if (
        storeName === "medical_records"
    ) {

        delete payload.medical_record_id;

    }


    console.log(
        `📦 CREATE payload: ${storeName}`,
        payload
    );


    /*
    ----------------------------------------------
    SEND CREATE
    ----------------------------------------------
    */

    let response;


    try {

        response =
            await api.post(
                config.endpoint,
                payload,
                getAuthConfig()
            );

    } catch (error) {

        console.error(
            `❌ CREATE failed: ${storeName}`,
            error.response?.status,
            error.response?.data
        );

        throw error;

    }


    /*
    ----------------------------------------------
    GET SERVER RECORD
    ----------------------------------------------
    */

    const serverRecord =
        response.data?.[
            config.responseKey
        ]
        ||
        response.data?.record;


    if (!serverRecord) {

        throw new Error(
            `Server did not return ${config.responseKey} after CREATE.`
        );

    }


    /*
    ----------------------------------------------
    RECONCILE LOCAL RECORD
    ----------------------------------------------
    */

    const syncedRecord =
        await markRecordSynced(
            storeName,
            localRecord,
            serverRecord
        );


    console.log(
        `✅ CREATE synchronized: ${storeName}`,
        syncedRecord
    );


    return serverRecord;

};


/*
==================================================
SYNC UPDATE
==================================================
*/

const syncUpdate = async (
    operation
) => {

    const {

        storeName,

        recordId,

        serverId:
        queuedServerId,

        data

    } = operation;


    const config =
        getStoreConfig(
            storeName
        );


    console.log(
        `📤 Sync UPDATE: ${storeName}`,
        operation
    );


    /*
    ----------------------------------------------
    FIND LOCAL RECORD
    ----------------------------------------------
    */

    const localRecord =
        await findLocalRecord(
            storeName,
            recordId
        );


    if (!localRecord) {

        throw new Error(
            `Cannot sync UPDATE. Local ${storeName} record not found for id ${recordId}.`
        );

    }


    /*
    ----------------------------------------------
    RESOLVE SERVER ID
    ----------------------------------------------
    */

    const serverId =
        queuedServerId
        ??
        localRecord?.[
            config.idField
        ];


    /*
    ----------------------------------------------
    CREATE NOT YET SYNCHRONIZED
    ----------------------------------------------
    */

    if (
        serverId === undefined ||
        serverId === null ||
        serverId === ""
    ) {

        console.log(
            `⏳ ${storeName} UPDATE deferred. Waiting for CREATE synchronization.`
        );


        return {

            deferred:
                true

        };

    }


    /*
    ----------------------------------------------
    MERGE LATEST LOCAL STATE
    ----------------------------------------------

    Local IndexedDB state wins.
    */

    const mergedRecord = {

        ...data,

        ...localRecord

    };


    /*
    ----------------------------------------------
    CLEAN PAYLOAD
    ----------------------------------------------
    */

    let payload =
        cleanPayload(
            mergedRecord
        );


    /*
    ----------------------------------------------
    RESOLVE LOCAL RELATIONS
    ----------------------------------------------
    */

    const relationResult =
        await resolveLocalRelations(
            mergedRecord
        );


    if (
        relationResult.unresolved.length > 0
    ) {

        console.log(
            `⏳ ${storeName} UPDATE deferred. Waiting for referenced records to synchronize.`,
            relationResult.unresolved
        );


        return {

            deferred:
                true

        };

    }


    payload = {

        ...payload,

        ...relationResult.payload

    };


    /*
    ----------------------------------------------
    NEVER SEND SERVER ID
    ----------------------------------------------
    */

    delete payload[
        config.idField
    ];


    if (
        storeName === "medical_records"
    ) {

        delete payload.medical_record_id;

    }


    const endpoint =
        `${config.endpoint}/${serverId}`;


    console.log(
        `🌐 UPDATE ${config.updateMethod.toUpperCase()} ${endpoint}`,
        payload
    );


    let response;


    /*
    ----------------------------------------------
    SEND UPDATE
    ----------------------------------------------
    */

    switch (
        config.updateMethod
    ) {

        case "put":

            response =
                await api.put(
                    endpoint,
                    payload,
                    getAuthConfig()
                );

            break;


        case "patch":

            response =
                await api.patch(
                    endpoint,
                    payload,
                    getAuthConfig()
                );

            break;


        default:

            throw new Error(
                `Unsupported update method "${config.updateMethod}" for ${storeName}.`
            );

    }


    /*
    ----------------------------------------------
    GET SERVER RECORD
    ----------------------------------------------
    */

    const serverRecord =
        response.data?.[
            config.responseKey
        ]
        ||
        response.data?.record;


    if (!serverRecord) {

        throw new Error(
            `Server did not return ${config.responseKey} after UPDATE.`
        );

    }


    /*
    ----------------------------------------------
    RECONCILE
    ----------------------------------------------
    */

    const syncedRecord =
        await markRecordSynced(
            storeName,
            localRecord,
            serverRecord
        );


    console.log(
        `✅ UPDATE synchronized: ${storeName}`,
        syncedRecord
    );


    return serverRecord;

};


/*
==================================================
SYNC COMPLETE
==================================================
*/

const syncComplete = async (
    operation
) => {

    const {

        storeName,

        recordId,

        serverId:
        queuedServerId,

        data

    } = operation;


    const config =
        getStoreConfig(
            storeName
        );


    if (
        !config.completeEndpoint
    ) {

        throw new Error(
            `Store "${storeName}" does not support COMPLETE operations.`
        );

    }


    console.log(
        `📤 Sync COMPLETE: ${storeName}`,
        operation
    );


    /*
    ----------------------------------------------
    FIND LOCAL RECORD
    ----------------------------------------------
    */

    const localRecord =
        await findLocalRecord(
            storeName,
            recordId
        );


    /*
    ----------------------------------------------
    RESOLVE SERVER ID
    ----------------------------------------------
    */

    const serverId =
        queuedServerId
        ??
        localRecord?.[
            config.idField
        ];


    /*
    ----------------------------------------------
    WAIT FOR CREATE
    ----------------------------------------------
    */

    if (
        serverId === undefined ||
        serverId === null ||
        serverId === ""
    ) {

        console.log(
            `⏳ ${storeName} COMPLETE deferred. Waiting for CREATE synchronization.`
        );


        return {

            deferred:
                true

        };

    }


    /*
    ----------------------------------------------
    CLEAN PAYLOAD
    ----------------------------------------------
    */

    const payload =
        cleanPayload(
            data ||
            localRecord ||
            {}
        );


    const endpoint =
        `${config.completeEndpoint}/${serverId}/complete`;


    console.log(
        `🌐 COMPLETE ${config.completeMethod.toUpperCase()} ${endpoint}`,
        payload
    );


    let response;


    switch (
        config.completeMethod
    ) {

        case "patch":

            response =
                await api.patch(
                    endpoint,
                    payload,
                    getAuthConfig()
                );

            break;


        case "put":

            response =
                await api.put(
                    endpoint,
                    payload,
                    getAuthConfig()
                );

            break;


        default:

            throw new Error(
                `Unsupported complete method "${config.completeMethod}" for ${storeName}.`
            );

    }


    /*
    ----------------------------------------------
    SERVER RECORD
    ----------------------------------------------
    */

    const serverRecord =
        response.data?.[
            config.completeResponseKey
        ]
        ||
        response.data?.record;


    if (!serverRecord) {

        throw new Error(
            `Server did not return ${config.completeResponseKey} after COMPLETE.`
        );

    }


    /*
    ----------------------------------------------
    RECONCILE
    ----------------------------------------------
    */

    if (localRecord) {

        await markRecordSynced(
            storeName,
            localRecord,
            serverRecord
        );

    }


    console.log(
        `✅ COMPLETE synchronized: ${storeName}`,
        serverRecord
    );


    return serverRecord;

};


/*
==================================================
SYNC DELETE
==================================================
*/

const syncDelete = async (
    operation
) => {

    const {

        storeName,

        recordId,

        serverId:
        queuedServerId

    } = operation;


    const config =
        getStoreConfig(
            storeName
        );


    console.log(
        `📤 Sync DELETE: ${storeName}`,
        operation
    );


    /*
    ----------------------------------------------
    FIND LOCAL RECORD
    ----------------------------------------------
    */

    const localRecord =
        await findLocalRecord(
            storeName,
            recordId
        );


    /*
    ----------------------------------------------
    RESOLVE SERVER ID
    ----------------------------------------------
    */

    const serverId =
        queuedServerId
        ??
        localRecord?.[
            config.idField
        ]
        ??
        null;


    /*
    ----------------------------------------------
    LOCAL-ONLY RECORD
    ----------------------------------------------

    If the record was created offline and deleted
    before synchronization, there is nothing to
    delete remotely.
    */

    if (
        serverId === undefined ||
        serverId === null ||
        serverId === ""
    ) {

        console.log(
            `🗑️ ${storeName} is local-only. No remote DELETE required.`
        );


        if (
            localRecord?.id !== undefined &&
            localRecord?.id !== null
        ) {

            await offlineDelete(
                storeName,
                localRecord.id
            );

        }


        return true;

    }


    /*
    ----------------------------------------------
    DELETE FROM SERVER
    ----------------------------------------------
    */

    const endpoint =
        `${config.endpoint}/${serverId}`;


    console.log(
        `🌐 DELETE ${endpoint}`
    );


    try {

        await api.delete(
            endpoint,
            getAuthConfig()
        );

    } catch (error) {

        /*
        ------------------------------------------
        SERVER ALREADY DELETED
        ------------------------------------------
        */

        if (
            error.response?.status === 404
        ) {

            console.warn(
                `⚠️ ${storeName} ${serverId} was already deleted on the server.`
            );

        } else {

            throw error;

        }

    }


    /*
    ----------------------------------------------
    DELETE LOCAL CACHE
    ----------------------------------------------
    */

    if (
        localRecord?.id !== undefined &&
        localRecord?.id !== null
    ) {

        await offlineDelete(
            storeName,
            localRecord.id
        );

    }


    console.log(
        `✅ DELETE synchronized: ${storeName}`,
        serverId
    );


    return true;

};


/*
==================================================
SYNC ONE OPERATION
==================================================
*/

const syncOperation = async (
    operation
) => {

    if (!operation) {

        throw new Error(
            "Cannot synchronize an empty operation."
        );

    }


    switch (
        operation.type
    ) {

        case "CREATE":

            return await syncCreate(
                operation
            );


        case "UPDATE":

            return await syncUpdate(
                operation
            );


        case "COMPLETE":

            return await syncComplete(
                operation
            );


        case "DELETE":

            return await syncDelete(
                operation
            );


        default:

            throw new Error(
                `Unknown sync operation: ${operation.type}`
            );

    }

};


/*
==================================================
RESET DEFERRED OPERATION
==================================================
*/

const resetDeferredOperation = async (
    operation
) => {

    if (!operation?.id) {

        return;

    }


    await markOperationPending({

        ...operation,

        status:
            "pending",

        updatedAt:
            new Date().toISOString()

    });

};


/*
==================================================
SYNC PENDING OPERATIONS
==================================================
*/

export const syncPendingOperations =
    async (attempt = 0) => {

        /*
        ------------------------------------------
        OFFLINE CHECK
        ------------------------------------------
        */

        if (!isOnline()) {

            console.log(
                "📴 Hospital Management System is offline. Sync skipped."
            );


            return {

                success:
                    false,

                offline:
                    true,

                synced:
                    0,

                total:
                    0

            };

        }


        /*
        ------------------------------------------
        GET QUEUE
        ------------------------------------------
        */

        const operations =
            await getPendingOperations();


        if (
            !operations.length
        ) {

            console.log(
                "✅ Hospital Management System sync queue is empty."
            );


            return {

                success:
                    true,

                synced:
                    0,

                total:
                    0

            };

        }


        console.log(
            `🔄 Hospital Management System: ${operations.length} pending operation(s).`
        );


        let syncedCount =
            0;


        let deferredCount =
            0;


        let failedCount =
            0;


        /*
        ------------------------------------------
        PROCESS IN QUEUE ORDER
        ------------------------------------------
        */

        for (
            const operation
            of operations
        ) {

            /*
            --------------------------------------
            CONNECTION CHECK
            --------------------------------------
            */

            if (!isOnline()) {

                console.warn(
                    "📴 Internet connection lost. Stopping synchronization."
                );


                break;

            }


            try {

                console.log(
                    "🔄 Processing operation:",
                    operation
                );


                /*
                ----------------------------------
                MARK PROCESSING
                ----------------------------------
                */

                const processingOperation =
                    await markOperationProcessing(
                        operation
                    );


                /*
                ----------------------------------
                EXECUTE
                ----------------------------------
                */

                const result =
                    await syncOperation(
                        processingOperation
                    );


                /*
                ----------------------------------
                DEFERRED
                ----------------------------------
                */

                if (
                    result?.deferred
                ) {

                    deferredCount++;


                    console.log(
                        `⏳ Operation ${operation.id} deferred.`
                    );


                    await resetDeferredOperation(
                        processingOperation
                    );


                    continue;

                }


                /*
                ----------------------------------
                SUCCESS
                ----------------------------------
                */

                await removeQueuedOperation(
                    operation.id
                );


                syncedCount++;


                console.log(
                    `✅ Operation ${operation.id} synchronized successfully.`
                );

            } catch (
                error
            ) {

                failedCount++;


                console.error(
                    `❌ Sync failed for operation ${operation.id}:`,
                    error
                );


                /*
                ----------------------------------
                MARK FAILED
                ----------------------------------
                */

                await markOperationFailed(
                    operation,
                    error
                );


                /*
                ----------------------------------
                CONNECTION LOST
                ----------------------------------
                */

                if (!isOnline()) {

                    console.warn(
                        "📴 Connection lost during synchronization. Stopping sync."
                    );


                    break;

                }

            }

        }


        /*
        ------------------------------------------
        RETRY DEFERRED OPERATIONS
        ------------------------------------------
        */

        if (
            deferredCount > 0 &&
            syncedCount > 0 &&
            attempt < 5
        ) {

            console.log(
                `🔁 Retrying ${deferredCount} deferred operation(s).`
            );


            const retryResult =
                await syncPendingOperations(
                    attempt + 1
                );


            syncedCount +=
                Number(
                    retryResult?.synced || 0
                );


            deferredCount =
                Number(
                    retryResult?.deferred || 0
                );


            failedCount +=
                Number(
                    retryResult?.failed || 0
                );

        }


        /*
        ------------------------------------------
        FINAL RESULT
        ------------------------------------------
        */

        console.log(
            `🎉 Hospital Management System sync finished.`,
            {

                synced:
                    syncedCount,

                deferred:
                    deferredCount,

                failed:
                    failedCount,

                total:
                    operations.length

            }
        );


        return {

            success:
                true,

            synced:
                syncedCount,

            deferred:
                deferredCount,

            failed:
                failedCount,

            total:
                operations.length

        };

    };


/*
==================================================
AUTOMATIC SYNC ENGINE
==================================================
*/

export const startSyncEngine = () => {

    let syncing =
        false;


    /*
    ----------------------------------------------
    RUN SYNC SAFELY
    ----------------------------------------------
    */

    const runSync = async (
        reason
    ) => {

        if (!isOnline()) {

            console.log(
                `📴 Hospital Management System sync skipped (${reason}): offline.`
            );


            return;

        }


        if (syncing) {

            console.log(
                `⏳ Hospital Management System sync already running. Ignoring ${reason} trigger.`
            );


            return;

        }


        syncing =
            true;


        try {

            console.log(
                `🔄 Hospital Management System synchronization started: ${reason}`
            );


            const result =
                await syncPendingOperations();


            /*
            ------------------------------------------
            NOTIFY APPLICATION
            ------------------------------------------
            */

            if (
                typeof window !== "undefined"
            ) {

                window.dispatchEvent(
                    new CustomEvent(
                        "ghost-hms-sync-complete",
                        {
                            detail:
                                result
                        }
                    )
                );

            }


            return result;

        } catch (
            error
        ) {

            console.error(
                `❌ Hospital Management System ${reason} sync error:`,
                error
            );

        } finally {

            syncing =
                false;

        }

    };


    /*
    ----------------------------------------------
    ONLINE EVENT
    ----------------------------------------------
    */

    const handleOnline =
        async () => {

            console.log(
                "🌐 Internet connection restored."
            );


            await runSync(
                "connection-restored"
            );

        };


    /*
    ----------------------------------------------
    REGISTER EVENT
    ----------------------------------------------
    */

    window.addEventListener(
        "online",
        handleOnline
    );


    /*
    ----------------------------------------------
    STARTUP SYNC
    ----------------------------------------------
    */

    runSync(
        "startup"
    );


    /*
    ----------------------------------------------
    CLEANUP
    ----------------------------------------------
    */

    return () => {

        window.removeEventListener(
            "online",
            handleOnline
        );

    };

};


/*
==================================================
MANUAL TEST
==================================================
*/

export const testHMSSync =
    async () => {

        console.log(
            "🧪 Manual Hospital Management System sync test started..."
        );


        try {

            const result =
                await syncPendingOperations();


            console.log(
                "🧪 Hospital Management System manual sync result:",
                result
            );


            return result;

        } catch (
            error
        ) {

            console.error(
                "❌ Hospital Management System manual sync test failed:",
                error
            );


            throw error;

        }

    };

