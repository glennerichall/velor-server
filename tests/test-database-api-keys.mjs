import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {composeApiKeysDataAccess} from "../database/apiKeys.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('database api keys', () => {
    const auth = {
        auth_id: "mi@gmail.com",
        provider: "google.com",
        email: "mi@gmail.com",
        verified: true,
        displayName: "Mi Too",
        lastName: "Too",
        firstName: "Mi",
    };

    let createApiKey,
        deleteApiKeyByPublicId,
        getApiKeyByValue;

    beforeEach(async ({database}) => {
        let {schema} = database;
        ({
            createApiKey,
            getApiKeyByValue,
            deleteApiKeyByPublicId
        } = composeApiKeysDataAccess(schema));
    })

    it('should create api key', async ({database}) => {
        const {
            client,
        } = database;

        let name = 'foo-bar';
        let apiKey = await createApiKey(client, name);

        expect(apiKey).to.have.property('name', 'foo-bar');
        expect(apiKey.api_key.substring(37)).to.eq(apiKey.public_id);

        let found = await getApiKeyByValue(client, apiKey.api_key);
        expect(found.name).to.eq(name);
    })

    it('should create api key with no name', async ({database}) => {
        const {
            client,
        } = database;

        let apiKey = await createApiKey(client);

        expect(apiKey).to.have.property('name', apiKey.raw_uuid.substring(0, 3) +
            "..." + apiKey.raw_uuid.substring(apiKey.raw_uuid.length - 2));
    })

    it('should delete api key', async ({database}) => {
        const {
            client,
        } = database;

        let apiKey = await createApiKey(client);

        let found = await getApiKeyByValue(client, apiKey.api_key);
        expect(found.id).to.eq(apiKey.id);

        await deleteApiKeyByPublicId(client, apiKey.publicId)

        found = await getApiKeyByValue(client, apiKey.api_key);
        expect(found).to.not.be.null;

    })
})