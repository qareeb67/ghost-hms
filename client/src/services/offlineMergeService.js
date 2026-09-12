/*
==================================================
GHOST HMS — OFFLINE MERGE SERVICE
==================================================

Purpose:
- Keep server data visible when online.
- Preserve local pending/offline records in the UI.
- Prefer unsynchronized local changes over stale server copies.
- De-duplicate records by the canonical server ID.

IndexedDB `id` remains a local identity and is never
used as the server identity.
==================================================
*/

const isUnsyncedLocalRecord = (record) => {
    return (
        record?._syncStatus === "pending" ||
        record?._localOnly === true ||
        record?._createdOffline === true ||
        record?._updatedOffline === true
    );
};

const getTimestamp = (record) => {
    const value =
        record?._updatedAt ||
        record?._createdAt ||
        record?._syncedAt ||
        record?.updated_at ||
        record?.created_at;

    if (!value) {
        return 0;
    }

    const timestamp = new Date(value).getTime();

    return Number.isNaN(timestamp)
        ? 0
        : timestamp;
};

const chooseLocalDuplicate = (current, candidate) => {
    if (!current) {
        return candidate;
    }

    const currentUnsynced =
        isUnsyncedLocalRecord(current);

    const candidateUnsynced =
        isUnsyncedLocalRecord(candidate);

    if (
        candidateUnsynced &&
        !currentUnsynced
    ) {
        return candidate;
    }

    if (
        candidateUnsynced === currentUnsynced &&
        getTimestamp(candidate) >= getTimestamp(current)
    ) {
        return candidate;
    }

    return current;
};

export const mergeServerAndLocal = ({
    serverRecords = [],
    localRecords = [],
    serverIdField
}) => {
    const merged = new Map();
    const localOnly = [];
    const duplicateLocalRecords = new Map();

    for (const record of Array.isArray(serverRecords) ? serverRecords : []) {
        if (!record) {
            continue;
        }

        const serverId = record?.[serverIdField];

        if (
            serverId === undefined ||
            serverId === null ||
            serverId === ""
        ) {
            localOnly.push(record);
            continue;
        }

        merged.set(String(serverId), record);
    }

    for (const record of Array.isArray(localRecords) ? localRecords : []) {
        if (!record) {
            continue;
        }

        const serverId = record?.[serverIdField];

        if (
            serverId === undefined ||
            serverId === null ||
            serverId === ""
        ) {
            if (
                isUnsyncedLocalRecord(record)
            ) {
                localOnly.push(record);
            }

            continue;
        }

        const key = String(serverId);
        const current = merged.get(key);

        if (current) {
            if (isUnsyncedLocalRecord(record)) {
                merged.set(key, {
                    ...current,
                    ...record
                });
            }

            const duplicate =
                duplicateLocalRecords.get(key);

            const chosen = chooseLocalDuplicate(
                duplicate,
                record
            );

            duplicateLocalRecords.set(
                key,
                chosen
            );
        } else {
            merged.set(key, record);
        }
    }

    /*
    If multiple local rows share the same server ID,
    prefer the newest unsynchronized row. This keeps the
    UI deterministic even before we clean historical duplicates.
    */
    for (const [key, localRecord] of duplicateLocalRecords) {
        const current = merged.get(key);

        if (
            localRecord &&
            isUnsyncedLocalRecord(localRecord)
        ) {
            merged.set(key, {
                ...(current || {}),
                ...localRecord
            });
        }
    }

    return [
        ...merged.values(),
        ...localOnly
    ];
};

export const dedupeByServerId = (
    records = [],
    serverIdField
) => {
    return mergeServerAndLocal({
        serverRecords: records,
        localRecords: records,
        serverIdField
    });
};
