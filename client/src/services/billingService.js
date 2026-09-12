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
GET ALL BILLS
==================================================
*/

export const getBills = async () => {

    /*
    ----------------------------------------------
    ONLINE
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    "/billing",
                    getAuthConfig()
                );


            const bills =
                response.data.bills || [];


            /*
            Cache server bills locally.
            */

            for (const bill of bills) {

                await offlineUpsert(
                    "billing",
                    {
                        ...bill,

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


            const mergedBills =
                await mergeServerWithLocal(
                    "billing",
                    bills,
                    "bill_id"
                );


            return {

                ...response.data,

                bills:
                    mergedBills

            };

        } catch (error) {

            console.warn(
                "Online billing request failed. Loading offline bills...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE
    ----------------------------------------------
    */

    const bills =
        await offlineGetAll(
            "billing"
        );


    return {

        success:
            true,

        offline:
            true,

        bills

    };

};


/*
==================================================
CREATE BILL
==================================================
*/

export const createBill = async (
    bill
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
                    "/billing",
                    bill,
                    getAuthConfig()
                );


            const serverBill =
                response.data.bill;


            if (!serverBill) {

                throw new Error(
                    "Server did not return bill after CREATE."
                );

            }


            await offlineUpsert(
                "billing",
                {
                    ...serverBill,

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
                "Online bill creation failed. Saving locally...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE CREATE
    ----------------------------------------------
    */

    const offlineBill = {

        ...bill,

        bill_id:
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
            "billing",
            offlineBill
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
            "billing",

        data:
            saved

    });


    return {

        success:
            true,

        offline:
            true,

        bill:
            saved,

        message:
            "Bill saved offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
UPDATE BILL
==================================================
*/

export const updateBill = async (
    id,
    bill
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
                    `/billing/${id}`,
                    bill,
                    getAuthConfig()
                );


            const serverBill =
                response.data.bill;


            if (!serverBill) {

                throw new Error(
                    "Server did not return bill after UPDATE."
                );

            }


            /*
            Find existing local bill so we
            preserve the IndexedDB id.
            */

            const bills =
                await offlineGetAll(
                    "billing"
                );


            const localBill =
                bills.find(
                    item =>
                        String(
                            item.bill_id
                        ) === String(id)
                );


            if (localBill) {

                await offlineUpdate(
                    "billing",
                    {

                        ...serverBill,

                        id:
                            localBill.id,

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
                    "billing",
                    {

                        ...serverBill,

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
                "Online bill update failed. Updating locally...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE UPDATE
    ----------------------------------------------
    */

    const bills =
        await offlineGetAll(
            "billing"
        );


    const existingBill =
        bills.find(
            item =>

                (
                    item.bill_id !== undefined &&
                    item.bill_id !== null &&
                    String(item.bill_id) === String(id)
                )

                ||

                (
                    item.id !== undefined &&
                    item.id !== null &&
                    String(item.id) === String(id)
                )

        );


    if (!existingBill) {

        throw new Error(
            "Bill not found locally."
        );

    }


    const updatedBill = {

        ...existingBill,

        ...bill,

        _syncStatus:
            "pending",

        _localOnly:
            existingBill._localOnly ||
            false,

        _createdOffline:
            existingBill._createdOffline ||
            false,

        _updatedOffline:
            true,

        _updatedAt:
            new Date().toISOString()

    };


    await offlineUpdate(
        "billing",
        updatedBill
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
            "billing",

        recordId:
            existingBill.id,

        serverId:
            existingBill.bill_id ??
            null,

        data:
            bill

    });


    return {

        success:
            true,

        offline:
            true,

        bill:
            updatedBill,

        message:
            "Bill updated offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
DELETE BILL
==================================================
*/

export const deleteBill = async (
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
                    `/billing/${id}`,
                    getAuthConfig()
                );


            const bills =
                await offlineGetAll(
                    "billing"
                );


            const localBill =
                bills.find(
                    item =>
                        String(
                            item.bill_id
                        ) === String(id)
                );


            if (localBill) {

                await offlineDelete(
                    "billing",
                    localBill.id
                );

            }


            return response.data;

        } catch (error) {

            console.warn(
                "Online bill deletion failed. Deleting locally...",
                error
            );

        }

    }


    /*
    ----------------------------------------------
    OFFLINE DELETE
    ----------------------------------------------
    */

    const bills =
        await offlineGetAll(
            "billing"
        );


    const localBill =
        bills.find(
            item =>

                (
                    item.bill_id !== undefined &&
                    item.bill_id !== null &&
                    String(item.bill_id) === String(id)
                )

                ||

                (
                    item.id !== undefined &&
                    item.id !== null &&
                    String(item.id) === String(id)
                )

        );


    if (!localBill) {

        throw new Error(
            "Bill not found locally."
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
            "billing",

        recordId:
            localBill.id,

        serverId:
            localBill.bill_id ??
            null

    });


    /*
    ----------------------------------------------
    DELETE LOCAL
    ----------------------------------------------
    */

    await offlineDelete(
        "billing",
        localBill.id
    );


    return {

        success:
            true,

        offline:
            true,

        message:
            "Bill deleted locally. Server synchronization will happen when the connection returns."

    };

};