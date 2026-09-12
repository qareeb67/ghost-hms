/*
==================================================
GHOST HMS OFFLINE DATA HELPERS
==================================================

Shared helpers for:
1. Merging server data with local pending data.
2. Capturing local foreign-key references before
   an offline record is written.
3. Resolving those references after parent records
   receive real server IDs.

This module contains no network calls.
==================================================
*/

import { getRecords } from "../data/storage";


const RELATION_DEFINITIONS = {
    patient_id: {
        storeName: "patients",
        idField: "patient_id"
    },

    doctor_id: {
        storeName: "doctors",
        idField: "doctor_id"
    },

    appointment_id: {
        storeName: "appointments",
        idField: "appointment_id"
    },

    medical_record_id: {
        storeName: "medical_records",
        idField: "record_id"
    },

    record_id: {
        storeName: "medical_records",
        idField: "record_id"
    },

    assigned_doctor: {
        storeName: "doctors",
        idField: "doctor_id"
    },

    test_id: {
        storeName: "laboratory",
        idField: "test_id"
    },

    bill_id: {
        storeName: "billing",
        idField: "bill_id"
    },

    medicine_id: {
        storeName: "medicines",
        idField: "medicine_id"
    },

    prescription_id: {
        storeName: "prescriptions",
        idField: "prescription_id"
    },

    emergency_id: {
        storeName: "emergency",
        idField: "emergency_id"
    }
};


const hasValue = (value) => {
    return !(
        value === undefined ||
        value === null ||
        value === ""
    );
};


const findReferencedRecord = async (
    definition,
    value
) => {
    if (!hasValue(value)) {
        return null;
    }

    const records = await getRecords(
        definition.storeName
    );

    /*
    Prefer an exact server-ID match. This protects
    already-synchronized online records from being
    mistaken for local IDs.
    */
    const byServerId = records.find(
        (record) =>
            hasValue(record?.[definition.idField]) &&
            String(record[definition.idField]) ===
                String(value)
    );

    if (byServerId) {
        return byServerId;
    }

    const byLocalId = records.find(
        (record) =>
            hasValue(record?.id) &&
            String(record.id) ===
                String(value)
    );

    return byLocalId || null;
};


export const captureLocalRelations = async (
    record
) => {
    if (!record || typeof record !== "object") {
        return record;
    }

    const relations = {
        ...(record._localRelations || {})
    };

    for (const [field, definition] of Object.entries(
        RELATION_DEFINITIONS
    )) {
        if (!hasValue(record[field])) {
            continue;
        }

        if (relations[field]) {
            continue;
        }

        const referencedRecord =
            await findReferencedRecord(
                definition,
                record[field]
            );

        if (!referencedRecord) {
            continue;
        }

        relations[field] = {
            storeName: definition.storeName,
            idField: definition.idField,
            localId: referencedRecord.id,
            serverId:
                referencedRecord[definition.idField] ?? null
        };
    }

    if (Object.keys(relations).length === 0) {
        return record;
    }

    return {
        ...record,
        _localRelations: relations
    };
};


export const resolveLocalRelations = async (
    record
) => {
    if (!record || typeof record !== "object") {
        return {
            payload: record || {},
            unresolved: []
        };
    }

    const payload = {
        ...record
    };

    const relations =
        record._localRelations || {};

    const unresolved = [];

    for (const [field, relation] of Object.entries(
        relations
    )) {
        if (!relation?.storeName) {
            continue;
        }

        const records = await getRecords(
            relation.storeName
        );

        const referencedRecord = records.find(
            (item) =>
                String(item?.id) ===
                String(relation.localId)
        );

        if (!referencedRecord) {
            unresolved.push({
                field,
                reason: "referenced local record not found"
            });
            continue;
        }

        const serverId =
            referencedRecord?.[relation.idField];

        if (!hasValue(serverId)) {
            unresolved.push({
                field,
                reason: "referenced record has no server ID yet"
            });
            continue;
        }

        payload[field] = serverId;
    }

    delete payload._localRelations;

    return {
        payload,
        unresolved
    };
};


export const mergeServerWithLocal = async (
    storeName,
    serverRecords,
    idField
) => {

    const source = Array.isArray(serverRecords) ? serverRecords : [];
    const localRecords = await getRecords(storeName);

    const normalize = (record) => {
        if (!record || typeof record !== "object") {
            return record;
        }

        if (storeName === "medical_records") {
            const serverId =
                record.record_id ??
                record.medical_record_id ??
                null;

            return {
                ...record,
                record_id: serverId
            };
        }

        return record;
    };

    const normalizedServer = source.map(normalize);

    const serverById = new Map();
    const merged = [];

    for (const record of normalizedServer) {
        const serverId = record?.[idField] ??
            (storeName === "medical_records" ? record?.record_id : null);

        if (!hasValue(serverId)) {
            merged.push({
                ...record,
                _syncStatus: "synced",
                _localOnly: false
            });
            continue;
        }

        const key = String(serverId);
        if (serverById.has(key)) {
            continue;
        }

        const clean = {
            ...record,
            [idField]: serverId,
            _syncStatus: "synced",
            _localOnly: false,
            _createdOffline: false,
            _updatedOffline: false
        };

        serverById.set(key, clean);
        merged.push(clean);
    }

    const appendedLocalKeys = new Set();

    for (const rawLocal of localRecords) {
        const localRecord = normalize(rawLocal);
        const serverId = localRecord?.[idField] ??
            (storeName === "medical_records" ? localRecord?.record_id : null);

        const isPending =
            localRecord?._syncStatus === "pending" ||
            localRecord?._localOnly === true ||
            localRecord?._updatedOffline === true ||
            localRecord?._createdOffline === true;

        if (hasValue(serverId)) {
            const key = String(serverId);
            if (serverById.has(key)) {
                continue;
            }
            if (isPending && !appendedLocalKeys.has(key)) {
                merged.push(localRecord);
                appendedLocalKeys.add(key);
            }
            continue;
        }

        if (isPending) {
            const localKey = `${storeName}:${localRecord?.id ?? "unknown"}`;
            if (!appendedLocalKeys.has(localKey)) {
                merged.push(localRecord);
                appendedLocalKeys.add(localKey);
            }
        }
    }

    return merged;
};
