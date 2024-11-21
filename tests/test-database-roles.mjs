import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {clearRoles} from "./fixtures/database-clear.mjs";
import {
    createRole,
    getAllRoles
} from "../database/roles.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('database roles', () => {
    beforeEach(async ({database}) => {
        const {
            client,
            schema
        } = database;

        await clearRoles(database);

        await createRole(client, schema, 'god', 'God mode');
        await createRole(client, schema, 'power', 'Power user');
    })

    it('should create role', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let roles = await getAllRoles(client, schema);

        expect(roles).to.have.length(2);

        expect(roles[0]).to.have.property('name', 'god');
        expect(roles[0]).to.have.property('description', 'God mode');
    })

    it('should not create duplicate roles', async ({database}) => {
        const {
            client,
            schema
        } = database;

        let error;
        try {
            await createRole(client, schema, 'god', 'There is only one');
        } catch (e) {
            error = e;
        }
        expect(error).to.be.an.instanceOf(Error);
    })
});