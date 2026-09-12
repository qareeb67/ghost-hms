import { offlineGetAll } from "./services/offlineService";

import {
    syncPendingOperations
} from "./services/syncEngine";


/*
==================================================
TEST SYNC QUEUE
==================================================
*/

export const testQueue = async () => {

    console.log(
        "🔎 Inspecting Hospital Management System sync queue..."
    );


    try {

        const queue =
            await offlineGetAll(
                "sync_queue"
            );


        console.table(
            queue.map(
                operation => ({

                    id:
                        operation.id,

                    type:
                        operation.type,

                    storeName:
                        operation.storeName,

                    recordId:
                        operation.recordId,

                    serverId:
                        operation.serverId,

                    localDataId:
                        operation.data?.id,

                    doctorId:
                        operation.data?.doctor_id,

                    status:
                        operation.status,

                    attempts:
                        operation.attempts,

                    createdAt:
                        operation.createdAt,

                    lastError:
                        operation.lastError

                })
            )
        );


        return queue;


    } catch (error) {

        console.error(
            "❌ Failed to inspect sync queue:",
            error
        );


        throw error;

    }

};
 
export const testDoctors = async () => {

    console.log(
        "🔎 Inspecting Hospital Management System doctors..."
    );

    try {

        const doctors =
            await offlineGetAll(
                "doctors"
            );

        console.table(
            doctors.map(
                doctor => ({

                    id:
                        doctor.id,

                    doctor_id:
                        doctor.doctor_id,

                    first_name:
                        doctor.first_name,

                    last_name:
                        doctor.last_name,

                    localOnly:
                        doctor._localOnly,

                    syncStatus:
                        doctor._syncStatus,

                    createdOffline:
                        doctor._createdOffline,

                    updatedOffline:
                        doctor._updatedOffline,

                    createdAt:
                        doctor._createdAt,

                    updatedAt:
                        doctor._updatedAt,

                    syncedAt:
                        doctor._syncedAt

                })
            )
        );

        return doctors;

    } catch (error) {

        console.error(
            "❌ Failed to inspect doctors:",
            error
        );

        throw error;

    }

};

/*
==================================================
TEST SYNC ENGINE
==================================================
*/

export const testSync = async () => {

    console.log(
        "🔥 Testing Hospital Management System Sync Engine..."
    );


    try {

        const result =
            await syncPendingOperations();


        console.log(
            "🎉 Sync result:",
            result
        );


        return result;


    } catch (error) {

        console.error(
            "❌ Sync test failed:",
            error
        );


        throw error;

    }

};

window.testQueue = testQueue;
window.testSync = testSync;
window.testDoctors = testDoctors;