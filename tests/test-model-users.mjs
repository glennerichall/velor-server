import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {
    clearAuths,
    clearRoles
} from "./fixtures/database-clear.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {UserDAO} from "../models/UserDAO.mjs";
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

    let auth, services, user;

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        await clearAuths(database);
        await clearRoles(database);

        auth = await getAuthDAO(services).saveOne(profile);

        await getRoleDAO(services).saveOne({
            name: 'normal',
            description: 'Normal user with limited rights'
        });

        user = getUserDAO(services);
    })

    async function readUserFromDatabase() {
        return conformUser(await getDataUsers(services)
            .getPrimaryAuthByProfile(profile.profileId, profile.provider));
    }

    it('should not get primary auth if not saved', async () => {
        let loaded = await user.loadOne({
            authId: auth.id
        });
        expect(loaded).to.be.null;
    })


    it('should save user to database when using auth', async ({services}) => {
        let saved = await user.saveOne(auth);
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
        let saved = await user.saveOne({
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
        let saved = await user.saveOne({
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
        await user.saveOne({
            authId: auth.id
        });

        let data = await getDataUsers(services).countUsers();
        expect(data).to.eq(1);

        await user.saveOne({
            authId: auth.id
        });

        data = await getDataUsers(services).countUsers();
        expect(data).to.eq(1);

        await user.saveOne({
            profileId: auth.profileId,
            provider: auth.provider,
        });

        data = await getDataUsers(services).countUsers();
        expect(data).to.eq(1);

        await user.saveOne(auth);

        data = await getDataUsers(services).countUsers();
        expect(data).to.eq(1);

    })

    it('should grant normal role to user upon save', async () => {
        let saved = await user.saveOne(auth);
        let roles = await user.getRoles(saved);
        expect(roles).to.have.length(1)
        expect(roles[0].name).to.eq('normal');
    })
})