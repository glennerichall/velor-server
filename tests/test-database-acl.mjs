import {
    ACL_DENY,
    ACL_GRANT,
    createAclRuleDeny,
    createAclRuleGrant,
    queryForAllAcl
} from "../database/acl.mjs";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {clearAcl} from "./fixtures/database-clear.mjs";

const {
    expect,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('database acl', () => {

    beforeEach(async ({database}) => {
        await clearAcl(database);
    })

    it('should query all acl', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let rule1 = await createAclRuleGrant(client, schema, {
            name: 'rule1',
            resource: '/foo/bar',
            method: 'GET',
            category: 'cat1',
            description: 'baz qux'
        });

        let rule2 = await createAclRuleDeny(client, schema, {
            name: 'rule2',
            resource: '/foo/baz',
            method: 'GET',
            category: 'cat1',
            description: 'biz baz buz'
        });


        const acl = await queryForAllAcl(client, schema);
        expect(acl).to.have.length(2);

        expect(acl[0]).to.have.property('name', 'rule1');
        expect(acl[0]).to.have.property('permission', ACL_GRANT);

        expect(acl[1]).to.have.property('name', 'rule2');
        expect(acl[1]).to.have.property('permission', ACL_DENY);

    })
})