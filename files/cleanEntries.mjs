import {getLogger} from "velor-services/application/services/services.mjs";

export async function cleanEntriesForBucket(bucket, store, entries, logger = getLogger()) {
    logger.info('Listing files from store');

    const bucketnames = await store.listObjects(bucket);

    let result;

    // remove database files not in store bucket
    if (bucketnames.length === 0) {
        logger.info(`No files in store for bucket ${bucket}, purging all files from entries with bucket ${bucket}`);
        result = await entries.deleteAllEntries();
    } else {
        result = await keepEntries(bucketnames);
    }

    if (result > 0) {
        logger.info(`Removed ${result} files from entries`);
    } else {
        logger.info(`No entry to remove for bucket ${bucket}`);
    }
}

export async function cleanEntries(entries, store, logger = getLogger()) {
    logger.info('Cleaning entries for files not in store');

    logger.info('Getting bucket list');
    let buckets = await entries.getBuckets();

    let promises = [];
    for (let bucket of buckets) {
        promises.push(cleanEntriesForBucket(bucket, store, logger));
    }
    await Promise.all(promises);
}