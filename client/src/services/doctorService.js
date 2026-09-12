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
HOSPITAL MANAGEMENT SYSTEM — DOCTOR SERVICE
==================================================

Online + Offline Doctor CRUD

IndexedDB:
    id
        = local IndexedDB identifier

PostgreSQL:
    doctor_id
        = server identifier

Synchronization metadata:
    _syncStatus
    _localOnly
    _createdOffline
    _updatedOffline

==================================================
*/


/*
==================================================
AUTH
==================================================
*/

const getToken = () => {

    return localStorage.getItem("token");

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
AUTH CONFIG
==================================================
*/

const getAuthConfig = () => {

    const token = getToken();

    return {

        headers: {

            Authorization:
                `Bearer ${token}`

        }

    };

};


/*
==================================================
NORMALIZE DOCTOR
==================================================
*/

const normalizeDoctor = (
    doctor,
    extra = {}
) => {

    return {

        ...doctor,

        ...extra

    };

};


/*
==================================================
GET SERVER DOCTOR ID
==================================================
*/

const getServerDoctorId = (
    doctor
) => {

    if (
        doctor?.doctor_id !== undefined &&
        doctor?.doctor_id !== null
    ) {

        return String(
            doctor.doctor_id
        );

    }

    return null;

};


/*
==================================================
GET LOCAL DOCTOR ID
==================================================
*/

const getLocalDoctorId = (
    doctor
) => {

    if (
        doctor?.id !== undefined &&
        doctor?.id !== null
    ) {

        return String(
            doctor.id
        );

    }

    return null;

};


/*
==================================================
FIND LOCAL DOCTOR
==================================================
*/

const findLocalDoctor = async (
    identifier
) => {

    if (
        identifier === undefined ||
        identifier === null
    ) {

        return null;

    }


    const doctors =
        await offlineGetAll(
            "doctors"
        );


    const normalizedIdentifier =
        String(identifier);


    return (

        doctors.find(
            doctor => {

                const localId =
                    getLocalDoctorId(
                        doctor
                    );

                const serverId =
                    getServerDoctorId(
                        doctor
                    );


                return (

                    localId ===
                    normalizedIdentifier

                    ||

                    serverId ===
                    normalizedIdentifier

                );

            }
        )

        || null

    );

};


/*
==================================================
DEDUPLICATE DOCTORS
==================================================

Priority:

1. Server doctor_id
2. Local IndexedDB id
3. Object fallback

This prevents:

server doctor #12
+
local copy of doctor #12

from appearing twice.

==================================================
*/

const deduplicateDoctors = (
    doctors
) => {

    const uniqueDoctors = [];

    const seenServerIds =
        new Set();

    const seenLocalIds =
        new Set();

    doctors.forEach(
        (doctor) => {

            const serverId =
                getServerDoctorId(
                    doctor
                );

            const localId =
                getLocalDoctorId(
                    doctor
                );


            /*
            ------------------------------------------
            SERVER ID HAS HIGHEST PRIORITY
            ------------------------------------------
            */

            if (serverId) {

                if (
                    seenServerIds.has(
                        serverId
                    )
                ) {

                    return;

                }


                seenServerIds.add(
                    serverId
                );


                /*
                If this record also has a local ID,
                remember it too.
                */

                if (localId) {

                    seenLocalIds.add(
                        localId
                    );

                }


                uniqueDoctors.push(
                    doctor
                );

                return;

            }


            /*
            ------------------------------------------
            LOCAL ONLY DOCTOR
            ------------------------------------------
            */

            if (localId) {

                if (
                    seenLocalIds.has(
                        localId
                    )
                ) {

                    return;

                }


                seenLocalIds.add(
                    localId
                );


                uniqueDoctors.push(
                    doctor
                );

                return;

            }


            /*
            ------------------------------------------
            FALLBACK
            ------------------------------------------
            */

            uniqueDoctors.push(
                doctor
            );

        }
    );


    return uniqueDoctors;

};


/*
==================================================
MERGE SERVER + LOCAL PENDING DOCTORS
==================================================
*/

const mergeDoctors = (
    serverDoctors,
    localDoctors
) => {

    /*
    Server data is authoritative for doctors
    that already exist on the server.
    */

    const serverList =
        Array.isArray(
            serverDoctors
        )
            ? serverDoctors
            : [];


    const localList =
        Array.isArray(
            localDoctors
        )
            ? localDoctors
            : [];


    /*
    ------------------------------------------
    KEEP ONLY LOCAL RECORDS THAT STILL NEED
    SYNCHRONIZATION
    ------------------------------------------
    */

    const pendingLocalDoctors =
        localList.filter(
            doctor => {

                return (

                    doctor?._localOnly === true

                    ||

                    doctor?._syncStatus ===
                    "pending"

                    ||

                    doctor?._createdOffline ===
                    true

                    ||

                    doctor?._updatedOffline ===
                    true

                );

            }
        );


    /*
    ------------------------------------------
    SERVER FIRST
    ------------------------------------------
    */

    return deduplicateDoctors([

        ...serverList,

        ...pendingLocalDoctors

    ]);

};


/*
==================================================
GET ALL DOCTORS
==================================================
*/

export const getDoctors = async () => {

    /*
    ==============================================
    ONLINE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    "/doctors",
                    getAuthConfig()
                );


            const serverDoctors =
                Array.isArray(
                    response.data?.doctors
                )
                    ? response.data.doctors
                    : [];


            /*
            --------------------------------------
            CACHE SERVER DOCTORS
            --------------------------------------
            */

            for (
                const doctor
                of serverDoctors
            ) {

                await offlineUpsert(

                    "doctors",

                    normalizeDoctor(
                        doctor,
                        {

                            _syncStatus:
                                "synced",

                            _localOnly:
                                false,

                            _createdOffline:
                                false,

                            _updatedOffline:
                                false

                        }
                    )

                );

            }


            /*
            --------------------------------------
            LOAD LOCAL DATA
            --------------------------------------
            */

            const localDoctors =
                await offlineGetAll(
                    "doctors"
                );


            /*
            --------------------------------------
            MERGE SERVER + PENDING LOCAL DATA
            --------------------------------------
            */

            const doctors =
                mergeDoctors(
                    serverDoctors,
                    localDoctors
                );


            return {

                ...response.data,

                success:
                    true,

                offline:
                    false,

                doctors

            };

        } catch (error) {

            /*
            --------------------------------------
            SERVER RESPONDED
            --------------------------------------
            */

            if (error.response) {

                throw error;

            }


            /*
            --------------------------------------
            REAL NETWORK FAILURE
            --------------------------------------
            */

            console.warn(
                "⚠️ Doctor request failed. Loading offline doctors...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE
    ==============================================
    */

    const doctors =
        await offlineGetAll(
            "doctors"
        );


    return {

        success:
            true,

        offline:
            true,

        doctors:
            deduplicateDoctors(
                doctors
            )

    };

};


/*
==================================================
CREATE DOCTOR
==================================================
*/

export const createDoctor = async (
    doctor
) => {

    /*
    ==============================================
    ONLINE CREATE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.post(
                    "/doctors",
                    doctor,
                    getAuthConfig()
                );


            const serverDoctor =
                response.data?.doctor;


            if (!serverDoctor) {

                throw new Error(
                    "Server did not return the created doctor."
                );

            }


            /*
            --------------------------------------
            SAVE SERVER VERSION LOCALLY
            --------------------------------------
            */

            const savedDoctor =
                await offlineUpsert(

                    "doctors",

                    normalizeDoctor(
                        serverDoctor,
                        {

                            _syncStatus:
                                "synced",

                            _localOnly:
                                false,

                            _createdOffline:
                                false,

                            _updatedOffline:
                                false,

                            _createdAt:
                                undefined,

                            _updatedAt:
                                undefined

                        }
                    )

                );


            return {

                ...response.data,

                success:
                    true,

                doctor:
                    savedDoctor,

                offline:
                    false

            };

        } catch (error) {

            /*
            ==========================================
            SERVER ERROR
            ==========================================
            */

            if (error.response) {

                const message =
                    error.response.data?.message ||

                    "You are not authorized to create a doctor.";


                throw new Error(
                    message,
                    { cause: error }
                );

            }


            /*
            ==========================================
            REAL NETWORK ERROR
            ==========================================
            */

            console.warn(
                "⚠️ Network error. Saving doctor locally...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE CREATE
    ==============================================
    */

    const offlineDoctor = {

        ...doctor,

        doctor_id:
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
    SAVE LOCAL RECORD
    ----------------------------------------------
    */

    const savedDoctor =
        await offlineCreate(

            "doctors",

            offlineDoctor

        );


    /*
    ----------------------------------------------
    QUEUE CREATE
    ----------------------------------------------
    */

    await queueOperation({

        type:
            "CREATE",

        storeName:
            "doctors",

        recordId:
            savedDoctor?.id ?? null,

        data:
            savedDoctor

    });


    return {

        success:
            true,

        offline:
            true,

        doctor:
            savedDoctor,

        message:
            "Doctor saved offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
UPDATE DOCTOR
==================================================
*/

export const updateDoctor = async (
    identifier,
    doctorData
) => {

    /*
    ==============================================
    FIND LOCAL COPY
    ==============================================
    */

    const localDoctor =
        await findLocalDoctor(
            identifier
        );


    /*
    ==============================================
    DETERMINE SERVER ID
    ==============================================
    */

    const serverId =
        localDoctor?.doctor_id ??
        (
            localDoctor
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

            const response =
                await api.put(

                    `/doctors/${serverId}`,

                    doctorData,

                    getAuthConfig()

                );


            const updatedDoctor =
                response.data?.doctor;


            if (!updatedDoctor) {

                throw new Error(
                    "Server did not return the updated doctor."
                );

            }


            /*
            --------------------------------------
            PRESERVE LOCAL INDEXEDDB ID
            --------------------------------------
            */

            const normalizedDoctor =
                normalizeDoctor(

                    updatedDoctor,

                    {

                        id:
                            localDoctor?.id,

                        _syncStatus:
                            "synced",

                        _localOnly:
                            false,

                        _createdOffline:
                            false,

                        _updatedOffline:
                            false,

                        _syncedAt:
                            new Date().toISOString(),

                        _updatedAt:
                            undefined

                    }

                );


            /*
            --------------------------------------
            SAVE LOCAL COPY
            --------------------------------------
            */

            const savedDoctor =
                localDoctor

                    ? await offlineUpdate(
                        "doctors",
                        normalizedDoctor
                    )

                    : await offlineUpsert(
                        "doctors",
                        normalizedDoctor
                    );


            return {

                ...response.data,

                success:
                    true,

                doctor:
                    savedDoctor,

                offline:
                    false

            };

        } catch (error) {

            /*
            ==========================================
            SERVER ERROR
            ==========================================
            */

            if (error.response) {

                const message =
                    error.response.data?.message ||

                    "You are not authorized to update this doctor.";


                throw new Error(
                    message,
                    { cause: error }
                );

            }


            /*
            ==========================================
            NETWORK FAILURE
            ==========================================
            */

            console.warn(
                "⚠️ Network error. Switching to offline update...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE UPDATE
    ==============================================
    */

    if (!localDoctor) {

        throw new Error(
            "Doctor not found locally."
        );

    }


    const updatedDoctor = {

        ...localDoctor,

        ...doctorData,

        /*
        ------------------------------------------
        PRESERVE SERVER ID
        ------------------------------------------
        */

        doctor_id:
            localDoctor.doctor_id ?? null,

        /*
        ------------------------------------------
        SYNC FLAGS
        ------------------------------------------
        */

        _syncStatus:
            "pending",

        _localOnly:
            localDoctor._localOnly === true,

        _createdOffline:
            localDoctor._createdOffline === true,

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

    const savedDoctor =
        await offlineUpdate(

            "doctors",

            updatedDoctor

        );


    /*
    ----------------------------------------------
    QUEUE UPDATE
    ----------------------------------------------
    */

    await queueOperation({

        type:
            "UPDATE",

        storeName:
            "doctors",

        recordId:
            localDoctor.id,

        serverId:
            localDoctor.doctor_id ?? null,

        data:
            savedDoctor || updatedDoctor

    });


    return {

        success:
            true,

        offline:
            true,

        doctor:
            savedDoctor || updatedDoctor,

        message:
            "Doctor updated offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
DELETE DOCTOR
==================================================
*/

export const deleteDoctor = async (
    identifier
) => {

    /*
    ==============================================
    FIND LOCAL COPY
    ==============================================
    */

    const localDoctor =
        await findLocalDoctor(
            identifier
        );


    /*
    ==============================================
    DETERMINE SERVER ID
    ==============================================
    */

    const serverId =
        localDoctor?.doctor_id ??
        (
            localDoctor
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

                    `/doctors/${serverId}`,

                    getAuthConfig()

                );


            /*
            --------------------------------------
            REMOVE LOCAL COPY
            --------------------------------------
            */

            if (localDoctor) {

                await offlineDelete(

                    "doctors",

                    localDoctor.id

                );

            }


            return {

                ...response.data,

                success:
                    true,

                offline:
                    false

            };

        } catch (error) {

            /*
            ==========================================
            SERVER ERROR
            ==========================================
            */

            if (error.response) {

                const message =
                    error.response.data?.message ||

                    "You are not authorized to delete this doctor.";


                throw new Error(
                    message,
                    { cause: error }
                );

            }


            /*
            ==========================================
            NETWORK FAILURE
            ==========================================
            */

            console.warn(
                "⚠️ Network error. Switching to offline delete...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE DELETE
    ==============================================
    */

    if (!localDoctor) {

        throw new Error(
            "Doctor not found locally."
        );

    }


    /*
    ----------------------------------------------
    SPECIAL CASE:
    OFFLINE-CREATED DOCTOR
    ----------------------------------------------

    It has never existed on the server.

    Therefore the sync queue does not need to send
    a DELETE request to PostgreSQL.

    We remove it locally.

    ----------------------------------------------
    */

    if (
        localDoctor._createdOffline === true &&
        !localDoctor.doctor_id
    ) {

        await offlineDelete(

            "doctors",

            localDoctor.id

        );


        return {

            success:
                true,

            offline:
                true,

            cancelled:
                true,

            message:
                "Offline doctor creation cancelled."

        };

    }


    /*
    ----------------------------------------------
    LOCAL DELETE
    ----------------------------------------------
    */

    await offlineDelete(

        "doctors",

        localDoctor.id

    );


    /*
    ----------------------------------------------
    QUEUE DELETE
    ----------------------------------------------
    */

    await queueOperation({

        type:
            "DELETE",

        storeName:
            "doctors",

        recordId:
            localDoctor.id,

        serverId:
            localDoctor.doctor_id ?? null

    });


    return {

        success:
            true,

        offline:
            true,

        message:
            "Doctor deleted offline. The deletion will synchronize when the connection returns."

    };

};


/*
==================================================
SEARCH DOCTORS
==================================================
*/

export const searchDoctors = async (
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

                    `/doctors/search?q=${encodeURIComponent(keyword)}`,

                    getAuthConfig()

                );


            return {

                ...response.data,

                offline:
                    false

            };

        } catch (error) {

            /*
            --------------------------------------
            AUTH / SERVER ERROR
            --------------------------------------
            */

            if (error.response) {

                throw new Error(

                    error.response.data?.message ||

                    "Doctor search failed.",

                    { cause: error }
                );

            }


            console.warn(
                "⚠️ Online doctor search failed. Searching locally...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE SEARCH
    ==============================================
    */

    const doctors =
        await offlineGetAll(
            "doctors"
        );


    const filtered =
        doctors.filter(
            doctor => {

                return (

                    doctor.first_name
                        ?.toLowerCase()
                        .includes(keyword)

                    ||

                    doctor.last_name
                        ?.toLowerCase()
                        .includes(keyword)

                    ||

                    doctor.email
                        ?.toLowerCase()
                        .includes(keyword)

                    ||

                    doctor.phone
                        ?.toLowerCase()
                        .includes(keyword)

                    ||

                    doctor.specialization
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

        doctors:
            deduplicateDoctors(
                filtered
            )

    };

};