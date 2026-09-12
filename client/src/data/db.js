const DB_NAME = "ghost_hms";

/*
==================================================
DATABASE VERSION
==================================================

Version 5 adds:

- prescription_items

The IndexedDB stores these records locally so
Hospital Management System can continue working offline.
==================================================
*/

const DB_VERSION = 5;


/*
==================================================
OBJECT STORES
==================================================
*/

const STORES = [
    "patients",
    "doctors",
    "appointments",
    "medicines",
    "laboratory",
    "billing",
    "medical_records",
    "prescriptions",
    "emergency",
    "sync_queue"
];


let dbInstance = null;
let openingPromise = null;


/*
==================================================
CREATE STORES + INDEXES
==================================================
*/

const createStoresAndIndexes = (
    db,
    transaction
) => {

    STORES.forEach((storeName) => {

        let store;


        /*
        ------------------------------------------
        CREATE STORE IF MISSING
        ------------------------------------------
        */

        if (
            !db.objectStoreNames.contains(
                storeName
            )
        ) {

            store =
                db.createObjectStore(
                    storeName,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

        } else {

            store =
                transaction.objectStore(
                    storeName
                );

        }


        /*
        ==========================================
        PATIENT SERVER ID
        ==========================================
        */

        if (
            storeName === "patients" &&
            !store.indexNames.contains(
                "patient_id"
            )
        ) {

            store.createIndex(
                "patient_id",
                "patient_id",
                {
                    unique: false
                }
            );

        }


        /*
        ==========================================
        DOCTOR SERVER ID
        ==========================================
        */

        if (
            storeName === "doctors" &&
            !store.indexNames.contains(
                "doctor_id"
            )
        ) {

            store.createIndex(
                "doctor_id",
                "doctor_id",
                {
                    unique: false
                }
            );

        }


        /*
        ==========================================
        APPOINTMENT SERVER ID
        ==========================================
        */

        if (
            storeName === "appointments" &&
            !store.indexNames.contains(
                "appointment_id"
            )
        ) {

            store.createIndex(
                "appointment_id",
                "appointment_id",
                {
                    unique: false
                }
            );

        }


        /*
        ==========================================
        MEDICINE SERVER ID
        ==========================================
        */

        if (
            storeName === "medicines" &&
            !store.indexNames.contains(
                "medicine_id"
            )
        ) {

            store.createIndex(
                "medicine_id",
                "medicine_id",
                {
                    unique: false
                }
            );

        }


        /*
        ==========================================
        MEDICAL RECORD SERVER ID
        ==========================================
        */

        if (
            storeName === "medical_records" &&
            !store.indexNames.contains(
                "record_id"
            )
        ) {

            store.createIndex(
                "record_id",
                "record_id",
                {
                    unique: false
                }
            );

        }


        /*
        ==========================================
        PRESCRIPTION SERVER ID
        ==========================================
        */

        if (
            storeName === "prescriptions" &&
            !store.indexNames.contains(
                "prescription_id"
            )
        ) {

            store.createIndex(
                "prescription_id",
                "prescription_id",
                {
                    unique: false
                }
            );

        }


        /*
        ==========================================
        PRESCRIPTION RECORD ID
        ==========================================
        */

        if (
            storeName === "prescriptions" &&
            !store.indexNames.contains(
                "record_id"
            )
        ) {

            store.createIndex(
                "record_id",
                "record_id",
                {
                    unique: false
                }
            );

        }


        /*
        ==========================================
        PRESCRIPTION PATIENT ID
        ==========================================
        */

        if (
            storeName === "prescriptions" &&
            !store.indexNames.contains(
                "patient_id"
            )
        ) {

            store.createIndex(
                "patient_id",
                "patient_id",
                {
                    unique: false
                }
            );

        }


        /*
        ==========================================
        PRESCRIPTION DOCTOR ID
        ==========================================
        */

        if (
            storeName === "prescriptions" &&
            !store.indexNames.contains(
                "doctor_id"
            )
        ) {

            store.createIndex(
                "doctor_id",
                "doctor_id",
                {
                    unique: false
                }
            );

        }

    });

};


/*
==================================================
OPEN DATABASE
==================================================
*/

export const openDB = () => {

    /*
    ----------------------------------------------
    RETURN EXISTING CONNECTION
    ----------------------------------------------
    */

    if (dbInstance) {

        return Promise.resolve(
            dbInstance
        );

    }


    /*
    ----------------------------------------------
    PREVENT MULTIPLE OPEN REQUESTS
    ----------------------------------------------
    */

    if (openingPromise) {

        return openingPromise;

    }


    /*
    ----------------------------------------------
    OPEN DATABASE
    ----------------------------------------------
    */

    openingPromise =
        new Promise(
            (
                resolve,
                reject
            ) => {

                let request;


                try {

                    request =
                        indexedDB.open(
                            DB_NAME,
                            DB_VERSION
                        );

                } catch (error) {

                    openingPromise = null;

                    reject(error);

                    return;

                }


                /*
                ======================================
                DATABASE UPGRADE
                ======================================
                */

                request.onupgradeneeded =
                    (event) => {

                        const db =
                            event
                                .target
                                .result;

                        const transaction =
                            event
                                .target
                                .transaction;


                        console.log(
                            "🔄 Hospital Management System IndexedDB upgrading:",
                            db.version
                        );


                        createStoresAndIndexes(
                            db,
                            transaction
                        );

                    };


                /*
                ======================================
                SUCCESS
                ======================================
                */

                request.onsuccess =
                    () => {

                        const db =
                            request.result;


                        dbInstance =
                            db;


                        console.log(
                            "🔥 Hospital Management System IndexedDB connected:",
                            DB_NAME,
                            "version:",
                            db.version
                        );


                        /*
                        ----------------------------------
                        VERSION CHANGE
                        ----------------------------------
                        */

                        db.onversionchange =
                            () => {

                                console.warn(
                                    "⚠️ Hospital Management System IndexedDB version change detected."
                                );


                                db.close();


                                if (
                                    dbInstance ===
                                    db
                                ) {

                                    dbInstance =
                                        null;

                                }

                            };


                        /*
                        ----------------------------------
                        DATABASE ERROR
                        ----------------------------------
                        */

                        db.onerror =
                            (event) => {

                                console.error(
                                    "❌ Hospital Management System IndexedDB connection error:",
                                    event
                                        .target
                                        ?.error
                                );

                            };


                        resolve(db);

                    };


                /*
                ======================================
                OPEN ERROR
                ======================================
                */

                request.onerror =
                    () => {

                        console.error(
                            "❌ Hospital Management System IndexedDB open error:",
                            request.error
                        );


                        dbInstance =
                            null;


                        reject(
                            request.error
                        );

                    };


                /*
                ======================================
                BLOCKED
                ======================================
                */

                request.onblocked =
                    () => {

                        console.warn(
                            "⚠️ Hospital Management System IndexedDB upgrade blocked. Close other Hospital Management System tabs."
                        );

                    };

            }
        );


    openingPromise =
        openingPromise.finally(
            () => {

                openingPromise =
                    null;

            }
        );


    return openingPromise;

};


/*
==================================================
RESET CONNECTION
==================================================

Only use internally when a transaction discovers
that the current connection is no longer usable.
==================================================
*/

export const resetDBConnection = () => {

    if (dbInstance) {

        try {

            dbInstance.close();

        } catch (error) {

            console.warn(
                "⚠️ Hospital Management System DB close warning:",
                error
            );

        }

    }


    dbInstance = null;

};