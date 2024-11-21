import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {Auth} from "../models/Auth.mjs";
import {getDataAuths} from "../application/services/dataServices.mjs";
import {conformAuth} from "../models/conform/conformAuth.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {clearAuths} from "./fixtures/database-clear.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('Auth', () => {
    const profile = {
        profileId: "mi@gmail.com",
        provider: "google.com",
        email: "mi@gmail.com",
        verified: false,
        displayName: "Mi Too",
        lastName: "Too",
        firstName: "Mi",
        avatar: 'yoyoyo'
    };

    let services;

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        await clearAuths(database);
    })

    function readAuthFromDatabase() {
        return getDataAuths(services).getAuthByProvider(profile.profileId, profile.provider);
    }

    it('should give access to underlying data', async () => {
        let auth = getServiceBinder(services).createInstance(Auth, profile);

        expect(auth).to.have.property('profileId', profile.profileId);
        expect(auth).to.have.property('provider', profile.provider);
        expect(auth).to.have.property('email', profile.email);
        expect(auth).to.have.property('verified', profile.verified);
        expect(auth).to.have.property('displayName', profile.displayName);
        expect(auth).to.have.property('lastName', profile.lastName);
        expect(auth).to.have.property('firstName', profile.firstName);
        expect(auth).to.have.property('avatar', profile.avatar);
    })

    it('should save auth if not save', async () => {
        let auth = getServiceBinder(services).createInstance(Auth, profile);

        // ensure current profile is NOT in database
        let data = await readAuthFromDatabase(services);
        expect(data).to.be.null;

        let saved = await auth.save();

        expect(saved).to.be.true;

        // check current profile is NOW in database
        data = conformAuth(await readAuthFromDatabase(services));
        expect(data).excluding(['id', 'avatar', 'userId']).to.deep.equal(profile);

        expect(auth).to.have.property('id', data.id);
    })

    it('should load auth from database using profile', async () => {
        // save instance into db
        let auth = getServiceBinder(services).createInstance(Auth, profile);
        await auth.save();

        // create new instance, it should be loaded from database
        expect(profile.id).to.be.undefined;
        auth = getServiceBinder(services).createInstance(Auth, {
            profileId: profile.profileId,
            provider: profile.provider,
        });
        expect(auth.id).to.be.undefined;

        let data = await readAuthFromDatabase(services);

        expect(auth).to.have.property('profileId', profile.profileId);
        expect(auth).to.have.property('provider', profile.provider);
        expect(auth).to.have.property('email', undefined);
        expect(auth).to.have.property('verified', undefined);
        expect(auth).to.have.property('displayName', undefined);
        expect(auth).to.have.property('lastName', undefined);
        expect(auth).to.have.property('firstName', undefined);
        expect(auth).to.have.property('avatar', undefined);

        await auth.load();
        expect(profile.id).to.be.undefined;

        expect(auth.id).to.not.be.undefined;
        expect(auth).to.have.property('id', data.id);

        expect(auth).to.have.property('profileId', profile.profileId);
        expect(auth).to.have.property('provider', profile.provider);
        expect(auth).to.have.property('email', profile.email);
        expect(auth).to.have.property('verified', profile.verified);
        expect(auth).to.have.property('displayName', profile.displayName);
        expect(auth).to.have.property('lastName', profile.lastName);
        expect(auth).to.have.property('firstName', profile.firstName);
        expect(auth).to.have.property('avatar', profile.avatar);
    })

    it('should load auth from database using auth id', async () => {
        // save instance into db
        let auth = getServiceBinder(services).createInstance(Auth, profile);
        await auth.save();

        let data = await readAuthFromDatabase(services);

        auth = getServiceBinder(services).createInstance(Auth, {
            id: data.id,
        });

        expect(auth).to.have.property('id', data.id);
        expect(auth).to.have.property('profileId', undefined);
        expect(auth).to.have.property('provider', undefined);
        expect(auth).to.have.property('email', undefined);
        expect(auth).to.have.property('verified', undefined);
        expect(auth).to.have.property('displayName', undefined);
        expect(auth).to.have.property('lastName', undefined);
        expect(auth).to.have.property('firstName', undefined);
        expect(auth).to.have.property('avatar', undefined);

        await auth.load();

        expect(auth).to.have.property('id', data.id);

        expect(auth).to.have.property('profileId', profile.profileId);
        expect(auth).to.have.property('provider', profile.provider);
        expect(auth).to.have.property('email', profile.email);
        expect(auth).to.have.property('verified', profile.verified);
        expect(auth).to.have.property('displayName', profile.displayName);
        expect(auth).to.have.property('lastName', profile.lastName);
        expect(auth).to.have.property('firstName', profile.firstName);
        expect(auth).to.have.property('avatar', profile.avatar);
    })

    it('should not save auth if already in database', async () => {
        // save instance into db
        let auth = getServiceBinder(services).createInstance(Auth, profile);
        await auth.save();

        // create new instance, it should not save it into database
        expect(profile.id).to.be.undefined;
        auth = getServiceBinder(services).createInstance(Auth, profile);
        expect(auth.id).to.be.undefined;

        let saved = await auth.save();
        expect(saved).to.be.false;

        expect(auth.id).to.not.be.undefined;
    })

    it('should set verified to true', async()=> {
        // save instance into db
        let auth = getServiceBinder(services).createInstance(Auth, profile);
        await auth.save();

        let data = await readAuthFromDatabase(services);

        expect(data).to.have.property('verified', false);

        await auth.markAsConfirmed();

        data = await readAuthFromDatabase(services);

        expect(data).to.have.property('verified', true);
        expect(auth).to.have.property('verified', true);

    })
})