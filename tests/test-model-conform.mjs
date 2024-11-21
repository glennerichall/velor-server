import sinon from "sinon";
import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {conformApiKey} from "../models/conform/conformApiKey.mjs";
import {conformAuth} from "../models/conform/conformAuth.mjs";
import {conformProfile} from "../models/conform/conformProfile.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('confirm models', () => {


    describe('conformApiKey', function () {
        let sandbox = null;

        beforeEach(function () {
            sandbox = sinon.createSandbox();
        });

        afterEach(function () {
            sandbox.restore();
        });

        // Normal cases
        it('should return an object with same properties if no snake_case keys', function () {
            const apiKey = {
                id: 1,
                value: 'value',
                creation: 'creation',
                name: 'name',
                publicId: 'publicId',
                lastUsed: 'lastUsed',
                privateId: 'privateId',
            };
            expect(conformApiKey(apiKey)).to.eql(apiKey);
        });

        // Edge cases
        it('should replace snake_case keys with camelCase keys', function () {
            const apiKey = {
                id: 1,
                value: 'value',
                creation: 'creation',
                name: 'name',
                public_id: 'publicId',
                last_used: 'lastUsed',
                raw_uuid: 'privateId',
            };
            const expectedApiKeys = {
                id: 1,
                value: 'value',
                creation: 'creation',
                name: 'name',
                publicId: 'publicId',
                lastUsed: 'lastUsed',
                privateId: 'privateId',
            };
            expect(conformApiKey(apiKey)).to.eql(expectedApiKeys);
        });

        it('should use camelCase keys value if both snake_case and camelCase keys exist', function () {
            const apiKey = {
                id: 1,
                value: 'value',
                creation: 'creation',
                name: 'name',
                publicId: 'camelCasePublicId',
                public_id: 'snakeCasePublicId',
                lastUsed: 'camelCaseLastUsed',
                last_used: 'snakeCaseLastUsed',
                privateId: 'camelCasePrivateId',
                raw_uuid: 'snakeCasePrivateId',
            };
            const expectedApiKeys = {
                id: 1,
                value: 'value',
                creation: 'creation',
                name: 'name',
                publicId: 'camelCasePublicId',
                lastUsed: 'camelCaseLastUsed',
                privateId: 'camelCasePrivateId',
            };
            expect(conformApiKey(apiKey)).to.eql(expectedApiKeys);
        });

        // Edge cases
        it('should throw a TypeError if no parameter is passed', function () {
            expect(conformApiKey()).to.be.null;
        });
    });

    describe("conformAuth", () => {
        let auth;

        beforeEach(() => {
            auth = {
                id: "123",
                provider: "demoProvider",
                verified: true,
                firstname: "DemoFirst",
                lastname: "DemoLast",
                avatar: "demo",
                profileId: "pid",
                email: "demo@example.com",
                displayName: "Demo User",
                userId: "uid",
            };
        });

        it("should return null if auth is null", () => {
            const result = conformAuth(null);
            expect(result).to.equal(null);
        });

        it("should return auth object with appropriate keys", () => {
            const result = conformAuth(auth);
            expect(result).to.have.all.keys('id', 'provider', 'verified', 'firstName',
                'lastName', 'avatar', 'profileId', 'email', 'displayName', 'userId');
        });

        it("should map firstname to firstName", () => {
            const result = conformAuth(auth);
            expect(result.firstName).to.equal(auth.firstname);
        });

        it("should map lastname to lastName", () => {
            const result = conformAuth(auth);
            expect(result.lastName).to.equal(auth.lastname);
        });

        describe("when `first_name` and `firstName` exist", () => {
            beforeEach(() => {
                auth = {
                    ...auth,
                    firstName: "DemoFirstName",
                    first_name: "DemoFirstName1",
                };
            });

            it("should prioritize `firstname` over `first_name` and `firstName`", () => {
                const result = conformAuth(auth);
                expect(result.firstName).to.equal(auth.firstname);
            });
        });

        it("should prioritize `displayName` over `display_name` and `displayname`", () => {
            auth = {...auth, displayname: "Demo User 3"};
            const result = conformAuth(auth);
            expect(result.displayName).to.equal(auth.displayName);
        });

        it("should prioritize `lastname` over `last_name` and `lastName`", () => {
            const result = conformAuth(auth);
            expect(result.lastName).to.equal(auth.lastname);
        });

        it("should prioritize `profileId` over all similar properties", () => {
            auth = {
                ...auth,
                profileid: "pid3",
                auth_id: "aid1",
                authid: "aid2",
            };

            const result = conformAuth(auth);
            expect(result.profileId).to.equal(auth.profileId);
        });
    });

    describe("conformProfile", () => {
        let provider = 'google.com';
        afterEach(() => {
            sinon.restore();
        });

        it("Should populate email from 'profile.emails' array when it is not empty", () => {
            const profile = {
                id: "1",
                emails: [{value: "test@test.com"}],
            };
            const expected = {
                profileId: profile.id,
                provider,
                email: "test@test.com",
                verified: true,
                displayName: null,
                avatar: null,
                firstName: null,
                lastName: null,
            };
            expect(conformProfile(profile, provider))
                .deep.equal(expected);
        });

        it("Should populate email from 'profile.email' property when 'profile.emails' array is empty", () => {
            const profile = {
                id: "2",
                email: "test2@test.com",
                emails: [],
            };
            const expected = {
                profileId: profile.id,
                provider,
                email: "test2@test.com",
                verified: false,
                displayName: null,
                avatar: null,
                firstName: null,
                lastName: null,
            };
            expect(conformProfile(profile, provider)).deep.equal(expected);
        });
        it("Should correctly assign displayName when 'profile.displayName' is defined", () => {
            const profile = {
                id: "3",
                displayName: "Test User",
            };
            const expected = {
                profileId: profile.id,
                provider,
                email: null,
                verified: false,
                displayName: profile.displayName,
                avatar: null,
                firstName: null,
                lastName: null,
            };
            expect(conformProfile(profile, provider)).deep.equal(expected);
        });

        it("Should correctly assign displayName, firstName, and lastName when 'profile.name' is defined", () => {
            const profile = {
                id: "4",
                name: {
                    givenName: "John",
                    familyName: "Smith",
                },
            };
            const expected = {
                profileId: profile.id,
                provider,
                email: null,
                verified: false,
                displayName: "John Smith",
                avatar: null,
                firstName: "John",
                lastName: "Smith",
            };
            expect(conformProfile(profile, provider)).deep.equal(expected);
        });

        it("Should correctly assign avatar when 'profile.photos' array has at least one element", () => {
            const profile = {
                id: "5",
                photos: [{value: "avatar.png"}],
            };
            const expected = {
                profileId: profile.id,
                provider,
                email: null,
                verified: false,
                displayName: null,
                avatar: "avatar.png",
                firstName: null,
                lastName: null,
            };
            expect(conformProfile(profile, provider)).deep.equal(expected);
        });

        it("Should correctly assign avatar when 'profile.image_url_https' is defined", () => {
            const profile = {
                id: "6",
                image_url_https: "avatar_https.png",
                photos: [],
            };
            const expected = {
                profileId: profile.id,
                provider,
                email: null,
                verified: false,
                displayName: null,
                avatar: "avatar_https.png",
                firstName: null,
                lastName: null,
            };
            expect(conformProfile(profile, provider)).deep.equal(expected);
        });
    });

})