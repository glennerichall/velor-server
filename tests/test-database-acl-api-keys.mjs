import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {composeApiKeysDataAccess} from "../database/apiKeys.mjs";
import {composeAclDataAccess} from "../database/acl.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('database api key acl', () => {
    let apiKey, rule1, rule2;

    let addAclRuleToApiKey,
        createApiKey,
        getApiKeyAclRulesById;

    let insertAclDenyRule,
        insertAclGrantRule;

    beforeEach(async ({database}) => {
        const {
            client,
            schema,
            clear
        } = database;

        ({
            addAclRuleToApiKey,
            createApiKey,
            getApiKeyAclRulesById
        } = composeApiKeysDataAccess(schema));

        ({
            insertAclDenyRule,
            insertAclGrantRule
        } = composeAclDataAccess(schema));

        await clear();

        rule1 = await insertAclGrantRule(client, {
            name: 'rule1',
            resource: '/foo/bar',
            method: 'GET',
            category: 'cat1',
            description: 'baz qux'
        });

        rule2 = await insertAclDenyRule(client, {
            name: 'rule2',
            resource: '/foo/baz',
            method: 'GET',
            category: 'cat1',
            description: 'biz baz buz'
        });

        let rule3 = await insertAclDenyRule(client, {
            name: 'rule3',
            resource: '/sdfsdfsdf',
            method: 'GET',
            category: 'cat1',
            description: 'rrrrrrrrrrrrrr'
        });

        let name = 'foo-bar';
        apiKey = await createApiKey(client, name);

        await addAclRuleToApiKey(client, apiKey.id, 'rule1')
        await addAclRuleToApiKey(client, apiKey.id, 'rule2')
    })

    it('should assign acl to apikey', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let acl = await getApiKeyAclRulesById(client, apiKey.id);
        expect(acl).to.have.length(2);
        expect(acl.map(x => x.name)).to.include('rule1');
        expect(acl.map(x => x.name)).to.include('rule2');
    })
});