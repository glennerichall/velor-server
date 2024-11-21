import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {clearAuths} from "./fixtures/database-clear.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {User} from "../models/User.mjs";
import {Auth} from "../models/Auth.mjs";

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
    };

    let auth;

    beforeEach(async ({services}) => {
        const database = getDatabase(services);
        await clearAuths(database); // users are cascaded
        auth = getServiceBinder(services).createInstance(Auth, profile);
        await auth.save();
    })

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
    })

    it('should save user to database', async ({services}) => {

    })
})