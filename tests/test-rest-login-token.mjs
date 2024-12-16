import {AUTH_TOKEN} from "velor-contrib/contrib/authProviders.mjs";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {
    URL_CSRF,
    URL_LOGIN,
    URL_LOGIN_SUCCESS
} from "velor-contrib/contrib/urls.mjs";
import {
    EVENT_USER_LOGIN,
    EVENT_USER_LOGOUT
} from "../application/services/eventKeys.mjs";
import {getUserDAO} from "velor-dbuser/application/services/services.mjs";
import {getEventQueue} from "velor-services/application/services/services.mjs";
import {getFullHostUrls} from "../application/services/constants.js";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('login with token', function () {

    beforeEach(async ({database}) => {
        const {clear} = database;
        await clear();
    })

    test.describe('login', () => {

        test('should login with token credentials', async ({services, api}) => {
            let urls = getFullHostUrls(services);
            let {context} = await api.getCsrfToken();
            await api.loginWithToken({context})
                .expect(302)
                .expect('location', urls[URL_LOGIN_SUCCESS])
                .expect('set-cookie', /session/);
        })

        test('should have normal role', async ({services, api}) => {
            let {context} = await api.getCsrfToken();
            await api.loginWithToken({context}).expect(302);
            const roles = await getUserDAO(services).getRoles({
                profileId: 'Token',
                provider: AUTH_TOKEN
            });
            expect(roles).to.have.length(1);
            expect(roles[0].name).to.eq('normal');
        })

        test('should not login with bad token credentials', async ({api}) => {
            let {context} = await api.getCsrfToken();
            await api
                .loginWithToken({token: 'bad token', context})
                .expect(401);
        })

        test('should not login with bad csrf token', async ({api}) => {
            let {context} = await api.getCsrfToken();
            context.csrf = 'toto';
            await api
                .loginWithToken({context})
                .expect(403);
        })

        test('should not create user twice', async ({api, services}) => {
            await api.loginWithToken().expect(302);
            await api.loginWithToken().expect(302);

            let count = await getUserDAO(services).countUsers();
            expect(count).to.eq(1);
        })

        test('should notify EVENT_USER_LOGIN upon login', async ({api, services}) => {
            await api.loginWithToken();
            let [user] = await getEventQueue(services).waitDequeue(EVENT_USER_LOGIN);

            let saved = await getUserDAO(services).loadOne({
                profileId: 'Token',
                provider: AUTH_TOKEN
            });

            expect(user).to.deep.eq(saved);
        })

    })

    describe('logout', () => {
        test('should not logout if not logged in', async ({services, request}) => {
            const urls = getFullHostUrls(services);
            let {context} = await request()
                .get(urls[URL_CSRF]);

            await request(context)
                .delete(urls[URL_LOGIN])
                .expect(401);
        })

        test('should not logout with no csrf', async ({services, api, request}) => {
            const urls = getFullHostUrls(services);
            const {context} = await api.loginWithToken();
            context.csrf = undefined;

            await request({context})
                .delete(urls[URL_LOGIN])
                .expect(403);
        })

        test('should logout', async ({services, api, request}) => {
            const urls = getFullHostUrls(services);
            let {context} = await api.loginWithToken();
            await request(context)
                .delete(urls[URL_LOGIN])
                .expect(200);
        })

        test('should notify EVENT_USER_LOGOUT upon logout', async ({api, request, services}) => {
            let {context} = await api.loginWithToken();
            await api.logout(context);

            let [user] = await getEventQueue(services).waitDequeue(EVENT_USER_LOGOUT);

            let saved = await getUserDAO(services).loadOne({
                profileId: 'Token',
                provider: AUTH_TOKEN
            });

            expect(user).to.have.property("id");
            expect(user).to.have.property("primaryAuthId");

            for (let key in user) {
                expect(user).to.have.property(key, saved[key]);
            }
        })
    })
})