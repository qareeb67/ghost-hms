
import {
    queueOperation,
    getPendingOperations,
    markOperationProcessing,
    markOperationPending,
    removeQueuedOperation
} from "./syncQueueService";


const testSyncQueue = async () => {

    try {

        console.log(
            "🔥 Testing Hospital Management System sync queue..."
        );


        /*
        ==================================================
        1. CREATE TEST OPERATION
        ==================================================
        */

        const createOperation =
            await queueOperation({

                type:
                    "CREATE",

                storeName:
                    "doctors",

                data: {

                    first_name:
                        "Offline",

                    last_name:
                        "QueueTest",

                    specialization:
                        "Cardiology",

                    email:
                        "queue@test.com",

                    phone:
                        "08000000000",

                    years_of_experience:
                        5,

                    doctor_id:
                        null

                }

            });


        console.log(
            "✅ CREATE queued:",
            createOperation
        );


        /*
        ==================================================
        2. READ PENDING QUEUE
        ==================================================
        */

        let pending =
            await getPendingOperations();


        console.log(
            "✅ Pending operations:",
            pending
        );


        /*
        ==================================================
        3. TEST PROCESSING
        ==================================================
        */

        const processingOperation =
            await markOperationProcessing(
                createOperation
            );


        console.log(
            "✅ Operation marked processing:",
            processingOperation
        );


        /*
        ==================================================
        4. RETURN TO PENDING
        ==================================================
        */

        const pendingOperation =
            await markOperationPending(
                processingOperation
            );


        console.log(
            "✅ Operation returned to pending:",
            pendingOperation
        );


        /*
        ==================================================
        5. READ QUEUE AGAIN
        ==================================================
        */

        pending =
            await getPendingOperations();


        console.log(
            "✅ Queue after processing test:",
            pending
        );


        /*
        ==================================================
        6. CLEAN TEST OPERATION
        ==================================================
        */

        await removeQueuedOperation(
            createOperation.id
        );


        console.log(
            "🗑️ Test queue operation removed."
        );


        /*
        ==================================================
        7. FINAL CHECK
        ==================================================
        */

        pending =
            await getPendingOperations();


        console.log(
            "✅ Final pending queue:",
            pending
        );


        console.log(
            "🎉 Sync queue test completed successfully!"
        );


        return true;

    } catch (error) {

        console.error(
            "❌ Sync queue test failed:",
            error
        );


        throw error;

    }

};


export default testSyncQueue;

