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
GET ALL LABORATORY TESTS
==================================================
*/

export const getLaboratoryTests = async () => {

    /*
    ==============================================
    ONLINE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    "/laboratory",
                    getAuthConfig()
                );


            const tests =
                response.data.laboratoryTests ||
                [];


            /*
            Cache server records locally.
            */

            for (const test of tests) {

                await offlineUpsert(
                    "laboratory",
                    {

                        ...test,

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


            const mergedTests =
                await mergeServerWithLocal(
                    "laboratory",
                    tests,
                    "test_id"
                );


            return {

                ...response.data,

                tests:
                    mergedTests

            };

        } catch (error) {

            console.warn(
                "Online laboratory request failed. Loading offline laboratory tests...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE
    ==============================================
    */

    const tests =
        await offlineGetAll(
            "laboratory"
        );


    return {

        success:
            true,

        offline:
            true,

        laboratoryTests:
            tests

    };

};


/*
==================================================
GET LABORATORY TEST BY ID
==================================================
*/

export const getLaboratoryTestById = async (
    id
) => {

    /*
    ==============================================
    ONLINE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    `/laboratory/${id}`,
                    getAuthConfig()
                );


            const test =
                response.data.laboratoryTest;


            if (test) {

                await offlineUpsert(
                    "laboratory",
                    {

                        ...test,

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
                "Online laboratory request failed. Loading offline test...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE
    ==============================================
    */

    const tests =
        await offlineGetAll(
            "laboratory"
        );


    const test =
        tests.find(
            item =>

                String(
                    item.test_id
                ) === String(id)

                ||

                String(
                    item.id
                ) === String(id)
        );


    if (!test) {

        throw new Error(
            "Laboratory test not found locally."
        );

    }


    return {

        success:
            true,

        offline:
            true,

        laboratoryTest:
            test

    };

};


/*
==================================================
CREATE LABORATORY TEST
==================================================
*/

export const createLaboratoryTest = async (
    test
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
                    "/laboratory",
                    test,
                    getAuthConfig()
                );


            const serverTest =
                response.data.laboratoryTest;


            if (!serverTest) {

                throw new Error(
                    "Server did not return laboratory test after CREATE."
                );

            }


            await offlineUpsert(
                "laboratory",
                {

                    ...serverTest,

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
                "Online laboratory creation failed. Saving locally...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE CREATE
    ==============================================
    */

    const offlineTest = {

        ...test,

        test_id:
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
            "laboratory",
            offlineTest
        );


    /*
    ==============================================
    QUEUE CREATE
    ==============================================
    */

    await queueOperation({

        type:
            "CREATE",

        storeName:
            "laboratory",

        data:
            saved

    });


    return {

        success:
            true,

        offline:
            true,

        laboratoryTest:
            saved,

        message:
            "Laboratory test saved offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
UPDATE LABORATORY TEST
==================================================
*/

export const updateLaboratoryTest = async (
    id,
    test
) => {

    /*
    ==============================================
    ONLINE UPDATE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.patch(
                    `/laboratory/${id}`,
                    test,
                    getAuthConfig()
                );


            const serverTest =
                response.data.laboratoryTest;


            if (!serverTest) {

                throw new Error(
                    "Server did not return laboratory test after UPDATE."
                );

            }


            const tests =
                await offlineGetAll(
                    "laboratory"
                );


            const localTest =
                tests.find(
                    item =>

                        String(
                            item.test_id
                        ) === String(id)
                );


            if (localTest) {

                await offlineUpdate(
                    "laboratory",
                    {

                        ...serverTest,

                        id:
                            localTest.id,

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
                    "laboratory",
                    {

                        ...serverTest,

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
                "Online laboratory update failed. Updating locally...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE UPDATE
    ==============================================
    */

    const tests =
        await offlineGetAll(
            "laboratory"
        );


    const existingTest =
        tests.find(
            item =>

                (
                    item.test_id !== undefined &&

                    item.test_id !== null &&

                    String(
                        item.test_id
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


    if (!existingTest) {

        throw new Error(
            "Laboratory test not found locally."
        );

    }


    const updatedTest = {

        ...existingTest,

        ...test,

        _syncStatus:
            "pending",

        _localOnly:
            existingTest._localOnly ||
            false,

        _createdOffline:
            existingTest._createdOffline ||
            false,

        _updatedOffline:
            true,

        _updatedAt:
            new Date().toISOString()

    };


    await offlineUpdate(
        "laboratory",
        updatedTest
    );


    /*
    ==============================================
    QUEUE UPDATE
    ==============================================
    */

    await queueOperation({

        type:
            "UPDATE",

        storeName:
            "laboratory",

        recordId:
            existingTest.id,

        serverId:
            existingTest.test_id ??
            null,

        data:
            test

    });


    return {

        success:
            true,

        offline:
            true,

        laboratoryTest:
            updatedTest,

        message:
            "Laboratory test updated offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
COMPLETE LABORATORY TEST
==================================================
*/

export const completeLaboratoryTest = async (
    id,
    result
) => {

    /*
    ==============================================
    ONLINE COMPLETE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.patch(
                    `/laboratory/${id}/complete`,
                    {
                        result
                    },
                    getAuthConfig()
                );


            const serverTest =
                response.data.laboratoryTest;


            if (!serverTest) {

                throw new Error(
                    "Server did not return laboratory test after COMPLETE."
                );

            }


            const tests =
                await offlineGetAll(
                    "laboratory"
                );


            const localTest =
                tests.find(
                    item =>
                        String(
                            item.test_id
                        ) === String(id)
                );


            if (localTest) {

                await offlineUpdate(
                    "laboratory",
                    {

                        ...serverTest,

                        id:
                            localTest.id,

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
                    "laboratory",
                    {

                        ...serverTest,

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
                "Online laboratory completion failed. Completing locally...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE COMPLETE
    ==============================================
    */

    const tests =
        await offlineGetAll(
            "laboratory"
        );


    const existingTest =
        tests.find(
            item =>

                (
                    item.test_id !== undefined &&

                    item.test_id !== null &&

                    String(
                        item.test_id
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


    if (!existingTest) {

        throw new Error(
            "Laboratory test not found locally."
        );

    }


    const updatedTest = {

        ...existingTest,

        result:

            result,

        status:
            "Completed",

        completed_at:
            new Date().toISOString(),

        _syncStatus:
            "pending",

        _localOnly:
            existingTest._localOnly ||
            false,

        _createdOffline:
            existingTest._createdOffline ||
            false,

        _updatedOffline:
            true,

        _updatedAt:
            new Date().toISOString()

    };


    await offlineUpdate(
        "laboratory",
        updatedTest
    );


    /*
    ==============================================
    QUEUE COMPLETE
    ==============================================
    */

    await queueOperation({

        type:
            "COMPLETE",

        storeName:
            "laboratory",

        recordId:
            existingTest.id,

        serverId:
            existingTest.test_id ??
            null,

        data: {

            result:
                result

        }

    });


    return {

        success:
            true,

        offline:
            true,

        laboratoryTest:
            updatedTest,

        message:
            "Laboratory test completed offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
DELETE LABORATORY TEST
==================================================
*/

export const deleteLaboratoryTest = async (
    id
) => {

    /*
    ==============================================
    ONLINE DELETE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.delete(
                    `/laboratory/${id}`,
                    getAuthConfig()
                );


            const tests =
                await offlineGetAll(
                    "laboratory"
                );


            const localTest =
                tests.find(
                    item =>

                        String(
                            item.test_id
                        ) === String(id)

                );


            if (localTest) {

                await offlineDelete(
                    "laboratory",
                    localTest.id
                );

            }


            return response.data;

        } catch (error) {

            console.warn(
                "Online laboratory deletion failed. Deleting locally...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE DELETE
    ==============================================
    */

    const tests =
        await offlineGetAll(
            "laboratory"
        );


    const localTest =
        tests.find(
            item =>

                (
                    item.test_id !== undefined &&

                    item.test_id !== null &&

                    String(
                        item.test_id
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


    if (!localTest) {

        throw new Error(
            "Laboratory test not found locally."
        );

    }


    /*
    ==============================================
    QUEUE DELETE FIRST
    ==============================================
    */

    await queueOperation({

        type:
            "DELETE",

        storeName:
            "laboratory",

        recordId:
            localTest.id,

        serverId:
            localTest.test_id ??
            null

    });


    /*
    ==============================================
    DELETE LOCAL
    ==============================================
    */

    await offlineDelete(
        "laboratory",
        localTest.id
    );


    return {

        success:
            true,

        offline:
            true,

        message:
            "Laboratory test deleted locally. Server synchronization will happen when the connection returns."

    };

};