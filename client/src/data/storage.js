import {
    openDB,
    resetDBConnection
} from "./db";


const SERVER_ID_FIELDS = {

    patients: "patient_id",

    doctors: "doctor_id",

    appointments: "appointment_id",

    medical_records: "record_id",

    billing: "bill_id",

    emergency: "emergency_id",    

    laboratory: "test_id",

    medicines: "medicine_id"

};


const getServerIdField = (storeName) => {

    return (
        SERVER_ID_FIELDS[storeName] ||
        null
    );

};


/*
==================================================
GET TRANSACTION
==================================================
*/

const createTransaction = async (
    storeName,
    mode
) => {

    const db =
        await openDB();


    try {

        return {
            db,
            transaction:
                db.transaction(
                    storeName,
                    mode
                )
        };

    } catch (error) {

        /*
        If the connection became unusable,
        reset it and retry once.
        */

        if (
            error.name ===
            "InvalidStateError"
        ) {

            resetDBConnection();


            const freshDB =
                await openDB();


            return {
                db: freshDB,
                transaction:
                    freshDB.transaction(
                        storeName,
                        mode
                    )
            };

        }


        throw error;

    }

};


/*
==================================================
SAVE RECORD
==================================================
*/

export const saveRecord = async (
    storeName,
    record
) => {

    const {
        transaction
    } =
        await createTransaction(
            storeName,
            "readwrite"
        );


    return new Promise(
        (resolve, reject) => {

            const store =
                transaction.objectStore(
                    storeName
                );


            const request =
                store.add(record);


            request.onsuccess = () => {

                resolve({

                    ...record,

                    id:
                        request.result

                });

            };


            request.onerror = () => {

                reject(
                    request.error
                );

            };


            transaction.onerror = () => {

                reject(
                    transaction.error
                );

            };

        }
    );

};


/*
==================================================
GET ALL RECORDS
==================================================
*/

export const getRecords = async (
    storeName
) => {

    const {
        transaction
    } =
        await createTransaction(
            storeName,
            "readonly"
        );


    return new Promise(
        (resolve, reject) => {

            const store =
                transaction.objectStore(
                    storeName
                );


            const request =
                store.getAll();


            request.onsuccess = () => {

                resolve(
                    request.result || []
                );

            };


            request.onerror = () => {

                reject(
                    request.error
                );

            };


            transaction.onerror = () => {

                reject(
                    transaction.error
                );

            };

        }
    );

};


/*
==================================================
GET ONE RECORD
==================================================
*/

export const getRecord = async (
    storeName,
    id
) => {

    const {
        transaction
    } =
        await createTransaction(
            storeName,
            "readonly"
        );


    return new Promise(
        (resolve, reject) => {

            const store =
                transaction.objectStore(
                    storeName
                );


            const request =
                store.get(id);


            request.onsuccess = () => {

                resolve(
                    request.result
                );

            };


            request.onerror = () => {

                reject(
                    request.error
                );

            };


            transaction.onerror = () => {

                reject(
                    transaction.error
                );

            };

        }
    );

};


/*
==================================================
UPDATE RECORD
==================================================
*/

export const updateRecord = async (
    storeName,
    record
) => {

    if (
        record?.id === undefined ||
        record?.id === null
    ) {

        throw new Error(
            `Cannot update ${storeName} without IndexedDB id.`
        );

    }


    const {
        transaction
    } =
        await createTransaction(
            storeName,
            "readwrite"
        );


    return new Promise(
        (resolve, reject) => {

            const store =
                transaction.objectStore(
                    storeName
                );


            const request =
                store.put(record);


            request.onsuccess = () => {

                resolve(record);

            };


            request.onerror = () => {

                reject(
                    request.error
                );

            };


            transaction.onerror = () => {

                reject(
                    transaction.error
                );

            };

        }
    );

};


/*
==================================================
DELETE RECORD
==================================================
*/

export const deleteRecord = async (
    storeName,
    id
) => {

    const {
        transaction
    } =
        await createTransaction(
            storeName,
            "readwrite"
        );


    return new Promise(
        (resolve, reject) => {

            const store =
                transaction.objectStore(
                    storeName
                );


            const request =
                store.delete(id);


            request.onsuccess = () => {

                resolve(true);

            };


            request.onerror = () => {

                reject(
                    request.error
                );

            };


            transaction.onerror = () => {

                reject(
                    transaction.error
                );

            };

        }
    );

};


const getRecordServerId = (storeName, record) => {

    const field = getServerIdField(storeName);

    if (!field || !record) {
        return null;
    }

    if (storeName === "medical_records") {
        return record.record_id ?? record.medical_record_id ?? null;
    }

    return record[field] ?? null;
};


/*
==================================================
FIND BY SERVER ID
==================================================
*/

export const findByServerId = async (
    storeName,
    serverId
) => {

    const serverIdField =
        getServerIdField(
            storeName
        );


    if (!serverIdField) {

        throw new Error(
            `No server ID configured for ${storeName}`
        );

    }


    if (
        serverId === undefined ||
        serverId === null
    ) {

        return null;

    }


    const records =
        await getRecords(
            storeName
        );


    return (
        records.find(
            (record) => {

                return (
                    String(
                        getRecordServerId(
                            storeName,
                            record
                        )
                    ) ===
                    String(serverId)
                );

            }
        ) || null
    );

};


/*
==================================================
UPSERT BY SERVER ID
==================================================
*/

export const upsertByServerId = async (
    storeName,
    record
) => {

    const serverIdField =
        getServerIdField(
            storeName
        );


    /*
    ----------------------------------------------
    STORE WITHOUT SERVER ID
    ----------------------------------------------
    */

    if (!serverIdField) {

        return saveRecord(
            storeName,
            record
        );

    }


    /*
    ----------------------------------------------
    SERVER ID
    ----------------------------------------------
    */

    const serverId =
        getRecordServerId(
            storeName,
            record
        );


    /*
    ----------------------------------------------
    LOCAL-ONLY RECORD
    ----------------------------------------------
    */

    if (
        serverId === undefined ||
        serverId === null
    ) {

        if (
            record?.id !== undefined &&
            record?.id !== null
        ) {

            return updateRecord(
                storeName,
                record
            );

        }


        return saveRecord(
            storeName,
            record
        );

    }


    /*
    ----------------------------------------------
    FIND SERVER RECORD
    ----------------------------------------------
    */

    const existing =
        await findByServerId(
            storeName,
            serverId
        );


    /*
    ----------------------------------------------
    UPDATE EXISTING
    ----------------------------------------------
    */

    if (existing) {

        return updateRecord(
            storeName,
            {

                ...existing,

                ...record,

                id:
                    existing.id

            }
        );

    }


    /*
    ----------------------------------------------
    CREATE NEW
    ----------------------------------------------
    */

    return saveRecord(
        storeName,
        record
    );

};