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
HELPERS
==================================================
*/

const normalizePrescription = (
    prescription
) => {

    return {
        ...prescription,

        prescription_id:
            prescription.prescription_id ??
            prescription.id ??
            null
    };

};


const markSynced = (
    prescription
) => ({
    ...prescription,

    _syncStatus:
        "synced",

    _localOnly:
        false,

    _createdOffline:
        false,

    _updatedOffline:
        false
});


/*
==================================================
GET ALL PRESCRIPTIONS
==================================================
*/

export const getPrescriptions = async () => {

    /*
    ----------------------------------------------
    ONLINE
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    "/prescriptions",
                    getAuthConfig()
                );


            const prescriptions =
                response.data.prescriptions || [];


            /*
            Cache every prescription locally.
            */

            for (
                const prescription
                of prescriptions
            ) {

                await offlineUpsert(
                    "prescriptions",
                    markSynced(
                        normalizePrescription(
                            prescription
                        )
                    )
                );

            }


            const mergedPrescriptions =
                await mergeServerWithLocal(
                    "prescriptions",
                    prescriptions,
                    "prescription_id"
                );


            return {

                ...response.data,

                prescriptions:
                    mergedPrescriptions

            };

        } catch (error) {

            console.warn(
                "Online prescription request failed. Loading offline prescriptions...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE
    ----------------------------------------------
    */

    const prescriptions =
        await offlineGetAll(
            "prescriptions"
        );


    return {

        success:
            true,

        offline:
            true,

        prescriptions

    };

};


/*
==================================================
GET PRESCRIPTION BY ID
==================================================
*/

export const getPrescriptionById = async (
    id
) => {

    /*
    ----------------------------------------------
    ONLINE
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    `/prescriptions/${id}`,
                    getAuthConfig()
                );


            const prescription =
                response.data.prescription;


            if (prescription) {

                await offlineUpsert(
                    "prescriptions",
                    markSynced(
                        normalizePrescription(
                            prescription
                        )
                    )
                );

            }


            return response.data;

        } catch (error) {

            console.warn(
                "Online prescription request failed. Loading local prescription...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE
    ----------------------------------------------
    */

    const prescriptions =
        await offlineGetAll(
            "prescriptions"
        );


    const prescription =
        prescriptions.find(
            item =>

                (
                    item.prescription_id !== undefined &&
                    item.prescription_id !== null &&
                    String(
                        item.prescription_id
                    ) === String(id)
                )

                ||

                (
                    item.id !== undefined &&
                    item.id !== null &&
                    String(
                        item.id
                    ) === String(id)
                )

        );


    if (!prescription) {

        throw new Error(
            "Prescription not found locally."
        );

    }


    return {

        success:
            true,

        offline:
            true,

        prescription

    };

};


/*
==================================================
GET PRESCRIPTIONS BY MEDICAL RECORD
==================================================
*/

export const getPrescriptionsByRecord = async (
    recordId
) => {

    /*
    ----------------------------------------------
    ONLINE
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    `/prescriptions/record/${recordId}`,
                    getAuthConfig()
                );


            const prescriptions =
                response.data.prescriptions || [];


            /*
            Cache prescriptions locally.
            */

            for (
                const prescription
                of prescriptions
            ) {

                await offlineUpsert(
                    "prescriptions",
                    markSynced(
                        normalizePrescription(
                            prescription
                        )
                    )
                );

            }


            return response.data;

        } catch (error) {

            console.warn(
                "Online prescription record request failed. Loading local prescriptions...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE
    ----------------------------------------------
    */

    const prescriptions =
        await offlineGetAll(
            "prescriptions"
        );


    const matchingPrescriptions =
        prescriptions.filter(
            prescription =>
                String(
                    prescription.record_id
                ) === String(recordId)
        );


    return {

        success:
            true,

        offline:
            true,

        record_id:
            Number(recordId),

        count:
            matchingPrescriptions.length,

        prescriptions:
            matchingPrescriptions

    };

};


/*
==================================================
CREATE PRESCRIPTION
==================================================
*/

export const createPrescription = async (
    prescription
) => {

    /*
    ----------------------------------------------
    ONLINE CREATE
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response =
                await api.post(
                    "/prescriptions",
                    prescription,
                    getAuthConfig()
                );


            const serverPrescription =
                response.data.prescription;


            if (!serverPrescription) {

                throw new Error(
                    "Server did not return prescription after CREATE."
                );

            }


            await offlineUpsert(
                "prescriptions",
                markSynced(
                    normalizePrescription(
                        serverPrescription
                    )
                )
            );


            return response.data;

        } catch (error) {

            console.warn(
                "Online prescription creation failed. Saving locally...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE CREATE
    ----------------------------------------------
    */

    const offlinePrescription = {

        ...prescription,

        prescription_id:
            null,

        items:
            prescription.items || [],

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
            "prescriptions",
            offlinePrescription
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
            "prescriptions",

        data:
            saved

    });


    return {

        success:
            true,

        offline:
            true,

        prescription:
            saved,

        message:
            "Prescription saved offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
UPDATE PRESCRIPTION
==================================================
*/

export const updatePrescription = async (
    id,
    prescription
) => {

    /*
    ----------------------------------------------
    ONLINE UPDATE
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response =
                await api.patch(
                    `/prescriptions/${id}`,
                    prescription,
                    getAuthConfig()
                );


            const serverPrescription =
                response.data.prescription;


            if (!serverPrescription) {

                throw new Error(
                    "Server did not return prescription after UPDATE."
                );

            }


            const prescriptions =
                await offlineGetAll(
                    "prescriptions"
                );


            const localPrescription =
                prescriptions.find(
                    item =>
                        String(
                            item.prescription_id
                        ) === String(id)
                );


            if (localPrescription) {

                await offlineUpdate(
                    "prescriptions",
                    {

                        ...serverPrescription,

                        id:
                            localPrescription.id,

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

                await offlineUpsert(
                    "prescriptions",
                    markSynced(
                        normalizePrescription(
                            serverPrescription
                        )
                    )
                );

            }


            return response.data;

        } catch (error) {

            console.warn(
                "Online prescription update failed. Updating locally...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE UPDATE
    ----------------------------------------------
    */

    const prescriptions =
        await offlineGetAll(
            "prescriptions"
        );


    const existingPrescription =
        prescriptions.find(
            item => {

                const localId =
                    item?.id;

                const serverId =
                    item?.prescription_id;


                return (

                    localId !== undefined &&
                    localId !== null &&
                    String(localId) === String(id)

                )

                ||

                (

                    serverId !== undefined &&
                    serverId !== null &&
                    serverId !== "" &&
                    String(serverId) === String(id)

                );

            }
        );


    if (!existingPrescription) {

        throw new Error(
            "Prescription not found locally."
        );

    }


    const updatedPrescription = {

        ...existingPrescription,

        ...prescription,

        _syncStatus:
            "pending",

        _localOnly:
            existingPrescription._localOnly ||
            false,

        _createdOffline:
            existingPrescription._createdOffline ||
            false,

        _updatedOffline:
            true,

        _updatedAt:
            new Date().toISOString()

    };


    await offlineUpdate(
        "prescriptions",
        updatedPrescription
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
            "prescriptions",

        recordId:
            existingPrescription.id,

        serverId:
            existingPrescription.prescription_id ??
            null,

        data:
            prescription

    });


    return {

        success:
            true,

        offline:
            true,

        prescription:
            updatedPrescription,

        message:
            "Prescription updated offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
REPLACE PRESCRIPTION ITEMS
==================================================
*/

export const replacePrescriptionItems = async (
    id,
    items
) => {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        throw new Error(
            "At least one medication item is required."
        );

    }


    /*
    ----------------------------------------------
    ONLINE UPDATE ITEMS
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response =
                await api.patch(
                    `/prescriptions/${id}/items`,
                    { items },
                    getAuthConfig()
                );


            /*
            Update the cached prescription
            with the new medication items.
            */

            const prescriptions =
                await offlineGetAll(
                    "prescriptions"
                );


            const localPrescription =
                prescriptions.find(
                    item =>
                        String(
                            item.prescription_id
                        ) === String(id)
                );


            if (localPrescription) {

                await offlineUpdate(
                    "prescriptions",
                    {

                        ...localPrescription,

                        items:
                            response.data.items ||
                            items,

                        _syncStatus:
                            "synced",

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
                "Online prescription items update failed. Updating locally...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE UPDATE ITEMS
    ----------------------------------------------
    */

    const prescriptions =
        await offlineGetAll(
            "prescriptions"
        );


    const existingPrescription =
        prescriptions.find(
            item =>

                (
                    item.prescription_id !== undefined &&
                    item.prescription_id !== null &&
                    String(
                        item.prescription_id
                    ) === String(id)
                )

                ||

                (
                    item.id !== undefined &&
                    item.id !== null &&
                    String(
                        item.id
                    ) === String(id)
                )

        );


    if (!existingPrescription) {

        throw new Error(
            "Prescription not found locally."
        );

    }


    const updatedPrescription = {

        ...existingPrescription,

        items,

        _syncStatus:
            "pending",

        _updatedOffline:
            true,

        _updatedAt:
            new Date().toISOString()

    };


    await offlineUpdate(
        "prescriptions",
        updatedPrescription
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
            "prescriptions",

        recordId:
            existingPrescription.id,

        serverId:
            existingPrescription.prescription_id ??
            null,

        data: {

            items

        }

    });


    return {

        success:
            true,

        offline:
            true,

        prescription:
            updatedPrescription,

        message:
            "Prescription medication items updated offline. They will synchronize when the connection returns."

    };

};


/*
==================================================
DELETE PRESCRIPTION
==================================================
*/

export const deletePrescription = async (
    id
) => {

    /*
    ----------------------------------------------
    ONLINE DELETE
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response =
                await api.delete(
                    `/prescriptions/${id}`,
                    getAuthConfig()
                );


            const prescriptions =
                await offlineGetAll(
                    "prescriptions"
                );


            const localPrescription =
                prescriptions.find(
                    item =>
                        String(
                            item.prescription_id
                        ) === String(id)
                );


            if (localPrescription) {

                await offlineDelete(
                    "prescriptions",
                    localPrescription.id
                );

            }


            return response.data;

        } catch (error) {

            console.warn(
                "Online prescription deletion failed. Deleting locally...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE DELETE
    ----------------------------------------------
    */

    const prescriptions =
        await offlineGetAll(
            "prescriptions"
        );


    const localPrescription =
        prescriptions.find(
            item =>

                (
                    item.prescription_id !== undefined &&
                    item.prescription_id !== null &&
                    String(
                        item.prescription_id
                    ) === String(id)
                )

                ||

                (
                    item.id !== undefined &&
                    item.id !== null &&
                    String(
                        item.id
                    ) === String(id)
                )

        );


    if (!localPrescription) {

        throw new Error(
            "Prescription not found locally."
        );

    }


    /*
    Queue DELETE first.
    */

    await queueOperation({

        type:
            "DELETE",

        storeName:
            "prescriptions",

        recordId:
            localPrescription.id,

        serverId:
            localPrescription.prescription_id ??
            null

    });


    /*
    Delete local record.
    */

    await offlineDelete(
        "prescriptions",
        localPrescription.id
    );


    return {

        success:
            true,

        offline:
            true,

        message:
            "Prescription deleted locally. Server synchronization will happen when the connection returns."

    };

};


/*
==================================================
DEFAULT EXPORT
==================================================
*/

export default {

    getPrescriptions,

    getPrescriptionById,

    getPrescriptionsByRecord,

    createPrescription,

    updatePrescription,

    replacePrescriptionItems,

    deletePrescription

};