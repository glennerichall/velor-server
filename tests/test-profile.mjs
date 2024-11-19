import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import sinon from "sinon";
import {composeInsertUser} from "../profile/composeInsertUser.mjs";
import {composeInsertAuth} from "../profile/composeInsertAuth.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('Auth and user', () => {

    describe('composeInsertAuth', function () {
        let queryByAuthIdProviderStub, insertAuthStub, insertAuthFunction;
        let authRepository;

        beforeEach(() => {
            // Create an in-memory repository to simulate the database
            authRepository = new Map();

            // Stub for querying by auth ID and provider
            queryByAuthIdProviderStub = sinon.stub().callsFake((authId, provider) => {
                return Promise.resolve(authRepository.get(`${provider}_${authId}`) || null);
            });

            // Stub for inserting a new auth
            insertAuthStub = sinon.stub().callsFake((auth) => {
                const key = `${auth.provider}_${auth.auth_id}`;
                authRepository.set(key, auth);
                return Promise.resolve();
            });

            // Compose the function with the stubs
            insertAuthFunction = composeInsertAuth(queryByAuthIdProviderStub, insertAuthStub);
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should return existing auth if it exists', async () => {
            const provider = 'testProvider';
            const profile = {id: '123'};
            const mockAuth = {auth_id: '123', provider};
            authRepository.set(`${provider}_${profile.id}`, mockAuth);

            const result = await insertAuthFunction(provider, profile);
            expect(result).to.deep.equal(mockAuth);
        });

        it('should insert auth if not exists and return the auth', async () => {
            const provider = 'testProvider';
            const profile = {
                id: '123',
                displayName: 'Test User',
                emails: [{value: 'test@example.com'}]
            };
            const expectedAuth = {
                auth_id: profile.id,
                provider,
                email: 'test@example.com',
                verified: true,
                displayName: 'Test User',
                avatar: null,
                firstName: null,
                lastName: null
            };

            const result = await insertAuthFunction(provider, profile);
            expect(authRepository.get(`${provider}_${profile.id}`)).to.deep.equal(expectedAuth);
            expect(result).to.deep.equal(expectedAuth);
        });

        it('should handle profiles without emails', async () => {
            const provider = 'testProvider';
            const profile = {
                id: '123',
                displayName: 'Test User'
            };
            const expectedAuth = {
                auth_id: profile.id,
                provider,
                email: null,
                verified: false,
                displayName: 'Test User',
                avatar: null,
                firstName: null,
                lastName: null
            };

            const result = await insertAuthFunction(provider, profile);

            expect(authRepository.get(`${provider}_${profile.id}`)).to.deep.equal(expectedAuth);
            expect(result).to.deep.equal(expectedAuth);
        });

        it('should handle profiles with partial name fields', async () => {
            const provider = 'testProvider';
            const profile = {
                id: '123',
                name: {familyName: 'Doe'}
            };
            const expectedAuth = {
                auth_id: profile.id,
                provider,
                email: null,
                verified: false,
                displayName: 'Doe',
                avatar: null,
                firstName: null,
                lastName: 'Doe'
            };

            const result = await insertAuthFunction(provider, profile);
            expect(authRepository.get(`${provider}_${profile.id}`)).to.deep.equal(expectedAuth);
            expect(result).to.deep.equal(expectedAuth);
        });

        it('should handle profiles with photos', async () => {
            const provider = 'testProvider';
            const profile = {
                id: '123',
                displayName: 'Test User',
                photos: [{value: 'http://example.com/avatar.jpg'}]
            };
            const expectedAuth = {
                auth_id: profile.id,
                provider,
                email: null,
                verified: false,
                displayName: 'Test User',
                avatar: 'http://example.com/avatar.jpg',
                firstName: null,
                lastName: null
            };

            const result = await insertAuthFunction(provider, profile);
            expect(authRepository.get(`${provider}_${profile.id}`)).to.deep.equal(expectedAuth);
            expect(result).to.deep.equal(expectedAuth);
        });

        it('should prioritize emails over email field', async () => {
            const provider = 'testProvider';
            const profile = {
                id: '123',
                displayName: 'Test User',
                emails: [{value: 'test@example.com'}],
                email: 'alternate@example.com'
            };
            const expectedAuth = {
                auth_id: profile.id,
                provider,
                email: 'test@example.com',
                verified: true,
                displayName: 'Test User',
                avatar: null,
                firstName: null,
                lastName: null
            };

            const result = await insertAuthFunction(provider, profile);
            expect(authRepository.get(`${provider}_${profile.id}`)).to.deep.equal(expectedAuth);
            expect(result).to.deep.equal(expectedAuth);
        });
    });

    describe('composeInsertUser', function () {
        let queryForUserByAuthId, queryForAuthsByUserId,
            insertUser, grantUserRole, linkAuthToUSer;
        let userRepository;
        let authRepository;

        beforeEach(() => {
            userRepository = new Map();
            authRepository = new Map();

            queryForUserByAuthId = sinon.stub().callsFake((authId, provider) => {
                return Promise.resolve(userRepository.get(authId + "_" + provider) ?? null);
            });
            queryForAuthsByUserId = sinon.stub().callsFake((userId) => {
                return Promise.resolve(userRepository.get(userId) ?? null);
            });
            insertUser = sinon.stub().callsFake((auth) => {
                userRepository.set(auth.auth_id + "_" + auth.provider, {});
                return Promise.resolve();
            });
            grantUserRole = sinon.stub().callsFake((userId, role) => {
                const user = userRepository.get(userId);
                user.roles.push(role);
                userRepository.set(userId, user);
                return Promise.resolve();
            });
        })


    })

})

