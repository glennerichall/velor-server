import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {composeAuthsDataAccess} from "../database/auths.mjs";
import {conformAuth} from "../models/conform/conformAuth.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('database auths', () => {
    const auth = {
        profileId: "mi@gmail.com",
        provider: "google.com",
        email: "mi@gmail.com",
        verified: true,
        displayName: "Mi Too",
        lastName: "Too",
        firstName: "Mi",
    };

    let insertAuth,
        getAuthById,
        getAuthByProvider;

    beforeEach(async ({database}) => {
        const {schema, clear} = database;

        await clear();

        ({
            insertAuth,
            getAuthById,
            getAuthByProvider
        } = composeAuthsDataAccess(schema));
    })

    it('should create auth', async ({database}) => {
        const {
            client,
        } = database;

        let id = await insertAuth(client, auth);
        expect(id).to.not.be.undefined;
    })

    it('should query auth by id', async ({database}) => {
        const {
            client,
        } = database;

        let {id} = await insertAuth(client, auth);
        let found = conformAuth(await getAuthById(client, id));
        expect(found).to.have.property('id', id);
        expect(found).to.have.property('profileId', auth.profileId);
        expect(found).to.have.property('provider', auth.provider);
    })

    it('should query auth by auth_id and provider', async ({database}) => {
        const {
            client
        } = database;

        let {id} = await insertAuth(client, auth);
        let found = conformAuth(await getAuthByProvider(client, auth.profileId, auth.provider));

        expect(found).to.have.property('id', id);
        expect(found).to.have.property('profileId', auth.profileId);
        expect(found).to.have.property('provider', auth.provider);
    })

    it('should have unique (auth_id, provider) pair', async ({database}) => {
        const {
            client,
        } = database;

        await insertAuth(client, auth);
        let error;
        try {
            await insertAuth(client, auth);
        } catch (e) {
            error = e;
        }
        expect(error).to.be.an.instanceOf(Error);

        // also validate other pairs
        await insertAuth(client, {
            ...auth,
            provider: 'gigles.com'
        });

        await insertAuth(client, {
            ...auth,
            profileId: 'Yu@gmail.com'
        });
    })
})