import {
    CopyObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

// Change this value to adjust the signed URL's expiration
const URL_EXPIRATION_SECONDS = 60 * 1; // 1 minutes to upload or download

const kAccesKeyId = Symbol("accesKeyId");
const kSecretAccessKey = Symbol("secretAccessKey");
const kRegion = Symbol("region");
const kS3Client = Symbol("s3Client");

export class AWSFileStore {
    constructor(configs) {
        const {
            accessKeyId,
            secretAccessKey,
            region
        } = configs;

        this[kAccesKeyId] = accessKeyId;
        this[kSecretAccessKey] = secretAccessKey;
        this[kRegion] = region;
    }

    async getCreateUri(Bucket, Key, ContentType) {
        // Get signed URL from S3
        const s3Params = {
            Bucket,
            Key,
            ContentType,
            ACL: 'private'
        };

        // FIXME on a besoin d'un mecanisme de codification des exceptions
        const command = new PutObjectCommand(s3Params);
        const uploadURL = await getSignedUrl(this.getClient(), command, {
            expiresIn: URL_EXPIRATION_SECONDS
        });

        return uploadURL;
    }

    async getReadUri(Bucket, Key, ContentType) {
        const s3Params = {
            Bucket,
            Key,
            ContentType,
            ACL: 'private'
        };
        const command = new GetObjectCommand(s3Params);
        const downloadURL = await getSignedUrl(this.getClient(), command, {
            expiresIn: URL_EXPIRATION_SECONDS
        });

        return downloadURL;
    }

    getClient() {
        if (!this[kS3Client]) {
            // On heroku, setting these values through constructor options
            // does not work.
            // {
            //      accessKeyId: process.env.DEPLOYING_VALUE_AWS_ACCESS_KEY_ID,
            //      secretAccessKey: process.env.DEPLOYING_VALUE_AWS_SECRET_ACCESS_KEY
            // }
            // It is preferable to set it here because it creates a more uniform
            // procedure using ZUPFE_* to set env variables in heroku using a script.
            process.env.AWS_ACCESS_KEY_ID = this[kAccesKeyId];
            process.env.AWS_SECRET_ACCESS_KEY = this[kSecretAccessKey];

            this[kS3Client] = new S3Client(
                {
                    region: this[kRegion]
                });
        }
        return this[kS3Client];
    }

    async createObject(Bucket, Key, Body) {
        const command = new PutObjectCommand({
            Bucket,
            Key,
            Body
        });
        await this.getClient().send(command);
    }

    async getObject(Bucket, Key) {
        try {
            const command = new GetObjectCommand({
                Bucket,
                Key
            });
            const response = await this.getClient().send(command);
            return {
                stream: response.Body,
                size: response.ContentLength,
                hash: JSON.parse(response.ETag),
                creation: response.LastModified
            };
        } catch (e) {
            return null;
        }
    }

    async getObjectInfo(Bucket, Key) {
        const command = new HeadObjectCommand({
            Bucket,
            Key
        });
        const response = await this.getClient().send(command)
        return {
            size: response.ContentLength,
            hash: JSON.parse(response.ETag),
            creation: response.LastModified
        };
    }

    async getObjectStream(Bucket, Key) {
        return this.getObject(Bucket, Key).then(obj => obj?.stream);
    }

    async putObject(Bucket, Key, data, options = {}) {
        const command = new PutObjectCommand({
            Bucket,
            region: this[kRegion],
            Key,
            ContentType: options.contentType,
            Body: data
        });
        await this.getClient().send(command);
    }

    async deleteObject(Bucket, Key) {
        const command = new DeleteObjectCommand({
            Bucket,
            Key
        });
        const response = await this.getClient().send(command)
        return response.Body;
    }

    async deleteObjects(Bucket, keys) {
        const command = new DeleteObjectsCommand(
            {
                Bucket,
                Delete: {
                    Objects: keys.map(Key => {
                        return {Key}
                    })
                }
            }
        );
        await this.getClient().send(command);
    }

    async listObjects(Bucket) {
        let continuationToken;
        let allObjects = [];
        let client = await this.getClient();

        do {
            const command = new ListObjectsV2Command({
                Bucket,
                ContinuationToken: continuationToken,
            });

            const response = await client.send(command);
            const objects = response.Contents.map(x => {
                return {
                    ...x,
                    ETag: x.ETag.replaceAll('\"', '')
                };
            });

            allObjects = allObjects.concat(objects);

            continuationToken = response.NextContinuationToken;
        } while (continuationToken);

        return allObjects;
    }

    async readAll() {
        const list = await this.listObjects();
        return list.map(x => x.Key)
            .map(async Key => {
                const object = await this.getObject(Key);
                return {
                    name: Key,
                    data: object.stream
                };
            });
    }

    async checkObjectExists(Bucket, Key) {
        try {
            const command = new HeadObjectCommand({
                Bucket,
                Key
            });
            await this.getClient().send(command)
            return true;
        } catch (e) {
            if (e.name === 'NotFound') {
                return false;
            } else {
                throw e;
            }
        }
    }

    close() {
        this._s3client?.destroy();
        this._s3client = null;
    }

    async copyObjects(objects, bucket) {
        const client = this.getClient();
        for (let key of objects) {
            const command = new CopyObjectCommand({
                CopySource: `/${bucket}/${key}`,
                Bucket: this[kBucket],
                Key: key,
            });

            try {
                await client.send(command);
            } catch (error) {
                throw error;
            }
        }
    }
}