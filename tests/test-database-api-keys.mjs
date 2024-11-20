import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {
    createApiKey,
    getApiKeyByValue
} from "../database/apiKeys.mjs";

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
    }
    
    it('should create api key', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let name = 'foo-bar';
        let apiKey = await createApiKey(client, schema, name);

        expect(apiKey).to.have.property('name', 'foo-bar');
        expect(apiKey.api_key.substring(37)).to.eq(apiKey.public_id);

        let found = await getApiKeyByValue(client, schema, apiKey.api_key);
        expect(found.name).to.eq(name);
    })

    it('should create api key with no name', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let apiKey = await createApiKey(client, schema);

        expect(apiKey).to.have.property('name', apiKey.raw_uuid.substring(0, 3) +
        "..." + apiKey.raw_uuid.substring(apiKey.raw_uuid.length - 2));
    })
})