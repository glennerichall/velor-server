import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {clearAuths} from "./fixtures/database-clear.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {User} from "../models/User.mjs";
import {AuthDAO} from "../models/AuthDAO.mjs";
import {
    getDataUsers
} from "../application/services/dataServices.mjs";
import {conformAuth} from "../models/conform/conformAuth.mjs";
import {Role} from "../models/Role.mjs";

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

    let auth, services;

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        await clearAuths(database); // users are cascaded
        auth = getServiceBinder(services).createInstance(AuthDAO, profile);
        await auth.save();

        let role = getServiceBinder(services).createInstance(Role, {
            name: 'normal',
            description: 'Normal user with limited rights'
        });
        await role.save();
    })

    async function readUserFromDatabase() {
        return conformAuth(await getDataUsers(services)
            .getPrimaryAuthByProfile(profile.profileId, profile.provider));
    }

    it('should set id from query', async ({services}) => {
        let user = getServiceBinder(services).createInstance(User, {
            id: 999
        });
        expect(user.id).to.be.undefined;
        await user.loadUserId();
        expect(user.id).to.eq(999);
    })

    it('should not fail loading user id from primary auth if not already saved in database', async ({services}) => {
        let user = getServiceBinder(services).createInstance(User, {
            authId: auth.id
        });
        await user.loadUserId();
        expect(user.id).to.be.undefined;

        user = getServiceBinder(services).createInstance(User, {
            profileId: auth.profileId,
            provider: auth.provider,
        });
        await user.loadUserId();
        expect(user.id).to.be.undefined;

        user = getServiceBinder(services).createInstance(User, {
            auth
        });
        await user.loadUserId();
        expect(user.id).to.be.undefined;
    })

    it('should get primary auth even if not saved', async ({services}) => {
        let user = getServiceBinder(services).createInstance(User, {
            auth
        });
        let primaryAuth = await user.getPrimaryAuth();
        expect(primaryAuth).to.eq(auth);
        expect(user.id).to.be.undefined;

        await user.loadUserId();
        expect(user.id).to.be.undefined;

        user = getServiceBinder(services).createInstance(User, {
            authId: auth.id
        });

        primaryAuth = await user.getPrimaryAuth();
        expect(primaryAuth).to.have.property('profileId', auth.profileId);
        expect(primaryAuth).to.have.property('provider', auth.provider);
        expect(primaryAuth).to.have.property('email', auth.email);
        expect(primaryAuth).to.have.property('verified', auth.verified);
        expect(primaryAuth).to.have.property('displayName', auth.displayName);
        expect(primaryAuth).to.have.property('lastName', auth.lastName);
        expect(primaryAuth).to.have.property('firstName', auth.firstName);
        expect(primaryAuth).to.have.property('avatar', auth.avatar);
        expect(user.id).to.be.undefined;

        await user.loadUserId();
        expect(user.id).to.be.undefined;

        user = getServiceBinder(services).createInstance(User, {
            profileId: auth.profileId,
            provider: auth.provider,
        });

        primaryAuth = await user.getPrimaryAuth();
        expect(primaryAuth).to.have.property('profileId', auth.profileId);
        expect(primaryAuth).to.have.property('provider', auth.provider);
        expect(primaryAuth).to.have.property('email', auth.email);
        expect(primaryAuth).to.have.property('verified', auth.verified);
        expect(primaryAuth).to.have.property('displayName', auth.displayName);
        expect(primaryAuth).to.have.property('lastName', auth.lastName);
        expect(primaryAuth).to.have.property('firstName', auth.firstName);
        expect(primaryAuth).to.have.property('avatar', auth.avatar);
        expect(user.id).to.be.undefined;

        await user.loadUserId();
        expect(user.id).to.be.undefined;
    })

    it('should save user to database when using auth', async ({services}) => {
        let user = getServiceBinder(services).createInstance(User, {
            auth
        });
        let saved = await user.save();
        expect(saved).to.be.true;
        expect(user.id).to.not.be.undefined;

        let data = await readUserFromDatabase();
        expect(user.id).to.eq(data.userId);
    })

    it('should save user to database when using profile', async ({services}) => {
        let user = getServiceBinder(services).createInstance(User, {
            profileId: auth.profileId,
            provider: auth.provider,
        });
        let saved = await user.save();
        expect(saved).to.be.true;
        expect(user.id).to.not.be.undefined;

        let data = await readUserFromDatabase();
        expect(user.id).to.eq(data.userId);
    })

    it('should save user to database when using auth id', async ({services}) => {
        let user = getServiceBinder(services).createInstance(User, {
            authId: auth.id
        });
        let saved = await user.save();
        expect(saved).to.be.true;
        expect(user.id).to.not.be.undefined;

        let data = await readUserFromDatabase();
        expect(user.id).to.eq(data.userId);

        user = getServiceBinder(services).createInstance(User, {
            authId: auth.id
        });
        expect(user.id).to.be.undefined;
        saved = await user.save();
        expect(saved).to.be.false;
        expect(user.id).to.eq(data.userId);
    })

    it('should not save twice', async ({services}) => {
        let user = getServiceBinder(services).createInstance(User, {
            authId: auth.id
        });
        let saved = await user.save();
        expect(saved).to.be.true;
        let id = user.id;

        user = getServiceBinder(services).createInstance(User, {
            authId: auth.id
        });
        expect(user.id).to.be.undefined;
        saved = await user.save();
        expect(saved).to.be.false;
        expect(user.id).to.eq(id);
    })

    it('should grant normal role to user upon save', async () => {
        let user = getServiceBinder(services).createInstance(User, {
            authId: auth.id
        });
        await user.save();
        let roles = await user.getRoles();
        expect(roles).to.have.length(1)
        expect(roles[0].name).to.eq('normal');
    })
})