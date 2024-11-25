import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {composeUsersDataAccess,} from "../database/users.mjs";
import {composeAuthsDataAccess} from "../database/auths.mjs";
import {queryRaw} from "velor-database/database/queryRaw.mjs";
import {conformAuth} from "../models/conform/conformAuth.mjs";
import {conformUser} from "../models/conform/conformUser.mjs";
import {composeClearDataAccess} from "./fixtures/database-clear.mjs";
import {getTableNames} from "../installation/defaultTableNames.mjs";
import {composeRolesDataAccess} from "../database/roles.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('database users', () => {
    const auth = {
        profileId: "mi@gmail.com",
        provider: "google.com",
        email: "mi@gmail.com",
        verified: false,
        displayName: "Mi Too",
        lastName: "Too",
        firstName: "Mi",
    };

    let grantUserRoleByUserId,
        getUserRolesByUserId,
        getPrimaryAuthByProfile,
        getPrimaryAuthByUserId,
        insertUser;

    let insertAuth,
        setUserVerifiedEmail;

    let createRole;

    beforeEach(async ({database}) => {
        const {
            client,
            schema,
            clear
        } = database;

        await clear();

        ({
            grantUserRoleByUserId,
            getUserRolesByUserId,
            getPrimaryAuthByProfile,
            getPrimaryAuthByUserId,
            insertUser
        } = composeUsersDataAccess(schema));

        ({
            insertAuth,
            setUserVerifiedEmail
        } = composeAuthsDataAccess(schema));

        ({createRole} = composeRolesDataAccess(schema));

        let {id} = await insertAuth(client, auth);
        auth.id = id;
    })

    it('should create user with auth', async ({database}) => {
        const {
            client,
        } = database;

        let user = await insertUser(client, auth.id);

        expect(user).to.not.be.undefined;
        expect(user).to.not.be.null;
        expect(user.id).to.not.be.undefined;
        expect(user.primary_auth_id).to.eq(auth.id);
    })

    it('should query user by id', async ({database}) => {
        const {
            client,
        } = database;

        let {id} = await insertUser(client, auth.id);

        let user = conformUser(await getPrimaryAuthByUserId(client, id));

        expect(user.id).to.eq(id);
        expect(user.profileId).to.eq(auth.profileId);
        expect(user.provider).to.eq(auth.provider);
        expect(user.email).to.eq(auth.email);
    })

    it('should query user by auth ', async ({database}) => {
        const {
            client,
        } = database;

        let {id} = await insertUser(client, auth.id);

        let user = conformAuth(await getPrimaryAuthByProfile(client, auth.profileId, auth.provider));

        expect(user.id).to.eq(id);
        expect(user.profileId).to.eq(auth.profileId);
        expect(user.provider).to.eq(auth.provider);
        expect(user.email).to.eq(auth.email);
    })

    it('should set verified email', async ({database}) => {
        const {
            client,
        } = database;

        let {id} = await insertUser(client, auth.id);

        await setUserVerifiedEmail(client, id);
        let user = await getPrimaryAuthByUserId(client, id);
        expect(user).to.have.property('verified', true);
    })

    it('should cascade auths delete', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let inserted = await insertUser(client, auth.id);
        await composeClearDataAccess(schema).clearAuths(database);

        const {
            users
        } = getTableNames();

        let found = await queryRaw(client, `select * from ${schema}.${users} where id = $1`, [inserted.id]);
        expect(found).to.have.length(0);
    })

    it('should grand role to user', async ({database}) => {
        const {
            client,
        } = database;

        let role = await createRole(client, {
            name: 'normal',
            description: 'Normal user with limited rights'
        });

        let user = await insertUser(client, auth.id);
        await grantUserRoleByUserId(client, user.id, role.name);

        let roles = await getUserRolesByUserId(client, user.id);
        expect(roles).to.have.length(1);
    })

    it('should fail to grant unknown role', async ({database}) => {
        const {
            client,
        } = database;

        await createRole(client, {
            name: 'normal',
            description: 'Normal user with limited rights'
        });

        let user = await insertUser(client, auth.id);

        let error
        try {
            await grantUserRoleByUserId(client, user.id, 'dummy');
        } catch (e) {
            error = e;
        }

        expect(error).to.be.an.instanceOf(Error);
    })
})