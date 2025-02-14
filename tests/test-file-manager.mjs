import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getFileManager} from "../application/services/services.mjs";
import {getEnvValue} from "velor-services/application/services/baseServices.mjs";
import {getCrypto} from "velor-utils/utils/platform.mjs";
import {streamToString} from "velor-utils/utils/string.mjs";
import {STATUS_AVAILABLE} from "velor-dbuser/database/files.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('FileManager', () => {

    let fileEntry, data, file, bucket, fileManager;

    beforeEach(async ({services, assets}) => {
        bucket = getEnvValue(services, 'TEST_BUCKET');

        data = assets['test-file.txt'];
        file = {
            filename: 'test-file.txt'
        };

        fileManager = getFileManager(services);

        fileEntry = await fileManager.createFile(
            bucket,
            file,
            data
        );
    })

    it('should create file', async ({services, assets}) => {
        expect(fileEntry).to.have.property('status', STATUS_AVAILABLE);
        expect(fileEntry).to.have.property('size', 26);
        expect(fileEntry).to.have.property('creation');
        expect(fileEntry).to.have.property('hash', (await getCrypto()).md5(data));
        expect(fileEntry).to.have.property('filename', file.filename);
    })

    it('should read file', async ({services, assets}) => {
        let {bucketname} = fileEntry;

        let {entry, stream} = await fileManager.readFile(bucketname);
        expect(stream).to.not.be.undefined;
        let content = await streamToString(stream);
        expect(content).to.eq(data);

        expect(entry.bucketname).to.eq(bucketname);
        expect(entry.bucket).to.eq(bucket);
        expect(entry.filename).to.eq(file.filename);
        expect(entry.status).to.eq(STATUS_AVAILABLE);
    })

    it('should get location uri', async ({services, assets}) => {

        let {entry, locationUri, type} = await fileManager.createEntry(bucket);

        expect(type).to.eq('write');
        expect(locationUri.startsWith(
            `https://s3.ca-central-1.amazonaws.com/${bucket}/${entry.bucketname}`))
            .to.be.true;
    })

    it('should not create entry if already available', async ({services, assets}) => {
        const fileManager = getFileManager(services);
        let {bucketname} = fileEntry;
        await expect(fileManager.createEntry(bucket, {bucketname})).to.eventually.be.rejected;
    })

    it('should not create file if already available', async ({services, assets}) => {
         let {bucketname} = fileEntry;
        await expect(fileManager.createFile(bucket, {bucketname})).to.eventually.be.rejected;
    })

    it('should get read uri', async ({services, assets}) => {
        let {bucketname} = fileEntry;

        let {
            locationUri,
            type
        } = await fileManager.getReadUri(bucketname);

        expect(type).to.eq('read');
        expect(locationUri.startsWith(`https://s3.ca-central-1.amazonaws.com/${bucket}/${bucketname}`)).to.be.true;
        let content = await fetch(locationUri);
        expect(await content.text()).to.eq(data);
    })

    it('should not get read uri of file does not exists', async ({services, assets}) => {
        await expect(fileManager.getReadUri('toto')).to.eventually.be.rejected;
    })
})
