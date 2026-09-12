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
HOSPITAL MANAGEMENT SYSTEM
MEDICAL RECORD SERVICE

Responsibilities:
- Online medical record operations
- Offline medical record operations
- IndexedDB caching
- Offline CREATE / UPDATE / DELETE queueing
- Patient-specific medical history
==================================================
*/


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
NORMALIZE RECORD RESPONSE
==================================================

Different backend responses may use:

medicalRecord
record
medicalRecords
records

These helpers keep the frontend service consistent.
==================================================
*/

const getRecordFromResponse = (response) => {

    return (
        response?.data?.medicalRecord ||
        response?.data?.record ||
        null
    );

};


const getRecordsFromResponse = (response) => {

    return (
        response?.data?.medicalRecords ||
        response?.data?.records ||
        []
    );

};


/*
==================================================
GET RECORD ID
==================================================
*/

const getRecordId = (record) => {

    if (
        record?.medical_record_id !== undefined &&
        record?.medical_record_id !== null
    ) {

        return record.medical_record_id;

    }


    if (
        record?.record_id !== undefined &&
        record?.record_id !== null
    ) {

        return record.record_id;

    }


    if (
        record?.id !== undefined &&
        record?.id !== null
    ) {

        return record.id;

    }


    return null;

};


const normalizeMedicalRecord = (record) => {

    if (!record) {
        return record;
    }

    const recordId =
        record.record_id ??
        record.medical_record_id ??
        null;

    return {
        ...record,
        record_id: recordId
    };
};


/*
==================================================
CACHE RECORD
==================================================
*/

const cacheMedicalRecord = async (
    record
) => {

    if (!record) {

        return;

    }


    record = normalizeMedicalRecord(record);

    await offlineUpsert(
        "medical_records",
        {

            ...record,

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

};


/*
==================================================
CACHE MULTIPLE RECORDS
==================================================
*/

const cacheMedicalRecords = async (
    records
) => {

    if (!Array.isArray(records)) {

        return;

    }


    for (
        const record
        of records
    ) {

        await cacheMedicalRecord(
            record
        );

    }

};


/*
==================================================
FIND LOCAL RECORD
==================================================
*/

const findLocalRecord = async (
    id
) => {

    const records =
        await offlineGetAll(
            "medical_records"
        );


    return records.find(
        record => {

            const recordId =
                getRecordId(record);


            return (
                recordId !== null &&
                String(recordId) === String(id)
            );

        }
    );

};


/*
==================================================
GET ALL MEDICAL RECORDS
==================================================
*/

export const getMedicalRecords = async () => {

    /*
    ==================================================
    ONLINE
    ==================================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    "/medical-records",
                    getAuthConfig()
                );


            const records =
                getRecordsFromResponse(
                    response
                ).map(normalizeMedicalRecord);


            /*
            Cache server records locally.
            */

            await cacheMedicalRecords(
                records
            );


            const mergedRecords =
                await mergeServerWithLocal(
                    "medical_records",
                    records,
                    "record_id"
                );


            return {

                ...response.data,

                offline: false,

                records:
                    mergedRecords,

                medicalRecords:
                    mergedRecords

            };

        } catch (error) {

            console.warn(
                "Online medical records request failed. Loading offline records...",
                error
            );

        }

    }


    /*
    ==================================================
    OFFLINE
    ==================================================
    */

    const records =
        await offlineGetAll(
            "medical_records"
        );


    /*
    Sort newest visit first.
    */

    records.sort(
        (a, b) => {

            const dateA =
                a.visit_date
                    ? new Date(
                        a.visit_date
                    ).getTime()
                    : 0;


            const dateB =
                b.visit_date
                    ? new Date(
                        b.visit_date
                    ).getTime()
                    : 0;


            return dateB - dateA;

        }
    );


    return {

        success:
            true,

        offline:
            true,

        medicalRecords:
            records,

        records

    };

};


/*
==================================================
GET MEDICAL RECORD BY ID
==================================================
*/

export const getMedicalRecordById = async (
    id
) => {

    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        throw new Error(
            "Medical record ID is required."
        );

    }


    /*
    ==================================================
    ONLINE
    ==================================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    `/medical-records/${id}`,
                    getAuthConfig()
                );


            const record =
                getRecordFromResponse(
                    response
                );


            if (record) {

                await cacheMedicalRecord(
                    record
                );

            }


            return response.data;

        } catch (error) {

            console.warn(
                "Online medical record request failed. Loading offline record...",
                error
            );

        }

    }


    /*
    ==================================================
    OFFLINE
    ==================================================
    */

    const record =
        await findLocalRecord(
            id
        );


    if (!record) {

        throw new Error(
            "Medical record not found locally."
        );

    }


    return {

        success:
            true,

        offline:
            true,

        medicalRecord:
            record,

        record

    };

};


/*
==================================================
GET MEDICAL RECORDS BY PATIENT
==================================================
*/

export const getMedicalRecordsByPatient = async (
    patientId
) => {

    /*
    ==================================================
    VALIDATE PATIENT ID
    ==================================================
    */

    if (
        patientId === undefined ||
        patientId === null ||
        patientId === ""
    ) {

        throw new Error(
            "Patient ID is required."
        );

    }


    /*
    ==================================================
    ONLINE
    ==================================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    `/medical-records/patient/${patientId}`,
                    getAuthConfig()
                );


            const records =
                getRecordsFromResponse(
                    response
                ).map(normalizeMedicalRecord);


            /*
            Cache patient records locally.
            */

            await cacheMedicalRecords(
                records
            );


            /*
            Return normalized response.
            */

            return {

                ...response.data,

                records,

                medicalRecords:
                    response.data.medicalRecords ||
                    records

            };

        } catch (error) {

            console.warn(
                "Online patient medical history request failed. Loading offline records...",
                error
            );

        }

    }


    /*
    ==================================================
    OFFLINE
    ==================================================
    */

    const records =
        await offlineGetAll(
            "medical_records"
        );


    /*
    Filter records belonging
    to this patient.
    */

    const patientRecords =
        records.filter(
            record => {

                if (
                    record.patient_id === undefined ||
                    record.patient_id === null
                ) {

                    return false;

                }


                return (
                    String(
                        record.patient_id
                    ) === String(patientId)
                );

            }
        );


    /*
    ==================================================
    SORT BY VISIT DATE
    NEWEST FIRST
    ==================================================
    */

    patientRecords.sort(
        (a, b) => {

            const dateA =
                a.visit_date
                    ? new Date(
                        a.visit_date
                    ).getTime()
                    : 0;


            const dateB =
                b.visit_date
                    ? new Date(
                        b.visit_date
                    ).getTime()
                    : 0;


            return dateB - dateA;

        }
    );


    return {

        success:
            true,

        offline:
            true,

        patient_id:
            patientId,

        records:
            patientRecords,

        medicalRecords:
            patientRecords

    };

};


/*
==================================================
CREATE MEDICAL RECORD
==================================================
*/

export const createMedicalRecord = async (
    record
) => {

    if (!record) {

        throw new Error(
            "Medical record data is required."
        );

    }


    /*
    ==================================================
    ONLINE CREATE
    ==================================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.post(
                    "/medical-records",
                    record,
                    getAuthConfig()
                );


            const serverRecord =
                getRecordFromResponse(
                    response
                );


            if (!serverRecord) {

                throw new Error(
                    "Server did not return medical record after CREATE."
                );

            }


            /*
            Cache server-created record.
            */

            await cacheMedicalRecord(
                serverRecord
            );


            return response.data;

        } catch (error) {

            console.warn(
                "Online medical record creation failed. Saving locally...",
                error
            );

        }

    }


    /*
    ==================================================
    OFFLINE CREATE
    ==================================================
    */

    const offlineRecord = {

        ...record,

        record_id:
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
    Save locally first.
    */

    const saved =
        await offlineCreate(
            "medical_records",
            offlineRecord
        );


    /*
    ==================================================
    QUEUE CREATE
    ==================================================
    */

    await queueOperation({

        type:
            "CREATE",

        storeName:
            "medical_records",

        data:
            saved

    });


    return {

        success:
            true,

        offline:
            true,

        medicalRecord:
            saved,

        record:
            saved,

        message:
            "Medical record saved offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
UPDATE MEDICAL RECORD
==================================================
*/

export const updateMedicalRecord = async (
    id,
    record
) => {

    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        throw new Error(
            "Medical record ID is required."
        );

    }


    if (!record) {

        throw new Error(
            "Medical record data is required."
        );

    }


    /*
    ==================================================
    ONLINE UPDATE
    ==================================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.patch(
                    `/medical-records/${id}`,
                    record,
                    getAuthConfig()
                );


            const serverRecord =
                getRecordFromResponse(
                    response
                );


            if (!serverRecord) {

                throw new Error(
                    "Server did not return medical record after UPDATE."
                );

            }


            /*
            Find existing local record
            so IndexedDB identity is preserved.
            */

            const localRecord =
                await findLocalRecord(
                    id
                );


            if (localRecord) {

                await offlineUpdate(
                    "medical_records",
                    {

                        ...serverRecord,

                        id:
                            localRecord.id,

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

                await cacheMedicalRecord(
                    serverRecord
                );

            }


            return response.data;

        } catch (error) {

            console.warn(
                "Online medical record update failed. Updating locally...",
                error
            );

        }

    }


    /*
    ==================================================
    OFFLINE UPDATE
    ==================================================
    */

    const existingRecord =
        await findLocalRecord(
            id
        );


    if (!existingRecord) {

        throw new Error(
            "Medical record not found locally."
        );

    }


    const updatedRecord = {

        ...existingRecord,

        ...record,

        _syncStatus:
            "pending",

        _localOnly:
            existingRecord._localOnly ||
            false,

        _createdOffline:
            existingRecord._createdOffline ||
            false,

        _updatedOffline:
            true,

        _updatedAt:
            new Date().toISOString()

    };


    /*
    Update local IndexedDB record.
    */

    await offlineUpdate(
        "medical_records",
        updatedRecord
    );


    /*
    ==================================================
    QUEUE UPDATE
    ==================================================
    */

    await queueOperation({

        type:
            "UPDATE",

        storeName:
            "medical_records",

        recordId:
            existingRecord.id,

        serverId:
            existingRecord.record_id ??
            existingRecord.medical_record_id ??
            null,

        data:
            record

    });


    return {

        success:
            true,

        offline:
            true,

        medicalRecord:
            updatedRecord,

        record:
            updatedRecord,

        message:
            "Medical record updated offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
DELETE MEDICAL RECORD
==================================================
*/

export const deleteMedicalRecord = async (
    id
) => {

    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        throw new Error(
            "Medical record ID is required."
        );

    }


    /*
    ==================================================
    FIND LOCAL RECORD
    ==================================================
    */

    const localRecord =
        await findLocalRecord(
            id
        );


    /*
    ==================================================
    ONLINE DELETE
    ==================================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.delete(
                    `/medical-records/${id}`,
                    getAuthConfig()
                );


            /*
            Remove cached record
            after successful server delete.
            */

            if (localRecord) {

                await offlineDelete(
                    "medical_records",
                    localRecord.id
                );

            }


            return response.data;

        } catch (error) {

            console.warn(
                "Online medical record deletion failed. Deleting locally...",
                error
            );

        }

    }


    /*
    ==================================================
    OFFLINE DELETE
    ==================================================
    */

    if (!localRecord) {

        throw new Error(
            "Medical record not found locally."
        );

    }


    /*
    ==================================================
    QUEUE DELETE FIRST
    ==================================================
    */

    await queueOperation({

        type:
            "DELETE",

        storeName:
            "medical_records",

        recordId:
            localRecord.id,

        serverId:
            localRecord.record_id ??
            localRecord.medical_record_id ??
            null

    });


    /*
    ==================================================
    DELETE LOCAL
    ==================================================
    */

    await offlineDelete(
        "medical_records",
        localRecord.id
    );


    return {

        success:
            true,

        offline:
            true,

        message:
            "Medical record deleted locally. Server synchronization will happen when the connection returns."

    };

};