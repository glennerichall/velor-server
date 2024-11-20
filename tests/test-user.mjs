import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {clearAuths} from "./fixtures/database-clear.mjs";
import {insertAuth} from "../database/auths.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('User', () => {
    const auth = {
        auth_id: "mi@gmail.com",
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
        auth.id = await insertAuth(client, schema, auth);
    })
})