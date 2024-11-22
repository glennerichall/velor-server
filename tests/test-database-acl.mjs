import {
    ACL_DENY,
    ACL_GRANT,
    composeAclDataAccess,
} from "../database/acl.mjs";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";

const {
    expect,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('database acl', () => {
    let statements;
    let insertAclGrantRule;
    let insertAclDenyRule;
    let getAllAclRules;

    beforeEach(async ({database}) => {
        const {schema, clear} = database;

        await clear();
        statements = composeAclDataAccess(schema);

        ({
            insertAclGrantRule,
            insertAclDenyRule,
            getAllAclRules,
        } = statements);
    })

    it('should query all acl', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let rule1 = await insertAclGrantRule(client, {
            name: 'rule1',
            resource: '/foo/bar',
            method: 'GET',
            category: 'cat1',
            description: 'baz qux'
        });

        let rule2 = await insertAclDenyRule(client, {
            name: 'rule2',
            resource: '/foo/baz',
            method: 'GET',
            category: 'cat1',
            description: 'biz baz buz'
        });


        const acl = await getAllAclRules(client);
        expect(acl).to.have.length(2);

        expect(acl[0]).to.have.property('name', 'rule1');
        expect(acl[0]).to.have.property('permission', ACL_GRANT);

        expect(acl[1]).to.have.property('name', 'rule2');
        expect(acl[1]).to.have.property('permission', ACL_DENY);

    })
})