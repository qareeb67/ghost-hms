import api from "./api";

import {
    offlineGetAll,
    offlineCreate,
    offlineUpdate,
    offlineDelete,
    offlineUpsert
} from "./offlineService";

import {
    queueOperation
} from "./syncQueueService";


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

    return {

        headers: {

            Authorization:
                `Bearer ${getToken()}`

        }

    };

};


/*
==================================================
NETWORK
==================================================
*/

const isOnline = () => {

    return navigator.onLine;

};


/*
==================================================
FIND LOCAL PATIENT
==================================================

The identifier may be:

1. IndexedDB local id
2. PostgreSQL patient_id

==================================================
*/

const findLocalPatient = async (
    identifier
) => {

    if (
        identifier === undefined ||
        identifier === null
    ) {

        return null;

    }


    const patients =
        await offlineGetAll(
            "patients"
        );


    return (

        patients.find(
            patient =>

                String(
                    patient.id
                ) ===
                String(identifier)

                ||

                (
                    patient.patient_id !== undefined &&
                    patient.patient_id !== null &&

                    String(
                        patient.patient_id
                    ) ===
                    String(identifier)
                )
        )

        || null

    );

};


/*
==================================================
GET PATIENTS
==================================================
*/

export const getPatients = async () => {

    /*
    ==============================================
    ONLINE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    "/patients",
                    getAuthConfig()
                );


            const patients =
                Array.isArray(
                    response.data?.patients
                )
                    ? response.data.patients
                    : [];


            /*
            --------------------------------------
            LOAD LOCAL DATA BEFORE RECONCILIATION
            --------------------------------------

            Local pending records must not disappear
            simply because the server does not know
            about them yet.
            --------------------------------------
            */

            const localPatients =
                await offlineGetAll(
                    "patients"
                );


            /*
            --------------------------------------
            CACHE SERVER DATA
            --------------------------------------
            */

            for (
                const patient
                of patients
            ) {

                await offlineUpsert(
                    "patients",
                    {

                        ...patient,

                        _syncStatus:
                            "synced",

                        _localOnly:
                            false,

                        _createdOffline:
                            false,

                        _updatedOffline:
                            false

                    }
                );

            }


            /*
            --------------------------------------
            MERGE SERVER + PENDING LOCAL DATA
            --------------------------------------

            Keep locally-created and locally-edited
            records visible until synchronization has
            successfully reconciled them.
            --------------------------------------
            */

            const mergedPatients = [];

            const serverPatientIds =
                new Set(
                    patients
                        .map(
                            (patient) =>
                                patient?.patient_id
                        )
                        .filter(
                            (id) =>
                                id !== undefined &&
                                id !== null
                        )
                        .map(
                            (id) =>
                                String(id)
                        )
                );


            for (
                const patient
                of patients
            ) {

                mergedPatients.push(
                    patient
                );

            }


            for (
                const localPatient
                of localPatients
            ) {

                const isPendingLocal =
                    localPatient?._localOnly === true ||
                    localPatient?._syncStatus === "pending" ||
                    localPatient?._updatedOffline === true;


                if (!isPendingLocal) {

                    continue;

                }


                const serverId =
                    localPatient?.patient_id;


                if (
                    serverId !== undefined &&
                    serverId !== null &&
                    serverPatientIds.has(
                        String(serverId)
                    )
                ) {

                    const index =
                        mergedPatients.findIndex(
                            (patient) =>
                                String(
                                    patient?.patient_id
                                ) ===
                                String(serverId)
                        );


                    if (index !== -1) {

                        /*
                        Latest local state wins while
                        the record is still pending.
                        */

                        mergedPatients[index] = {

                            ...mergedPatients[index],
                            ...localPatient

                        };

                    }

                    continue;

                }


                /*
                Server has no copy yet. Keep the
                local-only patient visible.
                */

                mergedPatients.push(
                    localPatient
                );

            }


            return {

                ...response.data,

                offline:
                    false,

                patients:
                    mergedPatients

            };

        } catch (error) {

            console.warn(
                "⚠️ Online patient request failed. Loading offline patients...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE
    ==============================================
    */

    const patients =
        await offlineGetAll(
            "patients"
        );


    return {

        success:
            true,

        offline:
            true,

        patients

    };

};


/*
==================================================
CREATE PATIENT
==================================================
*/

export const createPatient = async (
    patient
) => {

    /*
    ==============================================
    ONLINE CREATE
    ==============================================
    */

    if (isOnline()) {

        try {

            /*
            --------------------------------------
            ONLINE CREATE PAYLOAD
            --------------------------------------

            Do not send a client/server ID.
            --------------------------------------
            */

            const payload = {

                ...patient

            };


            delete payload.id;
            delete payload.patient_id;


            const response =
                await api.post(
                    "/patients",
                    payload,
                    getAuthConfig()
                );


            const serverPatient =
                response.data?.patient;


            if (!serverPatient) {

                throw new Error(
                    "Server did not return the created patient."
                );

            }


            /*
            --------------------------------------
            CACHE SERVER RECORD
            --------------------------------------
            */

            const savedPatient =
                await offlineUpsert(
                    "patients",
                    {

                        ...serverPatient,

                        _syncStatus:
                            "synced",

                        _localOnly:
                            false,

                        _createdOffline:
                            false,

                        _updatedOffline:
                            false

                    }
                );


            return {

                ...response.data,

                patient:
                    savedPatient,

                offline:
                    false

            };
        } catch (error) {

            console.error(
                "Patient creation failed while online:",
                error
            );

            throw error;
        }
    }

    /*
    ==============================================
    OFFLINE CREATE
    ==============================================
    */

    const offlinePatient = {

        ...patient,

        /*
        ------------------------------------------
        IMPORTANT
        ------------------------------------------

        A locally-created patient has NO server ID.
        ------------------------------------------
        */

        patient_id:
            null,

        _syncStatus:
            "pending",

        _localOnly:
            true,

        _createdOffline:
            true,

        _updatedOffline:
            false,

        _createdAt:
            new Date().toISOString()

    };


    /*
    ----------------------------------------------
    SAVE LOCAL PATIENT
    ----------------------------------------------
    */

    const savedPatient =
        await offlineCreate(
            "patients",
            offlinePatient
        );


    /*
    ----------------------------------------------
    QUEUE CREATE
    ----------------------------------------------

    IMPORTANT:

    The queue stores the local IndexedDB ID.

    The server ID remains null until the server
    creates the patient.
    ----------------------------------------------
    */

    await queueOperation({

        type:
            "CREATE",

        storeName:
            "patients",

        data:
            {

                ...savedPatient,

                patient_id:
                    null

            }

    });


    return {

        success:
            true,

        offline:
            true,

        patient:
            savedPatient,

        message:
            "Patient saved offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
UPDATE PATIENT
==================================================
*/

export const updatePatient = async (
    identifier,
    patientData
) => {

    /*
    ----------------------------------------------
    FIND LOCAL PATIENT
    ----------------------------------------------
    */

    const localPatient =
        await findLocalPatient(
            identifier
        );


    /*
    ----------------------------------------------
    DETERMINE SERVER ID
    ----------------------------------------------
    */

    const serverId =
        localPatient?.patient_id ??
        (
            localPatient
                ? null
                : identifier
        );


    /*
    ==============================================
    ONLINE UPDATE
    ==============================================
    */

    if (
        isOnline() &&
        serverId !== null &&
        serverId !== undefined
    ) {

        try {

            const payload = {

                ...patientData

            };


            /*
            --------------------------------------
            Never send IndexedDB id.
            --------------------------------------
            */

            delete payload.id;


            /*
            --------------------------------------
            Never allow client to change server ID.
            --------------------------------------
            */

            delete payload.patient_id;


            const response =
                await api.put(
                    `/patients/${serverId}`,
                    payload,
                    getAuthConfig()
                );


            const updatedPatient =
                response.data?.patient;


            if (!updatedPatient) {

                throw new Error(
                    "Server did not return the updated patient."
                );

            }


            /*
            --------------------------------------
            UPDATE EXISTING LOCAL RECORD
            --------------------------------------
            */

            if (localPatient) {

                await offlineUpdate(
                    "patients",
                    {

                        ...updatedPatient,

                        id:
                            localPatient.id,

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

                    }
                );

            } else {

                /*
                ----------------------------------
                No local copy.
                ----------------------------------
                */

                await offlineUpsert(
                    "patients",
                    {

                        ...updatedPatient,

                        _syncStatus:
                            "synced",

                        _localOnly:
                            false

                    }
                );

            }


            return {

                ...response.data,

                offline:
                    false

            };

        } catch (error) {

            console.warn(
                "⚠️ Online patient update failed. Switching to offline update...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE UPDATE
    ==============================================
    */

    if (!localPatient) {

        throw new Error(
            "Patient not found locally."
        );

    }


    /*
    ----------------------------------------------
    MERGE LOCAL DATA
    ----------------------------------------------
    */

    const updatedPatient = {

        ...localPatient,

        ...patientData,

        /*
        Preserve server ID.
        */

        patient_id:
            localPatient.patient_id ??
            null,

        _syncStatus:
            "pending",

        _localOnly:
            localPatient._localOnly === true,

        _createdOffline:
            localPatient._createdOffline === true,

        _updatedOffline:
            true,

        _updatedAt:
            new Date().toISOString()

    };


    /*
    ----------------------------------------------
    SAVE LOCAL UPDATE
    ----------------------------------------------
    */

    await offlineUpdate(
        "patients",
        updatedPatient
    );


    /*
    ----------------------------------------------
    QUEUE UPDATE
    ----------------------------------------------

    CRITICAL:

    recordId = IndexedDB local ID

    serverId = PostgreSQL patient_id

    ----------------------------------------------
    */

    await queueOperation({

        type:
            "UPDATE",

        storeName:
            "patients",

        recordId:
            localPatient.id,

        serverId:
            localPatient.patient_id ?? null,

        data:
            updatedPatient

    });


    return {

        success:
            true,

        offline:
            true,

        patient:
            updatedPatient,

        message:
            "Patient updated offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
DELETE PATIENT
==================================================
*/

export const deletePatient = async (
    identifier
) => {

    /*
    ----------------------------------------------
    FIND LOCAL PATIENT
    ----------------------------------------------
    */

    const localPatient =
        await findLocalPatient(
            identifier
        );


    /*
    ----------------------------------------------
    DETERMINE SERVER ID
    ----------------------------------------------
    */

    const serverId =
        localPatient?.patient_id ??
        (
            localPatient
                ? null
                : identifier
        );


    /*
    ==============================================
    ONLINE DELETE
    ==============================================
    */

    if (
        isOnline() &&
        serverId !== null &&
        serverId !== undefined
    ) {

        try {

            const response =
                await api.delete(
                    `/patients/${serverId}`,
                    getAuthConfig()
                );


            /*
            --------------------------------------
            REMOVE LOCAL COPY
            --------------------------------------
            */

            if (localPatient) {

                await offlineDelete(
                    "patients",
                    localPatient.id
                );

            }


            return {

                ...response.data,

                offline:
                    false

            };

        } catch (error) {

            console.warn(
                "⚠️ Online patient deletion failed. Switching to offline delete...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE DELETE
    ==============================================
    */

    if (!localPatient) {

        throw new Error(
            "Patient not found locally."
        );

    }


    /*
    ----------------------------------------------
    LOCAL-ONLY PATIENT
    ----------------------------------------------

    If the patient never reached the server,
    there is nothing to DELETE remotely.

    ----------------------------------------------
    */

    if (
        localPatient.patient_id === null ||
        localPatient.patient_id === undefined
    ) {

        await offlineDelete(
            "patients",
            localPatient.id
        );


        return {

            success:
                true,

            offline:
                true,

            message:
                "Local-only patient deleted."

        };

    }


    /*
    ----------------------------------------------
    QUEUE DELETE
    ----------------------------------------------

    Keep BOTH identifiers.

    ----------------------------------------------
    */

    await queueOperation({

        type:
            "DELETE",

        storeName:
            "patients",

        recordId:
            localPatient.id,

        serverId:
            localPatient.patient_id

    });


    /*
    ----------------------------------------------
    REMOVE LOCAL COPY
    ----------------------------------------------
    */

    await offlineDelete(
        "patients",
        localPatient.id
    );


    return {

        success:
            true,

        offline:
            true,

        message:
            "Patient deleted locally. Server synchronization will happen when the connection returns."

    };

};


/*
==================================================
SEARCH PATIENTS
==================================================
*/

export const searchPatients = async (
    query
) => {

    const keyword =
        String(
            query || ""
        )
            .toLowerCase()
            .trim();


    /*
    ==============================================
    ONLINE SEARCH
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    `/patients/search?q=${encodeURIComponent(keyword)}`,
                    getAuthConfig()
                );


            return response.data;

        } catch (error) {

            console.warn(
                "⚠️ Online patient search failed. Searching locally...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE SEARCH
    ==============================================
    */

    const patients =
        await offlineGetAll(
            "patients"
        );


    const filtered =
        patients.filter(
            patient => {

                return (

                    patient.first_name
                        ?.toLowerCase()
                        .includes(keyword)

                    ||

                    patient.last_name
                        ?.toLowerCase()
                        .includes(keyword)

                    ||

                    patient.email
                        ?.toLowerCase()
                        .includes(keyword)

                    ||

                    patient.phone
                        ?.toLowerCase()
                        .includes(keyword)

                );

            }
        );


    return {

        success:
            true,

        offline:
            true,

        patients:
            filtered

    };

};