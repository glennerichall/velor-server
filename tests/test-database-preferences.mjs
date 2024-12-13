import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {composePreferencesDataAccess} from "../database/preferences.mjs";
import {composeUsersDataAccess} from "../database/users.mjs";
import {composeAuthsDataAccess} from "../database/auths.mjs";
import {conformAuth} from "../models/conform/conformAuth.mjs";
import {conformPreference} from "../models/conform/conformPreference.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('database roles', () => {
    let deletePreferenceByName,
        getPreferenceByName,
        getPreferencesByUserId,
        getPreferenceById,
        upsertPreference;

    let insertUser,
        getUserAclRulesByUserId,
        revokeUserRoleByProfile,
        getUserRolesByUserId,
        getPrimaryAuthByUserId,
        grantUserRoleByUserId;

    let insertAuth;
    let user;

    const auth = {
        profileId: "mi@gmail.com",
        provider: "google.com",
        email: "mi@gmail.com",
        verified: false,
        displayName: "Mi Too",
        lastName: "Too",
        firstName: "Mi",
    };

    beforeEach(async ({database}) => {
        const {
            client,
            schema,
            clear
        } = database;

        await clear();

        ({
            deletePreferenceByName,
            getPreferenceByName,
            getPreferencesByUserId,
            getPreferenceById,
            upsertPreference
        } = composePreferencesDataAccess(schema));

        ({
            insertUser,
            getUserAclRulesByUserId,
            revokeUserRoleByProfile,
            getUserRolesByUserId,
            getPrimaryAuthByUserId,
            grantUserRoleByUserId
        } = composeUsersDataAccess(schema));

        ({insertAuth} = composeAuthsDataAccess(schema));

        let {id: authId} = await insertAuth(client, auth);
        let {id} = await insertUser(client, authId);
        user = conformAuth(await getPrimaryAuthByUserId(client, id));

    })

    it('should not create null preference', async ({database}) => {
        let {client} = database;
        expect(upsertPreference(client)).to.eventually.be.rejected;
    })

    it('should create preference', async ({database}) => {
        let {client} = database;
        let name = 'my-pref';
        let value = {
            val1: 'bcdef',
            prop2: 10
        };
        let preference = await upsertPreference(client, user.id, name, value);

        preference = conformPreference(preference);

        expect(preference).to.not.be.undefined;

        expect(preference.value).to.deep.equal(value);
        expect(preference.name).to.eq(name);
        expect(preference.userId).to.eq(user.id);
    })

    it('should update preference', async ({database}) => {
        let {client} = database;
        let name = 'my-pref';
        let value = {
            val1: 'bcdef',
            prop2: 10
        };
        let original = await upsertPreference(client, user.id, name, value);
        let modified = await upsertPreference(client, user.id, name, {
            val1: 'dooglas'
        });

        expect(modified.value.val1).to.eq('dooglas');
        expect(modified.value.prop2).to.be.undefined;

        let loaded = await getPreferenceById(client, original.id);
        expect(loaded.value.val1).to.eq('dooglas');
    })

    it('should get preference by id', async ({database}) => {
        let {client} = database;
        let name = 'my-pref';
        let value = {
            val1: 'bcdef',
            prop2: 10
        };
        let preference = await upsertPreference(client, user.id, name, value);
        preference = conformPreference(preference);

        let loaded = await getPreferenceById(client, preference.id);

        loaded = conformPreference(loaded);
        expect(loaded).deep.equal(preference);
    })

    it('should get preferences by user id', async ({database}) => {
        let {client} = database;
        let name1 = 'my-pref';
        let value1 = {
            val1: 'bcdef',
            prop2: 10
        };
        let name2 = 'another-pref';
        let value2 = {
            value: 'a string'
        };

        let preference1 = await upsertPreference(client, user.id, name1, value1);
        let preference2 = await upsertPreference(client, user.id, name2, value2);
        preference1 = conformPreference(preference1);
        preference2 = conformPreference(preference2);

        let loaded = await getPreferencesByUserId(client, user.id);

        expect(loaded).to.have.length(2);

        expect(conformPreference(loaded[0])).deep.equal(preference1);
        expect(conformPreference(loaded[1])).deep.equal(preference2);
    })


    it('should get preference by user id and preference name', async ({database}) => {
        let {client} = database;
        let name1 = 'my-pref';
        let value1 = {
            val1: 'bcdef',
            prop2: 10
        };
        let name2 = 'another-pref';
        let value2 = {
            value: 'a string'
        };

        let preference1 = await upsertPreference(client, user.id, name1, value1);
        let preference2 = await upsertPreference(client, user.id, name2, value2);
        preference1 = conformPreference(preference1);
        preference2 = conformPreference(preference2);

        let loaded = await getPreferenceByName(client, user.id, name2);

        expect(conformPreference(loaded)).deep.equal(preference2);
    })

    it('should delete preference by user id and preference name', async ({database}) => {
        let {client} = database;
        let name1 = 'my-pref';
        let value1 = {
            val1: 'bcdef',
            prop2: 10
        };
        let name2 = 'another-pref';
        let value2 = {
            value: 'a string'
        };

        let preference1 = await upsertPreference(client, user.id, name1, value1);
        let preference2 = await upsertPreference(client, user.id, name2, value2);
        preference1 = conformPreference(preference1);
        preference2 = conformPreference(preference2);

        let deleted = await deletePreferenceByName(client, user.id, name2);

        expect(conformPreference(deleted)).deep.equal(preference2);

        let loaded = await getPreferencesByUserId(client, user.id);
        expect(loaded).to.have.length(1);
    })

    it('should not create preference for unknown user', async ({database}) => {
        let {client} = database;
        let name1 = 'my-pref';
        let value1 = {
            val1: 'bcdef',
            prop2: 10
        };
        expect(upsertPreference(client, 666, name1, value1)).to.eventually.be.rejected;
    })

})