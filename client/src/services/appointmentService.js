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

const getToken = () => {

    return localStorage.getItem(
        "token"
    );

};


const getAuthConfig = () => {

    return {

        headers: {

            Authorization:
                `Bearer ${getToken()}`

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
NORMALIZE APPOINTMENT DATE
==================================================
*/

const normalizeAppointmentDate = (
    date
) => {

    if (!date) {

        return date;

    }


    if (
        typeof date ===
        "string"
    ) {

        /*
        Convert:

        2026-08-20T07:00:00.000Z

        into:

        2026-08-20
        */

        if (
            date.includes("T")
        ) {

            return date.split("T")[0];

        }


        return date;

    }


    return date;

};


/*
==================================================
NORMALIZE APPOINTMENT TIME
==================================================
*/

const normalizeAppointmentTime = (
    time
) => {

    if (!time) {

        return time;

    }


    if (
        typeof time ===
        "string"
    ) {

        /*
        Convert:

        10:00:00

        into:

        10:00
        */

        return time.slice(
            0,
            5
        );

    }


    return time;

};


/*
==================================================
NORMALIZE APPOINTMENT PAYLOAD
==================================================
*/

const normalizeAppointmentPayload = (
    appointment
) => {

    if (!appointment) {

        return {};

    }


    return {

        ...appointment,

        appointment_date:
            normalizeAppointmentDate(
                appointment.appointment_date
            ),

        appointment_time:
            normalizeAppointmentTime(
                appointment.appointment_time
            )

    };

};


/*
==================================================
ENRICH APPOINTMENT NAMES
==================================================

Appointments store IDs.

Patients and doctors store names.

We combine them locally so the offline
appointment table can still display:

Patient
Doctor
Specialization
==================================================
*/

const enrichAppointment = async (
    appointment
) => {

    if (!appointment) {

        return appointment;

    }


    const patients =
        await offlineGetAll(
            "patients"
        );


    const doctors =
        await offlineGetAll(
            "doctors"
        );


    const patient =
        patients.find(
            (item) =>

                String(
                    item.patient_id
                ) ===
                String(
                    appointment.patient_id
                )
        );


    const doctor =
        doctors.find(
            (item) =>

                String(
                    item.doctor_id
                ) ===
                String(
                    appointment.doctor_id
                )
        );


    return {

        ...appointment,

        patient_name:

            appointment.patient_name ||

            (
                patient
                    ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
                    : ""
            ),

        doctor_name:

            appointment.doctor_name ||

            (
                doctor
                    ? `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim()
                    : ""
            ),

        specialization:

            appointment.specialization ||

            (
                doctor
                    ? doctor.specialization || ""
                    : ""
            )

    };

};


/*
==================================================
GET APPOINTMENTS
==================================================
*/

export const getAppointments = async () => {

    /*
    ==============================================
    ONLINE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.get(
                    "/appointments",
                    getAuthConfig()
                );


            const appointments =
                response.data.appointments || [];


            /*
            Cache every appointment locally.
            */

            for (
                const appointment
                of appointments
            ) {

                const enriched =
                    await enrichAppointment(
                        appointment
                    );


                await offlineUpsert(
                    "appointments",
                    {

                        ...enriched,

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


            /*
            Return enriched appointments
            to the UI.
            */

            const enrichedAppointments =
                await Promise.all(
                    appointments.map(
                        enrichAppointment
                    )
                );


            /*
            ----------------------------------------------
            MERGE SERVER DATA WITH PENDING LOCAL DATA
            ----------------------------------------------

            An appointment created offline must remain
            visible while its CREATE operation is pending.
            The server list cannot contain it yet.
            ----------------------------------------------
            */

            const mergedAppointments =
                await mergeServerWithLocal(
                    "appointments",
                    enrichedAppointments,
                    "appointment_id"
                );


            const finalAppointments =
                await Promise.all(
                    mergedAppointments.map(
                        enrichAppointment
                    )
                );


            return {

                ...response.data,

                appointments:
                    finalAppointments

            };

        } catch (error) {

            console.warn(
                "Online appointment request failed. Loading offline appointments...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE
    ==============================================
    */

    const appointments =
        await offlineGetAll(
            "appointments"
        );


    const enrichedAppointments =
        await Promise.all(
            appointments.map(
                enrichAppointment
            )
        );


    return {

        success:
            true,

        offline:
            true,

        appointments:
            enrichedAppointments

    };

};


/*
==================================================
CREATE APPOINTMENT
==================================================
*/

export const createAppointment = async (
    appointment
) => {

    /*
    ALWAYS NORMALIZE FIRST.
    */

    const normalizedAppointment =
        normalizeAppointmentPayload(
            appointment
        );


    /*
    ==============================================
    ONLINE CREATE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.post(
                    "/appointments",
                    normalizedAppointment,
                    getAuthConfig()
                );


            const serverAppointment =
                response.data.appointment;


            const enrichedAppointment =
                await enrichAppointment(
                    serverAppointment
                );


            await offlineUpsert(
                "appointments",
                {

                    ...enrichedAppointment,

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


            return {

                ...response.data,

                appointment:
                    enrichedAppointment

            };

        } catch (error) {

            console.warn(
                "Online appointment creation failed. Saving locally...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE CREATE
    ==============================================
    */

    const offlineAppointment = {

        ...normalizedAppointment,

        appointment_id:
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
            "appointments",
            offlineAppointment
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
            "appointments",

        data:
            saved

    });


    return {

        success:
            true,

        offline:
            true,

        appointment:
            saved,

        message:
            "Appointment saved offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
UPDATE APPOINTMENT
==================================================
*/

export const updateAppointment = async (
    id,
    appointment
) => {

    const normalizedAppointment =
        normalizeAppointmentPayload(
            appointment
        );


    /*
    ==============================================
    ONLINE UPDATE
    ==============================================
    */

    if (isOnline()) {

        try {

            const response =
                await api.put(
                    `/appointments/${id}`,
                    normalizedAppointment,
                    getAuthConfig()
                );


            const updatedAppointment =
                response.data.appointment;


            const enrichedAppointment =
                await enrichAppointment(
                    updatedAppointment
                );


            const appointments =
                await offlineGetAll(
                    "appointments"
                );


            const localAppointment =
                appointments.find(
                    (item) =>

                        String(
                            item.appointment_id
                        ) ===
                        String(id)
                );


            if (localAppointment) {

                await offlineUpdate(
                    "appointments",
                    {

                        ...enrichedAppointment,

                        id:
                            localAppointment.id,

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
                    "appointments",
                    {

                        ...enrichedAppointment,

                        _syncStatus:
                            "synced",

                        _localOnly:
                            false

                    }
                );

            }


            return {

                ...response.data,

                appointment:
                    enrichedAppointment

            };

        } catch (error) {

            console.warn(
                "Online appointment update failed. Updating locally...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE UPDATE
    ==============================================
    */

    const appointments =
        await offlineGetAll(
            "appointments"
        );


    const existingAppointment =
        appointments.find(
            (item) =>

                String(
                    item.appointment_id
                ) ===
                String(id)

                ||

                String(
                    item.id
                ) ===
                String(id)
        );


    if (!existingAppointment) {

        throw new Error(
            "Appointment not found locally."
        );

    }


    const updatedAppointment = {

        ...existingAppointment,

        ...normalizedAppointment,

        _syncStatus:
            "pending",

        _localOnly:
            existingAppointment._localOnly ||
            false,

        _createdOffline:
            existingAppointment._createdOffline ||
            false,

        _updatedOffline:
            true,

        _updatedAt:
            new Date().toISOString()

    };


    const enrichedAppointment =
        await enrichAppointment(
            updatedAppointment
        );


    await offlineUpdate(
        "appointments",
        enrichedAppointment
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
            "appointments",

        recordId:
            existingAppointment.id,

        serverId:
            existingAppointment.appointment_id,

        data:
            normalizedAppointment

    });


    return {

        success:
            true,

        offline:
            true,

        appointment:
            enrichedAppointment,

        message:
            "Appointment updated offline. It will synchronize when the connection returns."

    };

};


/*
==================================================
DELETE APPOINTMENT
==================================================
*/

export const deleteAppointment = async (
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
                    `/appointments/${id}`,
                    getAuthConfig()
                );


            const appointments =
                await offlineGetAll(
                    "appointments"
                );


            const localAppointment =
                appointments.find(
                    (appointment) =>

                        String(
                            appointment.appointment_id
                        ) ===
                        String(id)
                );


            if (localAppointment) {

                await offlineDelete(
                    "appointments",
                    localAppointment.id
                );

            }


            return response.data;

        } catch (error) {

            console.warn(
                "Online appointment deletion failed. Deleting locally...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE DELETE
    ==============================================
    */

    const appointments =
        await offlineGetAll(
            "appointments"
        );


    const localAppointment =
        appointments.find(
            (appointment) =>

                String(
                    appointment.appointment_id
                ) ===
                String(id)

                ||

                String(
                    appointment.id
                ) ===
                String(id)
        );


    if (!localAppointment) {

        throw new Error(
            "Appointment not found locally."
        );

    }


    /*
    Queue DELETE first.
    */

    await queueOperation({

        type:
            "DELETE",

        storeName:
            "appointments",

        recordId:
            localAppointment.id,

        serverId:
            localAppointment.appointment_id

    });


    await offlineDelete(
        "appointments",
        localAppointment.id
    );


    return {

        success:
            true,

        offline:
            true,

        message:
            "Appointment deleted locally. Server synchronization will happen when the connection returns."

    };

};


/*
==================================================
COMPLETE APPOINTMENT
==================================================
*/

export const completeAppointment = async (
    id
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
                    `/appointments/${id}/complete`,
                    {},
                    getAuthConfig()
                );


            const completedAppointment =
                response.data.appointment;


            const enrichedAppointment =
                await enrichAppointment(
                    completedAppointment
                );


            const appointments =
                await offlineGetAll(
                    "appointments"
                );


            const localAppointment =
                appointments.find(
                    (item) =>

                        String(
                            item.appointment_id
                        ) ===
                        String(id)
                );


            if (localAppointment) {

                await offlineUpdate(
                    "appointments",
                    {

                        ...enrichedAppointment,

                        id:
                            localAppointment.id,

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
                    "appointments",
                    {

                        ...enrichedAppointment,

                        _syncStatus:
                            "synced",

                        _localOnly:
                            false

                    }
                );

            }


            return {

                ...response.data,

                appointment:
                    enrichedAppointment

            };

        } catch (error) {

            console.warn(
                "Online appointment completion failed. Completing locally...",
                error
            );

        }

    }


    /*
    ==============================================
    OFFLINE COMPLETE
    ==============================================
    */

    const appointments =
        await offlineGetAll(
            "appointments"
        );


    const existingAppointment =
        appointments.find(
            (item) =>

                String(
                    item.appointment_id
                ) ===
                String(id)

                ||

                String(
                    item.id
                ) ===
                String(id)
        );


    if (!existingAppointment) {

        throw new Error(
            "Appointment not found locally."
        );

    }


    const completedAppointment = {

        ...existingAppointment,

        status:
            "Completed",

        _syncStatus:
            "pending",

        _localOnly:
            existingAppointment._localOnly ||
            false,

        _createdOffline:
            existingAppointment._createdOffline ||
            false,

        _updatedOffline:
            true,

        _updatedAt:
            new Date().toISOString()

    };


    const enrichedAppointment =
        await enrichAppointment(
            completedAppointment
        );


    await offlineUpdate(
        "appointments",
        enrichedAppointment
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
            "appointments",

        recordId:
            existingAppointment.id,

        serverId:
            existingAppointment.appointment_id,

        data: {

            status:
                "Completed"

        }

    });


    return {

        success:
            true,

        offline:
            true,

        appointment:
            enrichedAppointment,

        message:
            "Appointment marked as completed offline. It will synchronize when the connection returns."

    };

};