import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {
    clearAcl,
    clearAuths,
    clearRoles
} from "./fixtures/database-clear.mjs";
import {
    addAclRuleToRole,
    createRole
} from "../database/roles.mjs";
import {
    insertAclDenyRule,
    insertAclGrantRule
} from "../database/acl.mjs";
import {insertAuth} from "../database/auths.mjs";
import {
    insertUser,
    getUserAclRulesByUserId,
    revokeUserRoleByProfile,
    getUserRolesByUserId,
    getPrimaryAuthByUserId,
    grantUserRoleByUserId
} from "../database/users.mjs";
import {conformAuth} from "../models/conform/conformAuth.mjs";

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
        profileId: "mi@gmail.com",
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

        rule1 = await insertAclGrantRule(client, schema, {
            name: 'rule1',
            resource: '/foo/bar',
            method: 'GET',
            category: 'cat1',
            description: 'baz qux'
        });

        rule2 = await insertAclDenyRule(client, schema, {
            name: 'rule2',
            resource: '/foo/baz',
            method: 'GET',
            category: 'cat1',
            description: 'biz baz buz'
        });

        role1 = await createRole(client, schema, 'god', 'God mode');
        role2 = await createRole(client, schema, 'power', 'Power user');
        let role3 = await createRole(client, schema, 'normal', 'Lambda user');

        auth.id = await insertAuth(client, schema, auth);
        let {id} = await insertUser(client, schema, auth.id);
        user = conformAuth(await getPrimaryAuthByUserId(client, schema, id));

        await addAclRuleToRole(client, schema, 'god', 'rule1');
        await grantUserRoleByUserId(client, schema, user.id, 'god');
        await grantUserRoleByUserId(client, schema, user.id, 'normal');
    })

    it('should assign role to user', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let roles = await getUserRolesByUserId(client, schema, user.id);

        expect(roles).to.have.length(2);
        expect(roles[0].name).to.eq('god');
        expect(roles[1].name).to.eq('normal');
    })

    it('should assign acl to user', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let acl = await getUserAclRulesByUserId(client, schema, user.id);

        expect(acl).to.have.length(1);
        expect(acl[0].name).to.eq('rule1');
    })

    it('should revoke role from user', async ({database}) => {
        const {
            client,
            schema
        } = database;

        await revokeUserRoleByProfile(client, schema, user.profileId, user.provider, 'god');
        let roles = await getUserRolesByUserId(client, schema, user.id);

        expect(roles).to.have.length(1);
        expect(roles[0].name).to.eq('normal');
    })

})