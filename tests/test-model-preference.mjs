import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {
    getAuthDAO,
    getRoleDAO,
    getUserDAO
} from "../application/services/serverServices.mjs";
import {composeClearDataAccess} from "./fixtures/database-clear.mjs";
import {PreferenceDAO} from "../models/PreferenceDAO.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('Preferences', () => {
    let services, preference, clearPreferences;

    const profile = {
        profileId: "mi@gmail.com",
        provider: "google.com",
        email: "mi@gmail.com",
        verified: false,
        displayName: "Mi Too",
        lastName: "Too",
        firstName: "Mi",
        avatar: 'avatoar'
    };

    let auth, user;

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        const {schema} = database;
        ({clearPreferences} = composeClearDataAccess(schema));


        await clearPreferences(database);
        preference = getServiceBinder(services).createInstance(PreferenceDAO);

        await getRoleDAO(services).saveOne({
            name: 'normal',
            description: 'Normal user with limited rights'
        });

        auth = await getAuthDAO(services).saveOne(profile);
        user = await getUserDAO(services).saveOne(auth);

    })

    it('should save preference', async () => {
        let pref = await preference.saveOne({
            user,
            name: 'my-pref',
            value: {
                'allow-auto-upload': true,
                'foo': 'bar'
            }
        });

        expect(pref).to.have.property('userId', user.id);
        expect(pref).to.have.property('name', 'my-pref');
        expect(pref.value).to.have.property('allow-auto-upload', true);
        expect(pref.value).to.have.property('foo', 'bar');
    })

    it('should load preference', async () => {
        let saved = await preference.saveOne({
            user,
            name: 'my-pref',
            value: {
                'allow-auto-upload': true,
                'foo': 'bar'
            }
        });


        let loaded = await preference.loadOne({
            user,
            name: 'my-pref',
        })

        expect(loaded).to.have.property('userId', user.id);
        expect(loaded).to.have.property('name', 'my-pref');
        expect(loaded.value).to.have.property('allow-auto-upload', true);
        expect(loaded.value).to.have.property('foo', 'bar');
    })

    it('should load all preferences', async () => {
        let saved1 = await preference.saveOne({
            user,
            name: 'my-pref1',
            value: {
                'allow-auto-upload': true,
                'foo': 'bar'
            }
        });

        let saved2 = await preference.saveOne({
            user,
            name: 'my-pref2',
            value: {
                'allow-auto-upload': false,
                'foo': 'baz'
            }
        });


        let loaded = await preference.loadMany({user});

        expect(loaded).to.have.length(2);

        expect(loaded[0]).to.have.property('userId', user.id);
        expect(loaded[0]).to.have.property('name', 'my-pref1');
        expect(loaded[0].value).to.have.property('allow-auto-upload', true);
        expect(loaded[0].value).to.have.property('foo', 'bar');

        expect(loaded[1]).to.have.property('userId', user.id);
        expect(loaded[1]).to.have.property('name', 'my-pref2');
        expect(loaded[1].value).to.have.property('allow-auto-upload', false);
        expect(loaded[1].value).to.have.property('foo', 'baz');

    })

    it('should delete preference by name', async () => {
        let saved1 = await preference.saveOne({
            user,
            name: 'my-pref1',
            value: {
                'allow-auto-upload': true,
                'foo': 'bar'
            }
        });

        let saved2 = await preference.saveOne({
            user,
            name: 'my-pref2',
            value: {
                'allow-auto-upload': false,
                'foo': 'baz'
            }
        });

        await preference.delete({user, name: 'my-pref2'});

        let loaded = await preference.loadMany({user});

        expect(loaded).to.have.length(1);

        expect(loaded[0]).to.have.property('userId', user.id);
        expect(loaded[0]).to.have.property('name', 'my-pref1');
        expect(loaded[0].value).to.have.property('allow-auto-upload', true);
        expect(loaded[0].value).to.have.property('foo', 'bar');
    })

    it('should delete preference by id', async () => {
        let saved1 = await preference.saveOne({
            user,
            name: 'my-pref1',
            value: {
                'allow-auto-upload': true,
                'foo': 'bar'
            }
        });

        let saved2 = await preference.saveOne({
            user,
            name: 'my-pref2',
            value: {
                'allow-auto-upload': false,
                'foo': 'baz'
            }
        });

        await preference.delete(saved2);

        let loaded = await preference.loadMany({user});

        expect(loaded).to.have.length(1);

        expect(loaded[0]).to.have.property('userId', user.id);
        expect(loaded[0]).to.have.property('name', 'my-pref1');
        expect(loaded[0].value).to.have.property('allow-auto-upload', true);
        expect(loaded[0].value).to.have.property('foo', 'bar');
    })

})