import {getFullHostUrls} from "../application/services/requestServices.mjs";
import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {AUTH_TOKEN_SECRET} from "../application/services/serverEnvKeys.mjs";
import {createRouterBuilder} from "../core/createRouterBuilder.mjs";
import {createAuthConfiguration} from "../routes/auth.mjs";
import request from 'supertest';
import {getExpressApp} from "../application/services/serverServices.mjs";
import {setupExpressApp} from "../initialization/setupExpressApp.mjs";
import {getTokenLoginUrl} from "velor-contrib/contrib/getUrl.mjs";
import {AUTH_TOKEN} from "velor-contrib/contrib/authProviders.mjs";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {composeSessionParser} from "../auth/composeSessionParser.mjs";
import {patchPassport} from "../auth/patchPassport.mjs";
import {URL_LOGIN_SUCCESS} from "velor-contrib/contrib/urls.mjs";
import passport from "passport";


const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('login', function () {
    let services, application;

    beforeEach(async ({services: s}) => {
        services = s;
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
            .use(session)
            .use(patchPassport)
            .use(passport.initialize())
            .use(passport.session())
            .use('/auth', router);

        // setup must be called after routes have been mounted
        await setupExpressApp(services);
    })

    function loginWithToken(services) {
        let urls = getFullHostUrls(services);
        let application = getExpressApp(services);
        return request(application)
            .get(getTokenLoginUrl(urls))
            .set('Authorization', getEnvValue(services, AUTH_TOKEN_SECRET));
    }

    test.describe('login', () => {

        test('should login with token credentials', async () => {
            let urls = getFullHostUrls(services);
            await loginWithToken(services)
                .expect(302)
                .expect('location', urls[URL_LOGIN_SUCCESS]);
        })

        test('should have normal role', async () => {
            await loginWithToken(services);
            const profile = await getProfileManager(context).getProfile();
            expect(profile).to.have.property('roles');
            expect(profile.roles).to.have.length(1);
            expect(profile.roles[0]).to.eq('normal');
        })

        // test('should not login without session', async () => {
        //     await context.request()
        //         .get(urls[URL_LOGIN].replace(':provider', GOOGLE))
        //         .expect(403);
        // })

        //
        // test('should not login with bad token credentials', async () => {
        //     await context.newSession()
        //         .request()
        //         .get(urls[URL_LOGIN].replace(':provider', 'token'))
        //         .set('Authorization', 'toto')
        //         .expect(401);
        // })
        //
        //
        // test('should not create user twice', async () => {
        //     let session = await context.newSession().login();
        //     let sessionUser = await session.getUser();
        //
        //     // the session will not be mutated (ie test keeps the login cookie)
        //     // since in the session helper, every action creates
        //     // a new instance of session helper.
        //     await session.request()
        //         .post(urls[URL_LOGOUT])
        //         .expect(200);
        //
        //     // effectively logout
        //     session = await session.logout();
        //
        //     expect(await session.getUser()).to.be.null;
        //
        //     // session should not be authenticated
        //     await session.request()
        //         .get(urls[URL_PROFILE])
        //         .expect(401);
        //
        //     // logging out should not delete the user
        //     const user = await database.users.queryForUserById(sessionUser.id);
        //     expect(user).to.not.be.null;
        // })
        //
        // test("should not send mail with magic link without session", async () => {
        //     const url = urls[URL_LOGIN].replace(':provider', MAGIC_LINK);
        //     await context.request()
        //         .get(url)
        //         .send({email: 'johndoe@dead.com'})
        //         .expect(403);
        // })
        //
        // test("should send mail with magic link", async () => {
        //     let called = false;
        //
        //     let session = await context.newSession();
        //
        //     const promise = onMagiclinkReceived(async (url, msg) => {
        //         expect(msg).to.have.property('from', 'zupfe@velor.ca');
        //         expect(msg).to.have.property('to', 'johndoe@dead.com');
        //         expect(msg).to.have.property('subject', 'ZupFe sign-in');
        //         expect(msg).to.have.property('text');
        //         expect(msg.text).to.include('Your request id is');
        //         expect(msg.text).to.include('Link can only be used once and will expire in 10 minutes');
        //         expect(msg.text).to.include(`${env.ZUPFE_AUTH_CALLBACK_BASE_URL}/api/v1/auth/redirect/magiclink?token=`);
        //         called = true;
        //     });
        //
        //     const url = urls[URL_LOGIN].replace(':provider', MAGIC_LINK);
        //     await session
        //         .request()
        //         .get(url)
        //         .send({email: 'johndoe@dead.com'});
        //
        //     await promise;
        //
        //     expect(called).to.be.true;
        // })
        //
        // test("should set email verified magiclink", async () => {
        //     const email = 'johndoe@dead.com';
        //
        //     const rows = await database.queryRaw(`select * from ${database.schema}.auths where auth_id=$1`, [email]);
        //     expect(rows).to.have.length(0);
        //
        //     await context.newSession()
        //         .loginWithMagicLink(email, async (url, msg, accept) => {
        //             await accept();
        //             const rows = await database.queryRaw(`select * from ${database.schema}.auths where auth_id=$1`, [email]);
        //             expect(rows).to.have.length(1);
        //             const auth = rows[0];
        //             expect(auth).to.have.property('email', email);
        //             expect(auth).to.have.property('verified', true);
        //             expect(auth).to.have.property('displayname', 'johndoe');
        //             expect(auth).to.have.property('provider', 'magiclink');
        //             expect(auth).to.have.property('active', true);
        //         })
        // })
        //
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
        //
        // test("should login with magic link", async () => {
        //     await context.newSession()
        //         .loginWithMagicLink('johndoe@jane.com')
        //         .request()
        //         .get(urls[URL_PROFILE])
        //         .expect(200);
        // })
        //
        // test("should ask to login through ws if test is not on the same session (check socket msg)", async () => {
        //     const session = await context.newSession();
        //     await session.dequeMessage();
        //
        //     let called = false;
        //     const linkPromise = onMagiclinkReceived(async (url, msg) => {
        //         // from within another browser or even another computer
        //         let response = context.request().get(url).expect(302);
        //
        //         let message = await session.dequeMessage();
        //
        //         expect(message).to.have.property('command', RPC_REQUIRE_LOGIN);
        //         expect(message).to.have.property('isJson', true);
        //         expect(message.json()).to.have.property('url', url);
        //
        //         await session.request().get(url).expect(302);
        //
        //         let {buffer} = getMessageBuilder(context).newReply(message, {status: 200});
        //         session.sessionWs.send(buffer);
        //
        //         response = await response;
        //
        //         expect(response.headers['location']).to
        //             .eq(`${env.ZUPFE_BACKEND_URL}/api/v1/auth/login_success`);
        //
        //         called = true;
        //         return response;
        //     });
        //
        //     const url = urls[URL_LOGIN].replace(':provider', MAGIC_LINK);
        //
        //     await session
        //         .request()
        //         .get(url)
        //         .send({email: 'johndoe@dead.com'});
        //
        //     await linkPromise;
        //     expect(called).to.be.true;
        // })
        //
        // test("should ask to login through ws if test is not on the same session (check the flash error message)", async () => {
        //
        //     const session = await context.newSession();
        //     await session.dequeMessage();
        //     let called = false;
        //     const linkPromise = onMagiclinkReceived(async (url, msg) => {
        //         let response = context.request().get(url).expect(302);
        //         let message = await session.dequeMessage();
        //         await session.request().get(url).expect(302);
        //         let {buffer} = getMessageBuilder(context).newReply(message, {status: 400, info: 'a toto was received'});
        //         session.sessionWs.send(buffer);
        //
        //         response = await response;
        //
        //         expect(response.headers['location']).to
        //             .eq(`${env.ZUPFE_BACKEND_URL}/api/v1/auth/login_failure`);
        //
        //         response = await context
        //             .request()
        //             .set('cookie', response.headers['set-cookie'])
        //             .get(urls[URL_FLASH_ERROR])
        //             .expect(200);
        //
        //         expect(response.body).to.have.length(1);
        //         expect(response.body[0]).to
        //             .eq('a toto was received');
        //
        //         called = true;
        //         return response;
        //     });
        //
        //     const url = urls[URL_LOGIN].replace(':provider', MAGIC_LINK);
        //
        //     await session
        //         .request()
        //         .get(url)
        //         .send({email: 'johndoe@dead.com'});
        //
        //     await linkPromise;
        //     expect(called).to.be.true;
        //
        //     await session
        //         .request()
        //         .get(urls[URL_PROFILE])
        //         .expect(401);
        // })
        //
        // test('should notify EVENT_LOGGED_IN upon login ', async () => {
        //     const session = await context.newSession().login();
        //     await session.dequeMessage();
        //     const message = await session.dequeMessage();
        //
        //     expect(message.isEmpty).to.be.true;
        //     expect(message.isEvent).to.be.true;
        //     expect(message.event).to.eq(EVENT_LOGGED_IN);
        // })
        //
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
        //
        // test('should not logout if not loggin', async () => {
        //     await context.newSession()
        //         .request()
        //         .post(urls[URL_LOGOUT])
        //         .expect(401);
        // })
        //
        // test('should not logout with bad csrf', async () => {
        //
        // })
        //
        // test('should logout', async () => {
        //     await context
        //         .newSession()
        //         .login()
        //         .request()
        //         .post(urls[URL_LOGOUT])
        //         .expect(200);
        // })
        //
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