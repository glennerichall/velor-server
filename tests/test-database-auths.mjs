import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {
    insertAuth,
    queryAuthById,
    queryByAuthIdProvider
} from "../database/auths.mjs";
import {clearAuths} from "./fixtures/database-clear.mjs";

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
        auth_id: "mi@gmail.com",
        provider: "google.com",
        email: "mi@gmail.com",
        verified: true,
        displayName: "Mi Too",
        lastName: "Too",
        firstName: "Mi",
    }

    beforeEach(async ({database}) => {
        await clearAuths(database);
    })

    it('should create auth', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let id = await insertAuth(client, schema, auth);
        expect(id).to.not.be.undefined;
    })

    it('should query auth by id', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let id = await insertAuth(client, schema, auth);
        let found = await queryAuthById(client, schema, id);
        expect(found).to.have.property('id', id);
        expect(found).to.have.property('auth_id', auth.auth_id);
        expect(found).to.have.property('provider', auth.provider);
    })

    it('should query auth by auth_id and provider', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let id = await insertAuth(client, schema, auth);
        let found = await queryByAuthIdProvider(client, schema, auth.auth_id, auth.provider);

        expect(found).to.have.property('id', id);
        expect(found).to.have.property('auth_id', auth.auth_id);
        expect(found).to.have.property('provider', auth.provider);
    })

    it('should have unique (auth_id, provider) pair', async ({database}) => {
        const {
            client,
            schema
        } = database;

        await insertAuth(client, schema, auth);
        let error;
        try {
            await insertAuth(client, schema, auth);
        } catch (e) {
            error = e;
        }
        expect(error).to.be.an.instanceOf(Error);

        // also validate other pairs
        await insertAuth(client, schema, {
            ...auth,
            provider: 'gigles.com'
        });

        await insertAuth(client, schema, {
            ...auth,
            auth_id: 'Yu@gmail.com'
        });
    })
})