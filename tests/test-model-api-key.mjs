import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {ApiKeyDAO} from "../models/ApiKeyDAO.mjs";
import {
    getDataAcl,
    getDataApiKeys
} from "../application/services/dataServices.mjs";
import {getRuleDAO} from "../application/services/serverServices.mjs";
import {composeApiKeysDataAccess} from "../database/apiKeys.mjs";
import {composeClearDataAccess} from "./fixtures/database-clear.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('ApiKey', () => {
    let services, apiKey, clearApiKeys;

    let getApiKeyAclRulesById;

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        const {schema} = database;
        ({clearApiKeys} = composeClearDataAccess(schema));

        ({getApiKeyAclRulesById} = composeApiKeysDataAccess(schema));

        await clearApiKeys(database);
        apiKey = getServiceBinder(services).createInstance(ApiKeyDAO);
    })

    async function getApiKeys() {
        return getDataApiKeys(services).getAllApiKeys();
    }

    it('should save api key', async () => {
        let keys = await getApiKeys();
        expect(keys).to.have.length(0);

        let saved = await apiKey.saveOne({name: 'an api key'});

        keys = await getApiKeys();
        expect(keys).to.have.length(1);

        expect(saved.privateId).to.not.be.undefined;
        expect(saved.name).to.include('an api key');
        expect(keys[0].name).to.eq(saved.name);
    })

    it('should get api keys', async () => {
        let saved = await apiKey.saveOne({name: 'an api key'});

        let loaded = await apiKey.loadOne({id: saved.id});

        expect(loaded.id).to.eq(saved.id);
        expect(loaded.publicId).to.eq(saved.publicId);
        expect(loaded.name).to.eq(saved.name);
    })

    it('should freeze apiKey', async () => {
        let saved = await apiKey.saveOne({name: 'an api key'});
        expect(Object.isFrozen(saved)).to.be.true;
    })

    it('should add rule to apiKeys', async () => {
        let saved = await apiKey.saveOne({name: 'an api key'});

        let rule1 = await getRuleDAO(services).saveOne({
            name: 'qux',
            category: 'baz',
            permission: 'ALLOW',
            description: 'quiz',
            method: 'POST',
            resource: '/sdfsdfsdf',
        });

        let rule2 = await getRuleDAO(services).saveOne({
            name: 'foo',
            category: 'baz',
            permission: 'DENY',
            description: 'foo bar',
            method: 'POST',
            resource: '/sdfsdfsdf',
        });

        await apiKey.addAclRule(saved, {id: rule1.id});
        await apiKey.addAclRule(saved, {name: rule2.name});

        let rules = await getDataApiKeys(services).getApiKeyAclRulesById(saved.id);
        expect(rules).to.have.length(2);

        expect(rules.map(rule => rule.id)).includes(rule1.id);
        expect(rules.map(rule => rule.id)).includes(rule2.id);

        rules = await getDataAcl(services).getAllAclRules();
        expect(rules).to.have.length(2);
    })

    it('should get acl rules', async () => {
        let saved = await apiKey.saveOne({name: 'an api key'});

        let rule1 = await getRuleDAO(services).saveOne({
            name: 'qux',
            category: 'baz',
            permission: 'ALLOW',
            description: 'quiz',
            method: 'POST',
            resource: '/sdfsdfsdf',
        });

        let rule2 = await getRuleDAO(services).saveOne({
            name: 'foo',
            category: 'baz',
            permission: 'DENY',
            description: 'foo bar',
            method: 'POST',
            resource: '/sdfsdfsdf',
        });

        await apiKey.addAclRule(saved, {id: rule1.id});
        await apiKey.addAclRule(saved, {name: rule2.name});

        let rules = await apiKey.getAclRules({id: saved.id});

        expect(rules).to.have.length(2);
        expect(rules.map(rule => rule.id)).includes(rule1.id);
        expect(rules.map(rule => rule.id)).includes(rule2.id);
    })

    it('should delete api key by public id', async () => {
        let saved = await apiKey.saveOne({name: 'an api key'});
        let loaded = await apiKey.loadOne({id: saved.id});

        expect(loaded.id).to.eq(saved.id);

        await apiKey.deleteOne({
            publicId: saved.publicId,
        });

        loaded = await apiKey.loadOne({id: saved.id});
        expect(loaded).to.be.null;
    })
})