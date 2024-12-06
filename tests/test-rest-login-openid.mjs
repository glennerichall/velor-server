import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {loginToKeycloak} from "./contrib/api/loginToKeycloak.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('Keycloak Authentication Middleware', () => {
    it('should be redirected to auth service', async ({services, api}) => {
        await api.initiateLoginWithOpenId()
            .expect('location', /https:\/\/auth.velor.ca\/realms\/zupfe/)
            .expect(302);
    });


    it.skip('should login', async ({services, api}) => {
        // user john.doe@velor.ca must be enabled in keycloak to pass the test.

        const response = await api.initiateLoginWithOpenId();

        let loginResponse = await loginToKeycloak(response,
            'john.doe@velor.ca', '123test!');

        expect(loginResponse.status).to.eq(302);
        expect(loginResponse.headers.get('location')).to.match(/https:\/\/localhost:3000/)
    });
});
