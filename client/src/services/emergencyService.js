import api from "./api";

import {
    offlineGetAll,
    offlineUpdate,
    offlineCreate,
    offlineDelete,
    offlineUpsert
} from "./offlineService";

import {
    queueOperation
} from "./syncQueueService";

import {
    mergeServerWithLocal
} from "./offlineDataService";


/*
==================================================
AUTH
==================================================
*/

const getToken = () =>
    localStorage.getItem("token");


const getAuthConfig = () => ({
    headers: {
        Authorization:
            `Bearer ${getToken()}`
    }
});


/*
==================================================
NETWORK
==================================================
*/

const isOnline = () =>
    navigator.onLine;


/*
==================================================
INDEXEDDB STORE
==================================================

IMPORTANT:

The canonical Hospital Management System IndexedDB store is:

    emergency

Do NOT use:

    emergency_cases

==================================================
*/

const STORE_NAME = "emergency";


/*
==================================================
FIND LOCAL EMERGENCY
==================================================
*/

const findLocalEmergency = async (
    id
) => {

    const emergencies =
        await offlineGetAll(
            STORE_NAME
        );


    return emergencies.find(
        (item) => {

            const localId =
                item?.id;

            const serverId =
                item?.emergency_id;


            return (

                localId !== undefined &&
                localId !== null &&
                String(localId) ===
                String(id)

            ) || (

                serverId !== undefined &&
                serverId !== null &&
                String(serverId) ===
                String(id)

            );

        }
    ) || null;

};


/*
==================================================
GET ALL EMERGENCY CASES
==================================================
*/

export const getEmergencyCases =
    async () => {

        /*
        ------------------------------------------
        ONLINE
        ------------------------------------------
        */

        if (isOnline()) {

            try {

                const response =
                    await api.get(
                        "/emergency",
                        getAuthConfig()
                    );


                const emergencies =
                    response.data?.emergencies ||
                    [];


                /*
                ----------------------------------
                CACHE SERVER RECORDS
                ----------------------------------
                */

                for (
                    const emergency
                    of emergencies
                ) {

                    await offlineUpsert(
                        STORE_NAME,
                        {

                            ...emergency,

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


                const mergedEmergencies =
                await mergeServerWithLocal(
                    "emergency",
                    emergencies,
                    "emergency_id"
                );


            return {

                ...response.data,

                emergencies:
                    mergedEmergencies

            };

            } catch (error) {

                console.warn(
                    "⚠️ Online emergency request failed. Loading offline emergencies...",
                    error
                );

            }

        }


        /*
        ------------------------------------------
        OFFLINE FALLBACK
        ------------------------------------------
        */

        const emergencies =
            await offlineGetAll(
                STORE_NAME
            );


        return {

            success:
                true,

            offline:
                true,

            emergencies

        };

    };


/*
==================================================
GET ONE EMERGENCY CASE
==================================================
*/

export const getEmergencyCaseById =
    async (
        id
    ) => {

        /*
        ------------------------------------------
        ONLINE
        ------------------------------------------
        */

        if (isOnline()) {

            try {

                const response =
                    await api.get(
                        `/emergency/${id}`,
                        getAuthConfig()
                    );


                const emergency =
                    response.data?.emergency;


                /*
                ----------------------------------
                CACHE SERVER RECORD
                ----------------------------------
                */

                if (emergency) {

                    await offlineUpsert(
                        STORE_NAME,
                        {

                            ...emergency,

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


                return response.data;

            } catch (error) {

                console.warn(
                    "⚠️ Online emergency request failed. Loading local emergency...",
                    error
                );

            }

        }


        /*
        ------------------------------------------
        OFFLINE FALLBACK
        ------------------------------------------
        */

        const emergency =
            await findLocalEmergency(
                id
            );


        if (!emergency) {

            throw new Error(
                "Emergency case not found locally."
            );

        }


        return {

            success:
                true,

            offline:
                true,

            emergency

        };

    };


/*
==================================================
CREATE EMERGENCY CASE
==================================================
*/

export const createEmergencyCase =
    async (
        emergency
    ) => {

        /*
        ------------------------------------------
        ONLINE CREATE
        ------------------------------------------
        */

        if (isOnline()) {

            try {

                const response =
                    await api.post(
                        "/emergency",
                        emergency,
                        getAuthConfig()
                    );


                const serverEmergency =
                    response.data?.emergency;


                if (!serverEmergency) {

                    throw new Error(
                        "Server did not return emergency case after CREATE."
                    );

                }


                /*
                ----------------------------------
                CACHE SERVER RECORD
                ----------------------------------
                */

                await offlineUpsert(
                    STORE_NAME,
                    {

                        ...serverEmergency,

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


                return response.data;

            } catch (error) {

                console.warn(
                    "⚠️ Online emergency creation failed. Saving locally...",
                    error
                );

            }

        }


        /*
        ------------------------------------------
        OFFLINE CREATE
        ------------------------------------------
        */

        const offlineEmergency = {

            ...emergency,

            emergency_id:
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


        const saved =
            await offlineCreate(
                STORE_NAME,
                offlineEmergency
            );


        /*
        ------------------------------------------
        QUEUE CREATE
        ------------------------------------------
        */

        await queueOperation({

            type:
                "CREATE",

            storeName:
                STORE_NAME,

            data:
                saved

        });


        return {

            success:
                true,

            offline:
                true,

            emergency:
                saved,

            message:
                "Emergency case saved offline. It will synchronize when the connection returns."

        };

    };


/*
==================================================
UPDATE EMERGENCY CASE
==================================================
*/

export const updateEmergencyCase =
    async (
        id,
        emergency
    ) => {

        /*
        ------------------------------------------
        ONLINE UPDATE
        ------------------------------------------
        */

        if (isOnline()) {

            try {

                const response =
                    await api.patch(
                        `/emergency/${id}`,
                        emergency,
                        getAuthConfig()
                    );


                const serverEmergency =
                    response.data?.emergency;


                if (!serverEmergency) {

                    throw new Error(
                        "Server did not return emergency case after UPDATE."
                    );

                }


                const localEmergency =
                    await findLocalEmergency(
                        id
                    );


                /*
                ----------------------------------
                UPDATE EXISTING LOCAL RECORD
                ----------------------------------
                */

                if (localEmergency) {

                    await offlineUpdate(
                        STORE_NAME,
                        {

                            ...serverEmergency,

                            id:
                                localEmergency.id,

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

                }


                /*
                ----------------------------------
                CREATE LOCAL CACHE IF MISSING
                ----------------------------------
                */

                else {

                    await offlineUpsert(
                        STORE_NAME,
                        {

                            ...serverEmergency,

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

                }


                return response.data;

            } catch (error) {

                console.warn(
                    "⚠️ Online emergency update failed. Updating locally...",
                    error
                );

            }

        }


        /*
        ------------------------------------------
        OFFLINE UPDATE
        ------------------------------------------
        */

        const existingEmergency =
            await findLocalEmergency(
                id
            );


        if (!existingEmergency) {

            throw new Error(
                "Emergency case not found locally."
            );

        }


        const updatedEmergency = {

            ...existingEmergency,

            ...emergency,

            _syncStatus:
                "pending",

            _localOnly:
                existingEmergency._localOnly ||
                false,

            _createdOffline:
                existingEmergency._createdOffline ||
                false,

            _updatedOffline:
                true,

            _updatedAt:
                new Date().toISOString()

        };


        await offlineUpdate(
            STORE_NAME,
            updatedEmergency
        );


        /*
        ------------------------------------------
        QUEUE UPDATE
        ------------------------------------------
        */

        await queueOperation({

            type:
                "UPDATE",

            storeName:
                STORE_NAME,

            recordId:
                existingEmergency.id,

            serverId:
                existingEmergency.emergency_id ??
                null,

            data:
                emergency

        });


        return {

            success:
                true,

            offline:
                true,

            emergency:
                updatedEmergency,

            message:
                "Emergency case updated offline. It will synchronize when the connection returns."

        };

    };


/*
==================================================
UPDATE EMERGENCY STATUS
==================================================
*/

export const updateEmergencyStatus =
    async (
        id,
        status
    ) => {

        /*
        ------------------------------------------
        ONLINE STATUS UPDATE
        ------------------------------------------
        */

        if (isOnline()) {

            try {

                const response =
                    await api.patch(
                        `/emergency/${id}/status`,
                        {
                            status
                        },
                        getAuthConfig()
                    );


                const serverEmergency =
                    response.data?.emergency;


                if (!serverEmergency) {

                    throw new Error(
                        "Server did not return emergency after status update."
                    );

                }


                const localEmergency =
                    await findLocalEmergency(
                        id
                    );


                if (localEmergency) {

                    await offlineUpdate(
                        STORE_NAME,
                        {

                            ...localEmergency,

                            ...serverEmergency,

                            id:
                                localEmergency.id,

                            _syncStatus:
                                "synced",

                            _localOnly:
                                false,

                            _updatedOffline:
                                false,

                            _syncedAt:
                                new Date().toISOString()

                        }
                    );

                }


                else {

                    await offlineUpsert(
                        STORE_NAME,
                        {

                            ...serverEmergency,

                            _syncStatus:
                                "synced",

                            _localOnly:
                                false

                        }
                    );

                }


                return response.data;

            } catch (error) {

                console.warn(
                    "⚠️ Online emergency status update failed. Updating locally...",
                    error
                );

            }

        }


        /*
        ------------------------------------------
        OFFLINE STATUS UPDATE
        ------------------------------------------
        */

        const existingEmergency =
            await findLocalEmergency(
                id
            );


        if (!existingEmergency) {

            throw new Error(
                "Emergency case not found locally."
            );

        }


        const updatedEmergency = {

            ...existingEmergency,

            status,

            _syncStatus:
                "pending",

            _updatedOffline:
                true,

            _updatedAt:
                new Date().toISOString()

        };


        await offlineUpdate(
            STORE_NAME,
            updatedEmergency
        );


        /*
        ------------------------------------------
        QUEUE STATUS UPDATE
        ------------------------------------------
        */

        await queueOperation({

            type:
                "UPDATE",

            storeName:
                STORE_NAME,

            recordId:
                existingEmergency.id,

            serverId:
                existingEmergency.emergency_id ??
                null,

            data: {

                status

            }

        });


        return {

            success:
                true,

            offline:
                true,

            emergency:
                updatedEmergency,

            message:
                "Emergency status updated offline."

        };

    };


/*
==================================================
ASSIGN EMERGENCY DOCTOR
==================================================
*/

export const assignEmergencyDoctor =
    async (
        id,
        assigned_doctor
    ) => {

        /*
        ------------------------------------------
        ONLINE DOCTOR ASSIGNMENT
        ------------------------------------------
        */

        if (isOnline()) {

            try {

                const response =
                    await api.patch(
                        `/emergency/${id}/doctor`,
                        {
                            assigned_doctor
                        },
                        getAuthConfig()
                    );


                const serverEmergency =
                    response.data?.emergency;


                if (!serverEmergency) {

                    throw new Error(
                        "Server did not return emergency after doctor assignment."
                    );

                }


                const localEmergency =
                    await findLocalEmergency(
                        id
                    );


                if (localEmergency) {

                    await offlineUpdate(
                        STORE_NAME,
                        {

                            ...localEmergency,

                            ...serverEmergency,

                            id:
                                localEmergency.id,

                            _syncStatus:
                                "synced",

                            _localOnly:
                                false,

                            _updatedOffline:
                                false,

                            _syncedAt:
                                new Date().toISOString()

                        }
                    );

                }


                else {

                    await offlineUpsert(
                        STORE_NAME,
                        {

                            ...serverEmergency,

                            _syncStatus:
                                "synced",

                            _localOnly:
                                false

                        }
                    );

                }


                return response.data;

            } catch (error) {

                console.warn(
                    "⚠️ Online doctor assignment failed. Assigning locally...",
                    error
                );

            }

        }


        /*
        ------------------------------------------
        OFFLINE DOCTOR ASSIGNMENT
        ------------------------------------------
        */

        const existingEmergency =
            await findLocalEmergency(
                id
            );


        if (!existingEmergency) {

            throw new Error(
                "Emergency case not found locally."
            );

        }


        const updatedEmergency = {

            ...existingEmergency,

            assigned_doctor:
                assigned_doctor ||
                null,

            _syncStatus:
                "pending",

            _updatedOffline:
                true,

            _updatedAt:
                new Date().toISOString()

        };


        await offlineUpdate(
            STORE_NAME,
            updatedEmergency
        );


        /*
        ------------------------------------------
        QUEUE DOCTOR ASSIGNMENT
        ------------------------------------------
        */

        await queueOperation({

            type:
                "UPDATE",

            storeName:
                STORE_NAME,

            recordId:
                existingEmergency.id,

            serverId:
                existingEmergency.emergency_id ??
                null,

            data: {

                assigned_doctor:
                    assigned_doctor ||
                    null

            }

        });


        return {

            success:
                true,

            offline:
                true,

            emergency:
                updatedEmergency,

            message:
                "Emergency doctor assignment updated offline."

        };

    };


/*
==================================================
DELETE EMERGENCY CASE
==================================================
*/

export const deleteEmergencyCase =
    async (
        id
    ) => {

        /*
        ------------------------------------------
        ONLINE DELETE
        ------------------------------------------
        */

        if (isOnline()) {

            try {

                const response =
                    await api.delete(
                        `/emergency/${id}`,
                        getAuthConfig()
                    );


                /*
                ----------------------------------
                REMOVE LOCAL CACHE
                ----------------------------------
                */

                const localEmergency =
                    await findLocalEmergency(
                        id
                    );


                if (localEmergency) {

                    await offlineDelete(
                        STORE_NAME,
                        localEmergency.id
                    );

                }


                return response.data;

            } catch (error) {

                console.warn(
                    "⚠️ Online emergency deletion failed. Deleting locally...",
                    error
                );

            }

        }


        /*
        ------------------------------------------
        OFFLINE DELETE
        ------------------------------------------
        */

        const localEmergency =
            await findLocalEmergency(
                id
            );


        if (!localEmergency) {

            throw new Error(
                "Emergency case not found locally."
            );

        }


        /*
        ------------------------------------------
        QUEUE DELETE
        ------------------------------------------
        */

        await queueOperation({

            type:
                "DELETE",

            storeName:
                STORE_NAME,

            recordId:
                localEmergency.id,

            serverId:
                localEmergency.emergency_id ??
                null

        });


        /*
        ------------------------------------------
        DELETE LOCAL RECORD
        ------------------------------------------
        */

        await offlineDelete(
            STORE_NAME,
            localEmergency.id
        );


        return {

            success:
                true,

            offline:
                true,

            message:
                "Emergency case deleted locally. Server synchronization will happen when the connection returns."

        };

    };