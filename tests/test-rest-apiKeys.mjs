import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {addSeconds} from "date-fns";
import {uuidPattern} from "./contrib/constants.mjs";
import {URL_API_KEYS} from "velor-contrib/contrib/urls.mjs";
import {getFullHostUrls} from "../application/services/constants.mjs";
import {getDataFromResponse} from "velor-api/api/ops/getDataFromResponse.mjs";
import {getUserDAO} from "velor-dbuser/application/services/services.mjs";
import {userTest} from "./contrib/userTest.mjs";

const {test, expect} = setupTestContext();

test.describe('rest-api', function () {

    test.describe('api-keys', () => {

        test('should create api key', async ({api, services, request}) => {

            const {context} = await api.loginWithToken();

            const urls = getFullHostUrls(services);

            const response = await request(context)
                .post(urls[URL_API_KEYS])
                .send({name: 'toto key'})
                .expect(201);

            expect(response.body).to.have.property('name', "toto key");
            expect(response.body).to.have.property('value');
            expect(response.body).to.have.property('creation');
            expect(response.body).to.have.property('id');
            expect(response.body).to.have.property('lastUsed');
            expect(response.body.value).to.match(uuidPattern);

            let apiKey = await getUserDAO(services)
                .loadOne({userTest, publicId: response.body.id});

            let date = new Date(response.body.creation);
            let now = new Date();
            now = addSeconds(now, 1);
            expect(date).to.be.below(now);
            now = addSeconds(now, -2);
            expect(date).to.be.above(now);
            expect(Object.keys(response.body)).to.have.length(5);
        })

        test('should not create api key if not logged in', async ({api, services, request}) => {
            let {context} = await api.getCsrfToken();
            const urls = getFullHostUrls(services);

            await request(context)
                .post(urls[URL_API_KEYS])
                .send({name: 'toto key'})
                .expect(401);
        })

        // test('should not create api key if not authorized', async () => {
        //     const {context} = await api.loginWithToken();
        //
        //     await database.users.revokeUserRole('DevOps', 'dev.token', 'god');
        //     await context
        //         .newSession()
        //         .login()
        //         .request()
        //         .post(urls[URL_API_KEYS])
        //         .send({name: 'toto key'})
        //         .expect(403);
        // })

        test('should get api key info', async ({api, request, services}) => {
            const {context} = await api.loginWithToken();
            let apiKey = await getDataFromResponse(
                api.apiKeys(context).create({name: 'tototo key'})
            );
            const apiKeyId = apiKey.id;
            let response = await api.apiKeys(context).getOne(apiKeyId);

            expect(response.status).to.eq(200);

            response = await getDataFromResponse(response);

            expect(response).to.have.property('name', 'tototo key');
            expect(response).to.have.property('creation');
            expect(response).to.have.property('id');

            const date = new Date(response.creation);

            let now = new Date();
            now = addSeconds(now, 1);
            expect(date).to.be.below(now);
            now = addSeconds(now, -2);
            expect(date).to.be.above(now);
            expect(Object.keys(response)).to.have.length(4);
        })

        test('should not get not owned key', async ({api, services}) => {
            const {context} = await api.loginWithToken();
            let apiKey = await getDataFromResponse(
                api.apiKeys(context).create({name: 'tototo key'})
            );
            const apiKeyId = apiKey.id;
            await getUserDAO(services).loseApiKey(userTest, {publicId: apiKeyId});
            let response = await api.apiKeys(context).getOne(apiKeyId);
            expect(response.status).to.eq(404);
        })

        // test('should not get api key if not logged in', async () => {
        //     let response = await context
        //         .newSession()
        //         .login()
        //         .request()
        //         .post(urls[URL_API_KEYS])
        //         .send({name: 'tototo key'})
        //         .expect(201);
        //
        //     const apiKey = response.body.value;
        //     const apiKeyId = response.body.id;
        //     await context
        //         .newSession()
        //         .request()
        //         .get(urls[URL_API_KEY].replace(':key', apiKeyId))
        //         .expect(401);
        // })
        //
        // test('should notify user when api key created', async () => {
        //     const session = await context
        //         .newSession()
        //         .login();
        //
        //     await session
        //         .request()
        //         .post(urls[URL_API_KEYS])
        //         .send({name: 'tototo key'})
        //         .expect(201);
        //
        //     const message = await session.dequeMessage();
        //     expect(message.isEvent).to.be.true;
        //     expect(message.event === EVENT_APIKEY_CREATED);
        //
        // })
        //
        // test('should delete api key', async () => {
        //     const session = await context
        //         .newSession()
        //         .login();
        //
        //     let response = await session
        //         .request()
        //         .post(urls[URL_API_KEYS])
        //         .send({name: 'tototo key'})
        //         .expect(201);
        //
        //     const apiKey = response.body.value;
        //     const apiKeyId = response.body.id;
        //
        //     response = await session
        //         .request()
        //         .delete(urls[URL_API_KEY].replace(':key', apiKeyId))
        //         .expect(200);
        //
        //     expect(response.body).to.have.property('name', 'tototo key');
        //     expect(response.body).to.have.property('creation');
        //     const date = new Date(response.body.creation);
        //     let now = new Date();
        //     now = addSeconds(now, 1);
        //     expect(date).to.be.below(now);
        //     now = addSeconds(now, -2);
        //     expect(date).to.be.above(now);
        //     expect(Object.keys(response.body)).to.have.length(3);
        // })
        //
        // test('should not delete not owned key', async () => {
        //     const session = await context
        //         .newSession()
        //         .login();
        //
        //     let response = await session
        //         .request()
        //         .post(urls[URL_API_KEYS])
        //         .send({name: 'tototo key'})
        //         .expect(201);
        //
        //     const apiKey = response.body.value;
        //     const apiKeyId = response.body.id;
        //     const user = await session.getUser();
        //
        //     await database.queryRaw(`delete from  ${database.schema}.users_api_keys where user_id=$1`, [user.id]);
        //     let apiKeyInDb = await database.apiKeys.queryApiKeyByValue(apiKey);
        //     expect(apiKeyInDb).to.not.be.null;
        //
        //     response = await session
        //         .request()
        //         .delete(urls[URL_API_KEY].replace(':key', apiKeyId))
        //         .expect(404);
        //
        //     apiKeyInDb = await database.apiKeys.queryApiKeyByValue(apiKey);
        //     expect(apiKeyInDb).to.not.be.null;
        // })
        //
        // test('should not delete api key if not logged in', async () => {
        //     let response = await context
        //         .newSession()
        //         .login()
        //         .request()
        //         .post(urls[URL_API_KEYS])
        //         .send({name: 'tototo key'})
        //         .expect(201);
        //
        //     const apiKey = response.body.value;
        //     const apiKeyId = response.body.id;
        //     await context
        //         .newSession()
        //         .request()
        //         .delete(urls[URL_API_KEY].replace(':key', apiKeyId))
        //         .expect(401);
        // })
        //
        // test('should notify user when api key deleted', async () => {
        //     const session = await context
        //         .newSession()
        //         .login();
        //
        //     const response = await session
        //         .request()
        //         .post(urls[URL_API_KEYS])
        //         .send({name: 'tototo key'})
        //         .expect(201);
        //
        //     const apiKey = response.body.value;
        //     const apiKeyId = response.body.id;
        //
        //     await session
        //         .request()
        //         .delete(urls[URL_API_KEY].replace(':key', apiKeyId))
        //         .expect(200);
        //
        //     const message = await session.dequeMessage();
        //     expect(message.isEvent).to.be.true;
        //     expect(message.event === EVENT_APIKEY_DELETED);
        // })
    })

})