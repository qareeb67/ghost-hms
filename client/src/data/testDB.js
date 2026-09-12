import { openDB } from "./db";

export const testDatabase = async () => {

    try {

        const db = await openDB();

        console.log(
            "🔥 Hospital Management System IndexedDB connected:",
            db.name
        );

        console.log(
            "📦 Available stores:",
            [...db.objectStoreNames]
        );

        db.close();

    } catch (error) {

        console.error(
            "❌ Hospital Management System IndexedDB error:",
            error
        );

    }

};