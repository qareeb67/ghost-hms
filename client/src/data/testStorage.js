import {
    saveRecord,
    getRecords,
    getRecord,
    updateRecord,
    deleteRecord
} from "./storage";

const testStorage = async () => {

    try {

        console.log("🔥 Testing Hospital Management System storage...");

        // 1. Save
        const savedPatient = await saveRecord(
            "patients",
            {
                patient_id: 999999,
                first_name: "Offline",
                last_name: "Test",
                email: "offline@test.com"
            }
        );

        console.log(
            "✅ Saved:",
            savedPatient
        );


        // 2. Get all
        const patients = await getRecords(
            "patients"
        );

        console.log(
            "✅ All patients:",
            patients
        );


        // 3. Get one
        const patient = await getRecord(
            "patients",
            savedPatient.id
        );

        console.log(
            "✅ Single patient:",
            patient
        );


        // 4. Update
        const updatedPatient =
            await updateRecord(
                "patients",
                {
                    ...patient,
                    first_name: "Offline Updated"
                }
            );

        console.log(
            "✅ Updated:",
            updatedPatient
        );


        // 5. Delete
        await deleteRecord(
            "patients",
            updatedPatient.id
        );

        console.log(
            "✅ Deleted test patient"
        );


        console.log(
            "🎉 Storage test completed successfully!"
        );

    } catch (error) {

        console.error(
            "❌ Storage test failed:",
            error
        );

    }
};

export default testStorage;