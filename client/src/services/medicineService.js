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
    mergeServerAndLocal
} from "./offlineMergeService";


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
GET ALL MEDICINES
==================================================
*/

export const getMedicines = async () => {

    /*
    ----------------------------------------------
    ONLINE
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    "/medicines",
                    getAuthConfig()
                );


            const medicines =
                response.data.medicines || [];


            /*
            Cache server medicines locally.
            */

            for (const medicine of medicines) {

                await offlineUpsert(
                    "medicines",
                    {
                        ...medicine,

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


            const localRecords =
                await offlineGetAll(
                    "medicines"
                );

            const mergedRecords =
                mergeServerAndLocal({
                    serverRecords: medicines,
                    localRecords,
                    serverIdField: "medicine_id"
                });

            return {
                ...response.data,
                success: true,
                offline: false,
                medicines: mergedRecords
            };

        } catch (error) {

            console.warn(
                "Online medicine request failed. Loading offline medicines...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE
    ----------------------------------------------
    */

    const medicines =
        await offlineGetAll(
            "medicines"
        );


    return {

        success:
            true,

        offline:
            true,

        medicines

    };

};


/*
==================================================
GET ONE MEDICINE
==================================================
*/

export const getMedicineById = async (
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
                    `/medicines/${id}`,
                    getAuthConfig()
                );


            const medicine =
                response.data.medicine;


            if (medicine) {

                await offlineUpsert(
                    "medicines",
                    {
                        ...medicine,

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
                "Online medicine request failed. Loading local medicine...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE
    ----------------------------------------------
    */

    const medicines =
        await offlineGetAll(
            "medicines"
        );


    const medicine =
        medicines.find(
            item =>

                (
                    item.medicine_id !== undefined &&
                    item.medicine_id !== null &&
                    String(
                        item.medicine_id
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


    if (!medicine) {

        throw new Error(
            "Medicine not found locally."
        );

    }


    return {

        success:
            true,

        offline:
            true,

        medicine

    };

};


/*
==================================================
CREATE MEDICINE
==================================================
*/

export const createMedicine = async (
    medicine
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
                    "/medicines",
                    medicine,
                    getAuthConfig()
                );


            const serverMedicine =
                response.data.medicine;


            if (!serverMedicine) {

                throw new Error(
                    "Server did not return medicine after CREATE."
                );

            }


            await offlineUpsert(
                "medicines",
                {
                    ...serverMedicine,

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
                "Online medicine creation failed. Saving locally...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE CREATE
    ----------------------------------------------
    */

    const offlineMedicine = {

        ...medicine,

        medicine_id:
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
            "medicines",
            offlineMedicine
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
            "medicines",

        data:
            saved

    });


    return {

        success:
            true,

        offline:
            true,

        medicine:
            saved,

        message:
            "Medicine saved offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
UPDATE MEDICINE
==================================================
*/

export const updateMedicine = async (
    id,
    medicine
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
                    `/medicines/${id}`,
                    medicine,
                    getAuthConfig()
                );


            const serverMedicine =
                response.data.medicine;


            if (!serverMedicine) {

                throw new Error(
                    "Server did not return medicine after UPDATE."
                );

            }


            /*
            Find the local record so we preserve
            the IndexedDB primary key.
            */

            const medicines =
                await offlineGetAll(
                    "medicines"
                );


            const localMedicine =
                medicines.find(
                    item =>
                        String(
                            item.medicine_id
                        ) === String(id)
                );


            if (localMedicine) {

                await offlineUpdate(
                    "medicines",
                    {

                        ...serverMedicine,

                        id:
                            localMedicine.id,

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
                    "medicines",
                    {

                        ...serverMedicine,

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
                "Online medicine update failed. Updating locally...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE UPDATE
    ----------------------------------------------
    */

    const medicines =
        await offlineGetAll(
            "medicines"
        );


    console.log(
        "🔎 UPDATE medicine lookup:",
        {
            requestedId: id,
            requestedIdType: typeof id,
            medicines
        }
    );


    const existingMedicine =
        medicines.find(
            item => {

                const localId =
                    item?.id;

                const serverId =
                    item?.medicine_id;


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


    console.log(
        "🔎 UPDATE medicine found:",
        existingMedicine
    );


    if (!existingMedicine) {

        throw new Error(
            "Medicine not found locally."
        );

    }


    const updatedMedicine = {

        ...existingMedicine,

        ...medicine,

        _syncStatus:
            "pending",

        _localOnly:
            existingMedicine._localOnly ||
            false,

        _createdOffline:
            existingMedicine._createdOffline ||
            false,

        _updatedOffline:
            true,

        _updatedAt:
            new Date().toISOString()

    };


    await offlineUpdate(
        "medicines",
        updatedMedicine
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
            "medicines",

        recordId:
            existingMedicine.id,

        serverId:
            existingMedicine.medicine_id ??
            null,

        data:
            medicine

    });


    return {

        success:
            true,

        offline:
            true,

        medicine:
            updatedMedicine,

        message:
            "Medicine updated offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
DELETE MEDICINE
==================================================
*/

export const deleteMedicine = async (
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
                    `/medicines/${id}`,
                    getAuthConfig()
                );


            const medicines =
                await offlineGetAll(
                    "medicines"
                );


            const localMedicine =
                medicines.find(
                    item =>
                        String(
                            item.medicine_id
                        ) === String(id)
                );


            if (localMedicine) {

                await offlineDelete(
                    "medicines",
                    localMedicine.id
                );

            }


            return response.data;

        } catch (error) {

            console.warn(
                "Online medicine deletion failed. Deleting locally...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE DELETE
    ----------------------------------------------
    */

    const medicines =
        await offlineGetAll(
            "medicines"
        );


    const localMedicine =
        medicines.find(
            item =>

                (
                    item.medicine_id !== undefined &&
                    item.medicine_id !== null &&
                    String(
                        item.medicine_id
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


    if (!localMedicine) {

        throw new Error(
            "Medicine not found locally."
        );

    }


    /*
    ----------------------------------------------
    QUEUE DELETE FIRST
    ----------------------------------------------
    */

    await queueOperation({

        type:
            "DELETE",

        storeName:
            "medicines",

        recordId:
            localMedicine.id,

        serverId:
            localMedicine.medicine_id ??
            null

    });


    /*
    ----------------------------------------------
    DELETE LOCAL
    ----------------------------------------------
    */

    await offlineDelete(
        "medicines",
        localMedicine.id
    );


    return {

        success:
            true,

        offline:
            true,

        message:
            "Medicine deleted locally. Server synchronization will happen when the connection returns."

    };

};


/*
==================================================
SEARCH MEDICINES
==================================================
*/

export const searchMedicines = async (
    keyword
) => {

    const trimmedKeyword =
        keyword?.trim();


    if (!trimmedKeyword) {

        throw new Error(
            "Search keyword is required."
        );

    }


    /*
    ----------------------------------------------
    ONLINE SEARCH
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    `/medicines/search?keyword=${encodeURIComponent(
                        trimmedKeyword
                    )}`,
                    getAuthConfig()
                );


            const medicines =
                response.data.medicines || [];


            /*
            Cache search results locally.
            */

            for (const medicine of medicines) {

                await offlineUpsert(
                    "medicines",
                    {
                        ...medicine,

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
                "Online medicine search failed. Searching locally...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE SEARCH
    ----------------------------------------------
    */

    const medicines =
        await offlineGetAll(
            "medicines"
        );


    const searchTerm =
        trimmedKeyword.toLowerCase();


    const results =
        medicines.filter(
            medicine => {

                const medicineName =
                    String(
                        medicine.medicine_name || ""
                    ).toLowerCase();

                const category =
                    String(
                        medicine.category || ""
                    ).toLowerCase();

                const manufacturer =
                    String(
                        medicine.manufacturer || ""
                    ).toLowerCase();


                return (

                    medicineName.includes(
                        searchTerm
                    )

                    ||

                    category.includes(
                        searchTerm
                    )

                    ||

                    manufacturer.includes(
                        searchTerm
                    )

                );

            }
        );


    return {

        success:
            true,

        offline:
            true,

        medicines:
            results

    };

};