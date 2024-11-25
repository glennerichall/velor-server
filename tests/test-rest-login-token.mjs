import {getFullHostUrls} from "../application/services/requestServices.mjs";
import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {AUTH_TOKEN_SECRET} from "../application/services/serverEnvKeys.mjs";
import {createRouterBuilder} from "../core/createRouterBuilder.mjs";
import {createAuthConfiguration} from "../routes/auth.mjs";
import {
    getEventQueue,
    getExpressApp,
    getRoleDAO,
    getUserDAO
} from "../application/services/serverServices.mjs";
import {setupExpressApp} from "../initialization/setupExpressApp.mjs";
import {AUTH_TOKEN} from "velor-contrib/contrib/authProviders.mjs";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {composeSessionParser} from "../auth/composeSessionParser.mjs";
import {patchPassport} from "../auth/patchPassport.mjs";
import {
    URL_LOGIN_SUCCESS,
    URL_LOGOUT
} from "velor-contrib/contrib/urls.mjs";
import passport from "passport";
import {EVENT_USER_LOGIN} from "../application/services/serverEventKeys.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('login', function () {
    let services, application, session;
    let request, loginWithToken;

    beforeEach(async ({services: s, request: r}) => {
        services = s;
        request = r;

        ({loginWithToken} = request);

        let providers = {
            [AUTH_TOKEN]: {
                token: getEnvValue(services, AUTH_TOKEN_SECRET),
            }
        };

        application = getExpressApp(services);
        const configuration = createAuthConfiguration(services, providers);
        let router = createRouterBuilder().configure(configuration).done();

        let session = composeSessionParser(services);

        application
            // .use(cors({credentials: true, origin: true}))
            .use(session)
            .use(patchPassport)
            .use(passport.initialize())
            .use(passport.session())
            .use('/auth', router);

        // setup must be called after routes have been mounted
        await setupExpressApp(services);

        // create normal role
        await getRoleDAO(services).saveOne({name: 'normal'});

        // initialize event queue
        getEventQueue(services);
    })


    test.describe('login', () => {

        test('should login with token credentials', async () => {
            let urls = getFullHostUrls(services);
            await loginWithToken()
                .expect(302)
                .expect('location', urls[URL_LOGIN_SUCCESS])
                .expect('set-cookie', /session/);
        })

        test('should have normal role', async () => {
            await loginWithToken();
            const roles = await getUserDAO(services).getRoles({
                profileId: 'Token',
                provider: AUTH_TOKEN
            });
            expect(roles).to.have.length(1);
            expect(roles[0].name).to.eq('normal');
        })

        // test('should not login without session', async () => {
        //     let urls = getFullHostUrls(services);
        //     let application = getExpressApp(services);
        //     request(application)
        //         .get(getTokenLoginUrl(urls))
        //         .set('Authorization', getEnvValue(services, AUTH_TOKEN_SECRET));
        // })

        test('should not login with bad token credentials', async () => {
            await loginWithToken('bad token')
                .expect(401);
        })

        test('should not create user twice', async () => {
            await loginWithToken();
            await loginWithToken();

            let count = await getUserDAO(services).countUsers();
            expect(count).to.eq(1);
        })

        // test("should not login if ws session is closed", async () => {
        //
        //     await context.newSession()
        //         .loginWithMagicLink('johndoe@jane.com',
        //             async (url, msg, accept, session) => {
        //                 session.closeWs();
        //
        //                 let response = await fetch(url,
        //                     {
        //                         maxRedirects: 0,
        //                         validateStatus: status => true
        //                     });
        //
        //                 expect(response.headers['location']).to
        //                     .eq(`${env.ZUPFE_BACKEND_URL}/api/v1/auth/login_failure`);
        //
        //                 response = await context
        //                     .request()
        //                     .set('cookie', response.headers['set-cookie'])
        //                     .get(urls[URL_FLASH_ERROR])
        //                     .expect(200);
        //
        //                 expect(response.body).to.have.length(1);
        //                 expect(response.body[0]).to
        //                     .eq('The browser session who initiated the login request was closed');
        //
        //                 await session.request()
        //                     .get(urls[URL_PROFILE])
        //                     .expect(401);
        //             })
        // })

        test('should notify EVENT_LOGGED_IN upon login ', async () => {
            await loginWithToken();
            let [user] = await getEventQueue(services).waitDequeue(EVENT_USER_LOGIN);

            let saved = await getUserDAO(services).loadOne({
                profileId: 'Token',
                provider: AUTH_TOKEN
            });

            expect(user).to.deep.eq(saved);
        })

        // test('should notify EVENT_SYSTEM_STATUS_CHANGED upon login ', async () => {
        //     await context.queryOrCreateDevUser();
        //     await database.users.grantUserRoleByAuth('DevOps', 'dev.token', 'god');
        //
        //     let session = await context.newSession().login();
        //
        //     // login and session events
        //     let message = await session.dequeMessage();
        //     message = await session.dequeMessage();
        //
        //     // status event
        //     message = await session.dequeMessage();
        //     expect(message.isEmpty).to.be.true;
        //     expect(message.isEvent).to.be.true;
        //     expect(message.event).to.eq(EVENT_SYSTEM_STATUS_CHANGED);
        // })

        test('should not logout if not logged gin', async () => {
            const urls = getFullHostUrls(services);
            await request()
                .post(urls[URL_LOGOUT])
                .expect(401);
        })

        // test('should not logout with bad csrf', async () => {
        //
        // })

        test('should logout', async () => {
            const urls = getFullHostUrls(services);
            await request()
                .post(urls[URL_LOGOUT])
                .expect(401);

            const {context, body} = await loginWithToken();

            await request(context)
                .post(urls[URL_LOGOUT])
                .expect(200);
        })

        // test('should logout (helper)', async () => {
        //     let session = await context
        //         .newSession()
        //         .login();
        //
        //     await session
        //         .request()
        //         .get(urls[URL_PROFILE])
        //         .expect(200);
        //
        //     await session
        //         .logout()
        //         .request()
        //         .get(urls[URL_PROFILE])
        //         .expect(401);
        // })
    })
})