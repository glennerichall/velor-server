import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {AuthDAO} from "../models/AuthDAO.mjs";
import {getDataAuths} from "../application/services/dataServices.mjs";
import {conformAuth} from "../models/conform/conformAuth.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {composeClearDataAccess} from "./fixtures/database-clear.mjs";

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

    let services, auth;

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        const {schema} = database;
        let {
            clearAuths
        } = composeClearDataAccess(schema);
        await clearAuths(database);
        auth = getServiceBinder(services).createInstance(AuthDAO);
    })

    function readAuthFromDatabase() {
        return getDataAuths(services).getAuthByProvider(profile.profileId, profile.provider);
    }

    it('should save auth if not save', async () => {
        // ensure current profile is NOT in database
        let data = await readAuthFromDatabase();
        expect(data).to.be.null;

        let saved = await auth.saveOne(profile);

        expect(saved).to.not.eq(profile);

        // check current profile is NOW in database
        data = conformAuth(await readAuthFromDatabase());
        expect(data).excluding(['id', 'avatar', 'userId']).to.deep.equal(profile);

        expect(saved).to.have.property('id', data.id);
    })

    it('should load auth from database using profile', async () => {
        // save instance into db
        await auth.saveOne(profile);
        let data = await readAuthFromDatabase(services);

        let loaded = await auth.loadOne({
            profileId: profile.profileId,
            provider: profile.provider,
        });

        expect(data).to.not.eq(profile);
        expect(loaded.id).to.not.be.undefined;
        expect(loaded).to.have.property('id', data.id);

        expect(loaded).to.have.property('profileId', profile.profileId);
        expect(loaded).to.have.property('provider', profile.provider);
        expect(loaded).to.have.property('email', profile.email);
        expect(loaded).to.have.property('verified', profile.verified);
        expect(loaded).to.have.property('displayName', profile.displayName);
        expect(loaded).to.have.property('lastName', profile.lastName);
        expect(loaded).to.have.property('firstName', profile.firstName);
        expect(loaded).to.have.property('avatar', profile.avatar);
    })

    it('should load auth from database using auth id', async () => {
        // save instance into db
        await auth.saveOne(profile);
        let data = await readAuthFromDatabase(services);
        let loaded = await auth.loadOne({id: data.id});

        expect(loaded).to.have.property('id', data.id);
        expect(loaded).to.have.property('profileId', profile.profileId);
        expect(loaded).to.have.property('provider', profile.provider);
        expect(loaded).to.have.property('email', profile.email);
        expect(loaded).to.have.property('verified', profile.verified);
        expect(loaded).to.have.property('displayName', profile.displayName);
        expect(loaded).to.have.property('lastName', profile.lastName);
        expect(loaded).to.have.property('firstName', profile.firstName);
        expect(loaded).to.have.property('avatar', profile.avatar);
    })

    it('should not save auth twice', async () => {
        let saved = await auth.saveOne(profile);
        expect(auth.isVO(saved)).to.be.true;
        expect(await auth.canSave(saved)).to.be.false;
        saved = await auth.saveOne(saved);
        expect(auth.isVO(saved)).to.be.true;
    })

    it('should not save auth if already in database', async () => {
        let first = await auth.saveOne(profile);
        let loaded = await auth.saveOne(profile);
        expect(auth.isVO(loaded)).to.be.true;

        let auths = await getDataAuths(services).getAllAuths();
        expect(auths).to.have.length(1);

        expect(loaded).to.have.property('id', first.id);
        expect(loaded).to.have.property('profileId', profile.profileId);
        expect(loaded).to.have.property('provider', profile.provider);
        expect(loaded).to.have.property('email', profile.email);
        expect(loaded).to.have.property('verified', profile.verified);
        expect(loaded).to.have.property('displayName', profile.displayName);
        expect(loaded).to.have.property('lastName', profile.lastName);
        expect(loaded).to.have.property('firstName', profile.firstName);
        expect(loaded).to.have.property('avatar', profile.avatar);
    })

    it('should set verified to true', async () => {
        // save instance into db
        let saved = await auth.saveOne(profile);

        let data = await readAuthFromDatabase(services);
        expect(data).to.have.property('verified', false);

        let verified = await auth.markAsConfirmed(saved);

        data = await readAuthFromDatabase(services);

        expect(data).to.have.property('verified', true);
        expect(data).to.have.property('id', saved.id);
        expect(verified).to.have.property('verified', true);
    })

    it('should not load unsaved auth', async () => {
        let loaded = await auth.loadOne({
            profileId: profile.profileId,
            provider: profile.provider,
        });
        expect(loaded).to.be.null;
    })

    it('should freeze auth', async () => {
        let saved = await auth.saveOne(profile);
        expect(Object.isFrozen(saved)).to.be.true;
    })
})