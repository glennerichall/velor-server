import {getLogger} from "velor-services/application/services/services.mjs";
import {cleanFileStore} from "./cleanFileStore.mjs";
import {cleanEntries} from "./cleanEntries.mjs";
import {
    getFileStore
} from "../application/services/services.mjs";
import {STATUS_AVAILABLE} from "velor-dbuser/database/files.mjs";
import {getFileDAO} from "velor-dbuser/application/services/services.mjs";

export class FileManager {

    async createEntry(bucket, file) {
        let entry = await getFileDAO(this).saveOne({
            bucket,
            ...file
        });
        let locationUri = await getFileStore(this).getCreateUri(bucket, entry.bucketname);
        return {
            entry,
            locationUri,
            type: 'write'
        };
    }

    async createFile(bucket, file, data) {
        let entry = await getFileDAO(this).saveOne({
            bucket,
            ...file
        });
        return this.saveFile(entry, data);
    }

    async saveFile(entry, data) {
        await getFileStore(this).createObject(entry.bucket,
            entry.bucketname, data);
        let info = await getFileStore(this).getObjectInfo(entry.bucket, entry.bucketname);
        info.status = STATUS_AVAILABLE;
        entry = await getFileDAO(this).updateOne({
            bucketname: entry.bucketname,
            ...info
        });
        return entry;
    }

    async getReadUri(bucketname) {
        let entry = await getFileDAO(this).loadOne({bucketname});
        let locationUri = await getFileStore(this).getReadUri(entry.bucket, bucketname);
        return {
            entry,
            locationUri,
            type: 'read'
        };
    }

    async deleteFile(bucketname) {
        let entry = await  getFileDAO(this).deleteOne({bucketname});
        await getFileStore(this).deleteObject(entry.bucket, bucketname);
    }

    async readFile(bucketname) {
        let entry = await getFileDAO(this).loadOne({bucketname});
        let stream = await getFileStore(this).getObjectStream(entry.bucket, bucketname);
        return {
            entry, stream
        };
    }

    async cleanFileStore() {
        return cleanFileStore(
            getFileEntries(this),
            getFileStore(this),
            getLogger(this)
        );
    }

    async cleanEntries() {
        return cleanEntries(
            getFileEntries(this),
            getFileStore(this),
            getLogger(this)
        );
    }

    async vacuum() {
        await this.cleanFileStore();
        await this.cleanFileStore();
        // await this.cleanOldFiles();
    }

    // async cleanOldFiles({numDays = 3} = {}) {
    //     getLogger(this).info(`Cleaning database from old files not uploaded since ${numDays} day(s)`);
    //
    //     await getFileEntries(this).transact(async ({deleteOldEntries}) => {
    //         const result = await deleteOldEntries(numDays);
    //         if (result > 0) {
    //             getLogger(this).info(`Deleted ${result} file(s) from database that where not uploaded more than ${numDays} days ago`);
    //         } else {
    //             getLogger(this).info('No file to remove, all clean');
    //         }
    //     });
    // }
    //
    // async processMissedNewFiles({numDays = 3} = {}) {
    //     // process files that were not processed for validation
    //     getLogger(this).info(`Processing files that were not processed for validation since ${numDays} day(s)`);
    //
    //     // Do not run in a transaction as this takes a long time
    //     // and we want every file to be updated in the database
    //     // file by file and not in batch so if it fails somehow
    //     // we do not need to update from beginning.
    //
    //     const {getUnprocessedEntries} = this[kEntries].open();
    //     const entries = await getUnprocessedEntries(numDays);
    //
    //     if (entries.length > 0) {
    //         getLogger(this).info(`Starting process of ${entries.length} pending file(s)`);
    //     } else {
    //         getLogger(this).info(`Not file to process, all clean`);
    //     }
    //
    //     let accepted = [], rejected = [], notFound = [];
    //     let i = 0;
    //     for (let {bucketname} of entries) {
    //         i++;
    //
    //         const {status} = await this.processFile(bucketname);
    //
    //         switch (status) {
    //             case SUCCESS_FILE_PROCESSED:
    //                 accepted.push(bucketname);
    //                 break;
    //             case ERROR_FILE_UPLOAD_FAILED:
    //             case ERROR_FILE_NOT_FOUND:
    //                 notFound.push(bucketname);
    //                 break;
    //             case ERROR_FILE_INFECTED:
    //             case ERROR_FILE_INVALID:
    //                 rejected.push(bucketname);
    //                 break;
    //         }
    //
    //         getLogger(this).info(`(${i}/${entries.length})\t\t${bucketname}\t${status}`);
    //     }
    //
    //     if (entries.length > 0) {
    //         getLogger(this).info(`Processed ${entries.length} file(s) with ${accepted.length} accepted file(s) and ${rejected.length} rejected file(s)`);
    //     }
    // }
    //
    // async _validateFile(entry, file) {
    //     return SUCCESS_FILE_VALIDATED;
    // }
    //
    // async _processFile(entry, file) {
    //     return SUCCESS_FILE_PROCESSED;
    // }
    //
    // async processFile(bucketname) {
    //     const {
    //         deleteEntry, setRejected,
    //         setReady, getEntry
    //     } = this[kEntries].open();
    //
    //     let entry = await getEntry(bucketname);
    //
    //     if (!entry) {
    //         return {
    //             status: ERROR_FILE_NOT_FOUND,
    //             bucketname
    //         };
    //     }
    //
    //     if (entry.status === 'ready' || entry.status === 'rejected') {
    //         return {
    //             status: ERROR_FILE_ALREADY_PROCESSED,
    //             entry
    //         };
    //     }
    //
    //     const file = await this[kStore].getObject(bucketname);
    //
    //     if (file === null) {
    //         await deleteEntry(bucketname);
    //         return {
    //             status: ERROR_FILE_NOT_FOUND,
    //             entry
    //         };
    //     }
    //
    //     let status = await this._validateFile(entry, file);
    //
    //     switch (status) {
    //         case ERROR_FILE_INFECTED:
    //         case ERROR_FILE_INVALID:
    //             await setRejected(bucketname, file.size, file.hash);
    //             return {
    //                 status,
    //                 entry
    //             };
    //     }
    //
    //     status = await this._processFile(entry, file);
    //
    //     // the size and hash may have changed after processing.
    //     const info = await this[kStore].getObjectInfo(bucketname);
    //
    //     if (status === SUCCESS_FILE_PROCESSED) {
    //         await setReady(bucketname, info.size, info.hash);
    //         entry = await getEntry(bucketname);
    //     }
    //
    //     return {
    //         status,
    //         entry
    //     };
    // }

}

