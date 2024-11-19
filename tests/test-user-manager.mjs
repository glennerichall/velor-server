import sinon from "sinon";
import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {UserManager} from "../managers/UserManager.mjs";
import {
    DATA_AUTHS,
    DATA_USER_AUTHS,
    DATA_USERS
} from "../application/services/serverDataKeys.mjs";
import {mergeDefaultServerOptions} from "../application/services/mergeDefaultServerOptions.mjs";
import {
    createAppServicesInstance,
    getServiceBinder
} from "velor-services/injection/ServicesContext.mjs";
import {s_database} from "velor-database/application/services/databaseServiceKeys.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('UserManager', () => {
    let userManager;
    let mockDatabase, services;

    beforeEach(() => {

        mockDatabase = {
            [DATA_AUTHS]: {
                queryByAuthIdProvider: sinon.stub(),
                insertAuth: sinon.stub()
            },
            [DATA_USERS]: {
                insertUser: sinon.stub(),
                grantUserRole: sinon.stub()
            },
            [DATA_USER_AUTHS]: {
                queryForUserByAuthId: sinon.stub(),
                queryForAuthsByUserId: sinon.stub(),
                insertOrNothing: sinon.stub()
            }
        };

        let options = mergeDefaultServerOptions(
            {
                env: {},
                factories: {
                    [s_database]: () => mockDatabase,
                }
            });
        services = createAppServicesInstance(options);
        userManager = new UserManager();
        getServiceBinder(services).autoWire(userManager);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should insert auth if not exists and update user from auth login', async () => {
        const provider = 'testProvider';
        const profile = {
            id: '123',
            displayName: 'Test User',
            emails: [{value: 'test@example.com'}]
        };

        // Set up the stubs for insert auth and user operations
        const mockAuth = {
            auth_id: '123',
            provider: 'testProvider',
            email: 'test@example.com',
            displayName: 'Test User',
            verified: true
        };
        const mockUser = {id: 'user123', loginAuth: mockAuth};
        const result = await userManager.updateUserFromAuthLogin(provider, profile);
        expect(result).to.deep.equal(mockUser);
    });

    it('should handle string profileOrAuthId and update user from auth login', async () => {
        const provider = 'testProvider';
        const profileOrAuthId = '123';

        // Expected profile created from string profileOrAuthId
        const expectedProfile = {id: profileOrAuthId};

        const mockAuth = {auth_id: '123', provider: 'testProvider'};
        const mockUser = {id: 'user123', loginAuth: mockAuth};

        const result = await userManager.updateUserFromAuthLogin(provider, profileOrAuthId);
        expect(result).to.deep.equal(mockUser);
    });

    it('should return loginAuth if already set in user object', async () => {
        const user = {loginAuth: {auth_id: '123', provider: 'testProvider'}};

        const result = await userManager.getLoginAuth(user);

        // Assertions
        expect(result).to.deep.equal(user.loginAuth);
    });

    it('should fetch and return loginAuth if not set in user object', async () => {
        const user = {primary_auth_id: '123'};
        const mockAuth = {auth_id: '123', provider: 'testProvider'};

        mockDatabase[DATA_AUTHS].queryAuthById.returns(mockAuth);

        const result = await userManager.getLoginAuth(user);

        // Assertions
        expect(mockDatabase[DATA_AUTHS].queryAuthById.calledOnceWith(user.primary_auth_id)).to.be.true;
        expect(result).to.deep.equal(mockAuth);
    });

    it('should grant role to user based on loginAuth', async () => {
        const user = {primary_auth_id: '123'};
        const role = 'admin';
        const mockAuth = {auth_id: '123', provider: 'testProvider'};

        // Mock getLoginAuth response
        userManager.getLoginAuth = sinon.stub().returns(mockAuth);
        mockDatabase[DATA_USERS].grantUserRoleByAuth.returns(true);

        const result = await userManager.grantUserRole(user, role);

        // Assertions
        expect(userManager.getLoginAuth.calledOnceWith(user)).to.be.true;
        expect(mockDatabase[DATA_USERS].grantUserRoleByAuth.calledOnceWith(mockAuth.auth_id, mockAuth.provider, role)).to.be.true;
        expect(result).to.be.true;
    });
});


