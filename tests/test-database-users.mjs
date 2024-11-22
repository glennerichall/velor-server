import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {clearAuths} from "./fixtures/database-clear.mjs";
import {
    getPrimaryAuthByProfile,
    getPrimaryAuthByUserId,
    insertUser,
} from "../database/users.mjs";
import {
    insertAuth,
    setUserVerifiedEmail
} from "../database/auths.mjs";
import {queryRaw} from "velor-database/database/queryRaw.mjs";
import {conformAuth} from "../models/conform/conformAuth.mjs";
import {conformUser} from "../models/conform/conformUser.mjs";

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
    }

    beforeEach(async ({database}) => {
        const {
            client,
            schema
        } = database;

        await clearAuths(database); // users are cascaded
        let {id} = await insertAuth(client, schema, auth);
        auth.id = id;
    })

    it('should create user with auth', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let user = await insertUser(client, schema, auth.id);

        expect(user).to.not.be.undefined;
        expect(user).to.not.be.null;
        expect(user.id).to.not.be.undefined;
        expect(user.primary_auth_id).to.eq(auth.id);
    })

    it('should query user by id', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let {id} = await insertUser(client, schema, auth.id);

        let user = conformUser(await getPrimaryAuthByUserId(client, schema, id));

        expect(user.id).to.eq(id);
        expect(user.profileId).to.eq(auth.profileId);
        expect(user.provider).to.eq(auth.provider);
        expect(user.email).to.eq(auth.email);
    })

    it('should query user by auth ', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let {id} = await insertUser(client, schema, auth.id);

        let user = conformAuth(await getPrimaryAuthByProfile(client, schema, auth.profileId, auth.provider));

        expect(user.id).to.eq(id);
        expect(user.profileId).to.eq(auth.profileId);
        expect(user.provider).to.eq(auth.provider);
        expect(user.email).to.eq(auth.email);
    })

    it('should set verified email', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let {id} = await insertUser(client, schema, auth.id);

        await setUserVerifiedEmail(client, schema, id);
        let user = await getPrimaryAuthByUserId(client, schema, id);
        expect(user).to.have.property('verified', true);
    })

    it('should cascade auths delete', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let user = await insertUser(client, schema, auth.id);
        await clearAuths(database);

        let found = await queryRaw(client, `select * from ${schema}.users where id = $1`, [user.id]);
        expect(found).to.have.length(0);
    })
})