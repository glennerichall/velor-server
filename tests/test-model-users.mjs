import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {composeClearDataAccess} from "./fixtures/database-clear.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {getDataUsers} from "../application/services/dataServices.mjs";
import {
    getAuthDAO,
    getRoleDAO,
    getUserDAO
} from "../application/services/serverServices.mjs";
import {conformUser} from "../models/conform/conformUser.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('User', () => {
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

    let auth, services, userDao;

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        const {
            clearAuths,
            clearRoles
        } = composeClearDataAccess(database.schema);
        await clearAuths(database);
        await clearRoles(database);

        auth = await getAuthDAO(services).saveOne(profile);

        await getRoleDAO(services).saveOne({
            name: 'normal',
            description: 'Normal user with limited rights'
        });

        userDao = getUserDAO(services);
    })

    async function readUserFromDatabase() {
        return conformUser(await getDataUsers(services)
            .getPrimaryAuthByProfile(profile.profileId, profile.provider));
    }

    it('should not get primary auth if not saved', async () => {
        let loaded = await userDao.loadOne({
            authId: auth.id
        });
        expect(loaded).to.be.null;
    })


    it('should save user to database when using auth', async ({services}) => {
        let saved = await userDao.saveOne(auth);
        expect(saved).to.have.property('profileId', auth.profileId);
        expect(saved).to.have.property('provider', auth.provider);
        expect(saved).to.have.property('email', auth.email);
        expect(saved).to.have.property('verified', auth.verified);
        expect(saved).to.have.property('displayName', auth.displayName);
        expect(saved).to.have.property('lastName', auth.lastName);
        expect(saved).to.have.property('firstName', auth.firstName);
        expect(saved).to.have.property('avatar', auth.avatar);
        expect(saved).to.have.property('primaryAuthId', auth.id);

        let data = await readUserFromDatabase();
        expect(saved.id).to.eq(data.id);
    })

    it('should save user to database when using profile', async ({services}) => {
        let saved = await userDao.saveOne({
            profileId: auth.profileId,
            provider: auth.provider,
        });

        expect(saved).to.have.property('profileId', auth.profileId);
        expect(saved).to.have.property('provider', auth.provider);
        expect(saved).to.have.property('email', auth.email);
        expect(saved).to.have.property('verified', auth.verified);
        expect(saved).to.have.property('displayName', auth.displayName);
        expect(saved).to.have.property('lastName', auth.lastName);
        expect(saved).to.have.property('firstName', auth.firstName);
        expect(saved).to.have.property('avatar', auth.avatar);
        expect(saved).to.have.property('primaryAuthId', auth.id);

        let data = await readUserFromDatabase();
        expect(saved.id).to.eq(data.id);
    })

    it('should save user to database when using auth id', async ({services}) => {
        let saved = await userDao.saveOne({
            authId: auth.id
        });

        expect(saved).to.have.property('profileId', auth.profileId);
        expect(saved).to.have.property('provider', auth.provider);
        expect(saved).to.have.property('email', auth.email);
        expect(saved).to.have.property('verified', auth.verified);
        expect(saved).to.have.property('displayName', auth.displayName);
        expect(saved).to.have.property('lastName', auth.lastName);
        expect(saved).to.have.property('firstName', auth.firstName);
        expect(saved).to.have.property('avatar', auth.avatar);
        expect(saved).to.have.property('primaryAuthId', auth.id);

        let data = await readUserFromDatabase();
        expect(saved.id).to.eq(data.id);
    })

    it('should not save twice', async ({services}) => {
        await userDao.saveOne({
            authId: auth.id
        });

        let data = await getDataUsers(services).countUsers();
        expect(data).to.eq(1);

        await userDao.saveOne({
            authId: auth.id
        });

        data = await getDataUsers(services).countUsers();
        expect(data).to.eq(1);

        await userDao.saveOne({
            profileId: auth.profileId,
            provider: auth.provider,
        });

        data = await getDataUsers(services).countUsers();
        expect(data).to.eq(1);

        await userDao.saveOne(auth);

        data = await getDataUsers(services).countUsers();
        expect(data).to.eq(1);

    })

    it('should grant normal role to user upon save', async () => {
        let saved = await userDao.saveOne(auth);
        let roles = await userDao.getRoles(saved);
        expect(roles).to.have.length(1)
        expect(roles[0].name).to.eq('normal');
    })

    it('should save preference', async () => {
        let user = await userDao.saveOne(auth);
        let pref = await userDao.setPreference(user, 'my-pref', {foo: 'bar'});
        expect(pref.value).to.have.property('foo', 'bar');
        expect(pref).to.have.property('name', 'my-pref');
    })

    it('should get preference', async () => {
        let user = await userDao.saveOne(auth);
        await userDao.setPreference(user, 'my-pref', {foo: 'bar'});
        let pref = await userDao.getPreference(user, 'my-pref');
        expect(pref.value).to.have.property('foo', 'bar');
        expect(pref).to.have.property('name', 'my-pref');
    })

    it('should get preferences', async () => {
        let user = await userDao.saveOne(auth);
        await userDao.setPreference(user, 'my-pref1', {foo: 'bar'});
        await userDao.setPreference(user, 'my-pref2', {foo: 'bar'});
        let pref = await userDao.getPreferences(user);
        expect(pref).to.have.length(2);
    })
})