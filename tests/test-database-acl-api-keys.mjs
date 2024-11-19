import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {
    clearAcl,
    clearApiKeys
} from "./fixtures/database-clear.mjs";
import {
    grantAuthorization,
    insertApiKey
} from "../database/apiKeys.mjs";
import {
    createAclRuleDeny,
    createAclRuleGrant,
    queryAclForApiKey
} from "../database/acl.mjs";

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

    beforeEach(async ({database}) => {
        const {
            client,
            schema
        } = database;

        await clearAcl(database);
        await clearApiKeys(database);

        rule1 = await createAclRuleGrant(client, schema, {
            name: 'rule1',
            resource: '/foo/bar',
            method: 'GET',
            category: 'cat1',
            description: 'baz qux'
        });

        rule2 = await createAclRuleDeny(client, schema, {
            name: 'rule2',
            resource: '/foo/baz',
            method: 'GET',
            category: 'cat1',
            description: 'biz baz buz'
        });

        let rule3 = await createAclRuleDeny(client, schema, {
            name: 'rule3',
            resource: '/sdfsdfsdf',
            method: 'GET',
            category: 'cat1',
            description: 'rrrrrrrrrrrrrr'
        });

        let name = 'foo-bar';
        apiKey = await insertApiKey(client, schema, name);

        await grantAuthorization(client, schema, apiKey.id, 'rule1', 'rule2')
    })

    it('should assign acl to apikey', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let acl = await queryAclForApiKey(client, schema, apiKey.api_key);
        expect(acl).to.have.length(2);
        expect(acl.map(x => x.name)).to.include('rule1');
        expect(acl.map(x => x.name)).to.include('rule2');
    })
});