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


/*
==================================================
AUTH
==================================================
*/

const getToken = () => {

    return localStorage.getItem("token");

};


const getAuthConfig = () => {

    const token = getToken();

    return {

        headers: {

            Authorization:
                `Bearer ${token}`

        }

    };

};


/*
==================================================
NETWORK
==================================================
*/

const isOnline = () => {

    return navigator.onLine;

};


/*
==================================================
GET ALL QUALIFICATIONS FOR DOCTOR
==================================================
*/

export const getDoctorQualifications = async (
    doctorId
) => {

    if (
        doctorId === undefined ||
        doctorId === null
    ) {

        throw new Error(
            "Doctor ID is required."
        );

    }


    /*
    ==============================================
    ONLINE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    `/doctors/${doctorId}/qualifications`,
                    getAuthConfig()
                );


            const qualifications =
                Array.isArray(
                    response.data?.qualifications
                )
                    ? response.data.qualifications
                    : [];


            /*
            --------------------------------------
            CACHE QUALIFICATIONS
            --------------------------------------
            */

            for (
                const qualification
                of qualifications
            ) {

                await offlineUpsert(
                    "doctorQualifications",
                    {

                        ...qualification,

                        doctor_id:
                            doctorId,

                        _syncStatus:
                            "synced",

                        _localOnly:
                            false

                    }
                );

            }


            return {

                ...response.data,

                offline:
                    false

            };

        } catch (error) {

            /*
            Server responded:
            return fallback only for
            real network failure.
            */

            if (error.response) {

                throw new Error(
                    error.response.data?.message ||
                    "Failed to load doctor qualifications.",
                    { cause: error }
                );

            }


            console.warn(
                "⚠️ Network error. Loading qualifications offline..."
            );

        }

    }


    /*
    ==============================================
    OFFLINE
    ==============================================
    */

    const qualifications =
        await offlineGetAll(
            "doctorQualifications"
        );


    const filtered =
        qualifications.filter(
            qualification =>
                String(
                    qualification.doctor_id
                ) === String(doctorId)
        );


    return {

        success:
            true,

        offline:
            true,

        qualifications:
            filtered

    };

};


/*
==================================================
CREATE QUALIFICATION
==================================================
*/

export const createDoctorQualification = async (
    doctorId,
    qualificationData
) => {

    if (
        doctorId === undefined ||
        doctorId === null
    ) {

        throw new Error(
            "Doctor ID is required."
        );

    }


    /*
    ==============================================
    ONLINE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.post(
                    `/doctors/${doctorId}/qualifications`,
                    qualificationData,
                    getAuthConfig()
                );


            const qualification =
                response.data?.qualification;


            if (!qualification) {

                throw new Error(
                    "Server did not return the created qualification."
                );

            }


            const savedQualification =
                await offlineUpsert(
                    "doctorQualifications",
                    {

                        ...qualification,

                        doctor_id:
                            doctorId,

                        _syncStatus:
                            "synced",

                        _localOnly:
                            false,

                        _createdOffline:
                            false

                    }
                );


            return {

                ...response.data,

                qualification:
                    savedQualification,

                offline:
                    false

            };

        } catch (error) {

            if (error.response) {

                throw new Error(
                    error.response.data?.message ||
                    "Failed to create doctor qualification.",
                    { cause: error }
                );

            }


            console.warn(
                "⚠️ Network error. Saving qualification offline..."
            );

        }

    }


    /*
    ==============================================
    OFFLINE CREATE
    ==============================================
    */

    const offlineQualification = {

        ...qualificationData,

        doctor_id:
            doctorId,

        qualification_id:
            null,

        _syncStatus:
            "pending",

        _localOnly:
            true,

        _createdOffline:
            true,

        _createdAt:
            new Date().toISOString()

    };


    const savedQualification =
        await offlineCreate(
            "doctorQualifications",
            offlineQualification
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
            "doctorQualifications",

        data:
            savedQualification

    });


    return {

        success:
            true,

        offline:
            true,

        qualification:
            savedQualification,

        message:
            "Qualification saved offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
UPDATE QUALIFICATION
==================================================
*/

export const updateDoctorQualification = async (
    doctorId,
    qualificationId,
    qualificationData
) => {

    if (
        doctorId === undefined ||
        doctorId === null
    ) {

        throw new Error(
            "Doctor ID is required."
        );

    }


    if (
        qualificationId === undefined ||
        qualificationId === null
    ) {

        throw new Error(
            "Qualification ID is required."
        );

    }


    /*
    ==============================================
    ONLINE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.put(
                    `/doctors/${doctorId}/qualifications/${qualificationId}`,
                    qualificationData,
                    getAuthConfig()
                );


            const qualification =
                response.data?.qualification;


            if (!qualification) {

                throw new Error(
                    "Server did not return the updated qualification."
                );

            }


            await offlineUpsert(
                "doctorQualifications",
                {

                    ...qualification,

                    doctor_id:
                        doctorId,

                    _syncStatus:
                        "synced",

                    _localOnly:
                        false

                }
            );


            return {

                ...response.data,

                offline:
                    false

            };

        } catch (error) {

            if (error.response) {

                throw new Error(
                    error.response.data?.message ||
                    "Failed to update doctor qualification.",
                    { cause: error }
                );

            }


            console.warn(
                "⚠️ Network error. Updating qualification offline..."
            );

        }

    }


    /*
    ==============================================
    OFFLINE
    ==============================================
    */

    const qualifications =
        await offlineGetAll(
            "doctorQualifications"
        );


    const localQualification =
        qualifications.find(
            qualification =>
                String(
                    qualification.id
                ) === String(qualificationId)

                ||

                String(
                    qualification.qualification_id
                ) === String(qualificationId)
        );


    if (!localQualification) {

        throw new Error(
            "Doctor qualification not found locally."
        );

    }


    const updatedQualification = {

        ...localQualification,

        ...qualificationData,

        doctor_id:
            doctorId,

        _syncStatus:
            "pending",

        _updatedOffline:
            true,

        _updatedAt:
            new Date().toISOString()

    };


    await offlineUpdate(
        "doctorQualifications",
        updatedQualification
    );


    await queueOperation({

        type:
            "UPDATE",

        storeName:
            "doctorQualifications",

        recordId:
            localQualification.id,

        serverId:
            localQualification.qualification_id ?? null,

        data:
            updatedQualification

    });


    return {

        success:
            true,

        offline:
            true,

        qualification:
            updatedQualification,

        message:
            "Qualification updated offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
DELETE QUALIFICATION
==================================================
*/

export const deleteDoctorQualification = async (
    doctorId,
    qualificationId
) => {

    if (
        doctorId === undefined ||
        doctorId === null
    ) {

        throw new Error(
            "Doctor ID is required."
        );

    }


    if (
        qualificationId === undefined ||
        qualificationId === null
    ) {

        throw new Error(
            "Qualification ID is required."
        );

    }


    /*
    ==============================================
    ONLINE DELETE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.delete(
                    `/doctors/${doctorId}/qualifications/${qualificationId}`,
                    getAuthConfig()
                );


            /*
            --------------------------------------
            REMOVE LOCAL COPY
            --------------------------------------
            */

            const qualifications =
                await offlineGetAll(
                    "doctorQualifications"
                );


            const localQualification =
                qualifications.find(
                    qualification =>
                        String(
                            qualification.qualification_id
                        ) === String(qualificationId)
                );


            if (localQualification?.id) {

                await offlineDelete(
                    "doctorQualifications",
                    localQualification.id
                );

            }


            return {

                ...response.data,

                offline:
                    false

            };

        } catch (error) {

            if (error.response) {

                throw new Error(
                    error.response.data?.message ||
                    "Failed to delete doctor qualification.",
                    { cause: error }
                );

            }


            console.warn(
                "⚠️ Network error. Deleting qualification offline..."
            );

        }

    }


    /*
    ==============================================
    OFFLINE DELETE
    ==============================================
    */

    const qualifications =
        await offlineGetAll(
            "doctorQualifications"
        );


    const localQualification =
        qualifications.find(
            qualification =>
                String(
                    qualification.id
                ) === String(qualificationId)

                ||

                String(
                    qualification.qualification_id
                ) === String(qualificationId)
        );


    if (!localQualification) {

        throw new Error(
            "Doctor qualification not found locally."
        );

    }


    await offlineDelete(
        "doctorQualifications",
        localQualification.id
    );


    await queueOperation({

        type:
            "DELETE",

        storeName:
            "doctorQualifications",

        recordId:
            localQualification.id,

        serverId:
            localQualification.qualification_id ?? null

    });


    return {

        success:
            true,

        offline:
            true,

        message:
            "Qualification deleted offline. The deletion will synchronize when the connection returns."

    };

};