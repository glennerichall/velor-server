import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {composeRolesDataAccess} from "../database/roles.mjs";
import {composeAclDataAccess} from "../database/acl.mjs";
import {composeAuthsDataAccess} from "../database/auths.mjs";
import {composeUsersDataAccess} from "../database/users.mjs";
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

    let addAclRuleToRole,
        createRole;

    let insertAclDenyRule,
        insertAclGrantRule;

    let insertUser,
        getUserAclRulesByUserId,
        revokeUserRoleByProfile,
        getUserRolesByUserId,
        getPrimaryAuthByUserId,
        grantUserRoleByUserId;

    let insertAuth;

    beforeEach(async ({database}) => {
        const {
            client,
            schema,
            clear
        } = database;

        await clear();

        ({
            addAclRuleToRole,
            createRole
        } = composeRolesDataAccess(schema));

        ({
            insertAclDenyRule,
            insertAclGrantRule
        } = composeAclDataAccess(schema));

        ({
            insertUser,
            getUserAclRulesByUserId,
            revokeUserRoleByProfile,
            getUserRolesByUserId,
            getPrimaryAuthByUserId,
            grantUserRoleByUserId
        } = composeUsersDataAccess(schema));

        ({insertAuth} = composeAuthsDataAccess(schema));

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

        role1 = await createRole(client, 'god', 'God mode');
        role2 = await createRole(client, 'power', 'Power user');
        let role3 = await createRole(client, 'normal', 'Lambda user');

        let {id: authId} = await insertAuth(client, auth);
        let {id} = await insertUser(client, authId);
        user = conformAuth(await getPrimaryAuthByUserId(client, id));

        await addAclRuleToRole(client, 'god', 'rule1');
        await grantUserRoleByUserId(client, user.id, 'god');
        await grantUserRoleByUserId(client, user.id, 'normal');
    })

    it('should assign role to user', async ({database}) => {
        const {
            client,
        } = database;

        let roles = await getUserRolesByUserId(client, user.id);

        expect(roles).to.have.length(2);
        expect(roles[0].name).to.eq('god');
        expect(roles[1].name).to.eq('normal');
    })

    it('should assign acl to user', async ({database}) => {
        const {
            client,
        } = database;

        let acl = await getUserAclRulesByUserId(client, user.id);

        expect(acl).to.have.length(1);
        expect(acl[0].name).to.eq('rule1');
    })

    it('should revoke role from user', async ({database}) => {
        const {
            client,
        } = database;

        await revokeUserRoleByProfile(client, user.profileId, user.provider, 'god');
        let roles = await getUserRolesByUserId(client, user.id);

        expect(roles).to.have.length(1);
        expect(roles[0].name).to.eq('normal');
    })

})