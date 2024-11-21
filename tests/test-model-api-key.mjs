import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {
    clearApiKeys,
    clearAuths
} from "./fixtures/database-clear.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {ApiKey} from "../models/ApiKey.mjs";
import {getDataApiKeys} from "../application/services/dataServices.mjs";
import {getAllApiKeys} from "../database/apiKeys.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('ApiKey', () => {
    let services;

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        await clearApiKeys(database);
    })

    async function getApiKeys() {
        return getDataApiKeys(services).getAllApiKeys();
    }

    it('should save api key', async () => {
        let apiKey = getServiceBinder(services).createInstance(ApiKey, {
            name: 'an api key'
        });

        let keys = await getApiKeys();
        expect(keys).to.have.length(0);

        let saved = await apiKey.save();
        expect(saved).to.be.true;

        keys = await getApiKeys();
        expect(keys).to.have.length(1);
        expect(keys[0].name).to.include('an api key');

    })
})