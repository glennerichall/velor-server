import {Readable} from 'stream';
import crypto from "crypto";

const kStore = Symbol("store");

export class MemoryFileStore {
    constructor() {
        this[kStore] = {};
    }

    clear() {
        this[kStore] = {};
    }

    getObjectInfo(bucketname) {
        return {
            size: this[kStore][bucketname]?.length,
            hash: crypto.createHash('md5').update(this[kStore][bucketname]).digest('hex')
        };
    }

    getCreateUri(bucket, bucketname) {
        return `mem://${bucket}/${bucketname}`;
    }

    async createObject(bucket, Key, Body) {
        this[kStore][Key] = Body;
    }

    async getObject(bucket, Key) {
        const file = this[kStore][Key];
        if (!file) return null;
        const stream = new Readable();
        stream.push(file);
        stream.push(null);
        return {
            stream,
            size: file.length,
            hash: 0,
            creation: new Date().toDateString()
        }
    }

    async getObjectStream(bucket, Key) {
        return this.getObject(bucket, Key).then(obj => obj.stream);
    }

    async deleteObjects(bucket, keys) {
        await Promise.all(keys.map(key => this.deleteObject(key)));
        return true;
    }

    async listObjects(bucket) {
        return Object.values(this[kStore])
            .filter(file => file.bucket === bucket);
    }

    async deleteObject(bucket, Key) {
        delete this[kStore][Key];
    }

    async checkObjectExists(bucket, Key) {
        return this[kStore][Key] !== undefined;
    }

    async close() {
    }
}