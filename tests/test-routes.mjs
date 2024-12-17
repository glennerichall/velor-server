import {setupTestContext} from "./fixtures/setupTestContext.mjs";

import {getFullHostUrls} from "../application/services/constants.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('routes', () => {
    it('should have installed all routes', async ({rest, services}) => {

        const urls = getFullHostUrls(services);

        expect(urls).to.deep.eq({
            "URL_CSRF": "/api/v2/csrf/csrf-token",
            "URL_WS_ID": "/api/v2/ws/ws-id",
            "URL_LOGIN_SUCCESS": "/api/v2/auth/login_success",
            "URL_LOGIN_FAILURE": "/api/v2/auth/login_failure",
            "URL_LOGIN": "/api/v2/auth/session/:provider",
            "URL_PASSPORT_CALLBACK": "/api/v2/auth/redirect/:provider",
            "URL_PREFERENCES": "/api/v2/preferences",
            "URL_PREFERENCES_ITEM": "/api/v2/preferences/:item",
            "URL_API_KEYS": "/api/v2/api-keys",
            "URL_API_KEYS_ITEM": "/api/v2/api-keys/:item"
        });

    })
})