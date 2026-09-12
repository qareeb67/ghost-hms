import {
    saveRecord,
    getRecords,
    getRecord,
    updateRecord,
    deleteRecord,
    upsertByServerId,
    findByServerId
} from "../data/storage";

import {
    captureLocalRelations
} from "./offlineDataService";


/*
==================================================
BASIC OFFLINE STORAGE
==================================================

This service is intentionally responsible ONLY
for interacting with local IndexedDB storage.

Synchronization policy belongs to:

syncQueueService.js
syncEngine.js

==================================================
*/


/*
==================================================
GET ALL RECORDS
==================================================
*/

export const offlineGetAll = async (
    storeName
) => {

    return getRecords(
        storeName
    );

};


/*
==================================================
GET ONE RECORD
==================================================
*/

export const offlineGetOne = async (
    storeName,
    id
) => {

    return getRecord(
        storeName,
        id
    );

};


/*
==================================================
CREATE RECORD
==================================================
*/

export const offlineCreate = async (
    storeName,
    record
) => {

    const preparedRecord =
        await captureLocalRelations(record);

    return saveRecord(
        storeName,
        preparedRecord
    );

};


/*
==================================================
UPDATE RECORD
==================================================
*/

export const offlineUpdate = async (
    storeName,
    record
) => {

    return updateRecord(
        storeName,
        record
    );

};


/*
==================================================
DELETE RECORD
==================================================
*/

export const offlineDelete = async (
    storeName,
    id
) => {

    return deleteRecord(
        storeName,
        id
    );

};


/*
==================================================
UPSERT RECORD BY SERVER ID
==================================================
*/

export const offlineUpsert = async (
    storeName,
    record
) => {

    return upsertByServerId(
        storeName,
        record
    );

};


/*
==================================================
FIND RECORD BY SERVER ID
==================================================
*/

export const offlineFindByServerId = async (
    storeName,
    serverId
) => {

    return findByServerId(
        storeName,
        serverId
    );

};