import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {
    clearAcl,
    clearAuths,
    clearRoles
} from "./fixtures/database-clear.mjs";
import {
    assignRoleAcl,
    insertRole,
    queryRolesForUser
} from "../database/roles.mjs";
import {
    createAclRuleDeny,
    createAclRuleGrant,
    queryAclForUser
} from "../database/acl.mjs";
import {insertAuth} from "../database/auths.mjs";
import {
    grantUserRole,
    insertUser,
    queryForUserById,
    revokeUserRole
} from "../database/users.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('database user acl', () => {
    const auth = {
        auth_id: "mi@gmail.com",
        provider: "google.com",
        email: "mi@gmail.com",
        verified: false,
        displayName: "Mi Too",
        lastName: "Too",
        firstName: "Mi",
    };
    let rule1, rule2, role1, role2, user;

    beforeEach(async ({database}) => {
        const {
            client,
            schema
        } = database;

        await clearAcl(database);
        await clearRoles(database);
        await clearAuths(database); // users are cascaded

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

        role1 = await insertRole(client, schema, 'god', 'God mode');
        role2 = await insertRole(client, schema, 'power', 'Power user');
        let role3 = await insertRole(client, schema, 'normal', 'Lambda user');

        auth.id = await insertAuth(client, schema, auth);
        let {id} = await insertUser(client, schema, auth);
        user = await queryForUserById(client, schema, id);

        await assignRoleAcl(client, schema, 'god', 'rule1');
        await grantUserRole(client, schema, user.id, 'god');
        await grantUserRole(client, schema, user.id, 'normal');
    })

    it('should assign role to user', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let roles = await queryRolesForUser(client, schema, user.id);

        expect(roles).to.have.length(2);
        expect(roles[0].name).to.eq('god');
        expect(roles[1].name).to.eq('normal');
    })

    it('should assign acl to user', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let acl = await queryAclForUser(client, schema, user.id);

        expect(acl).to.have.length(1);
        expect(acl[0].name).to.eq('rule1');
    })

    it('should revoke role from user', async ({database}) => {
        const {
            client,
            schema
        } = database;

        await revokeUserRole(client, schema, user.auth_id, user.provider, 'god');
        let roles = await queryRolesForUser(client, schema, user.id);

        expect(roles).to.have.length(1);
        expect(roles[0].name).to.eq('normal');
    })

})