import {getLogger} from "velor-services/application/services/services.mjs";

export async function cleanStoreForBucket(bucket, bucketnames, store, logger = getLogger()) {
    let files = await store.listObjects(bucket);

    if (files.length > 0) {
        logger.info(`${files.length} file(s) in store for bucket ${bucket}`);
    } else {
        logger.info(`No file in store for bucket ${bucket}`);
    }

    // find bucket files not in entries
    const toRemove = [];
    for (let file of files) {
        if (!bucketnames.includes(file)) {
            toRemove.push(file);
        }
    }

    // remove them from file store
    if (toRemove.length > 0) {
        logger.info(`Removing ${toRemove.length} file(s) from store for bucket ${bucket}`)

        const ok = await store.deleteObjects(bucket, toRemove);
        if (!ok) {
            logger.error(`Unable to remove ${toRemove.length} file(s) from store for bucket ${bucket}`);
        }
    } else {
        logger.info(`No file to remove, all clean`);
    }
}

export async function cleanFileStore(entries, store, logger = getLogger()) {
    logger.info(`Removing files from file store not in entries`);

    logger.info('Getting all files from entries');
    const allEntries = await entries.getEntries();
    const bucketnames = entries.map(x => x.bucketname);

    if (allEntries.length > 0) {
        getLogger(this).info(`${bucketnames.length} file(s) in entries`);
    } else {
        getLogger(this).info('No file in entries, removing all files from store');
    }

    logger.info('Getting bucket list');
    let buckets = await entries.getBuckets();

    let promises = [];
    for (let bucket of buckets) {
        promises.push(cleanStoreForBucket(bucket, bucketnames, store, logger));
    }
    await Promise.all(promises);
}