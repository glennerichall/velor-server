import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {addSeconds} from "date-fns";
import {uuidPattern} from "./contrib/constants.mjs";
import {URL_API_KEYS} from "velor-contrib/contrib/urls.mjs";
import {getFullHostUrls} from "../application/services/constants.mjs";
import {getDataFromResponse} from "velor-api/api/ops/getDataFromResponse.mjs";
import {
    getApiKeyDAO,
    getUserDAO
} from "velor-dbuser/application/services/services.mjs";
import {userTest0} from "./contrib/userTest0.mjs";
import {getInstanceBinder} from "velor-services/injection/ServicesContext.mjs";
import {s_eventHandler} from "../application/services/serviceKeys.mjs";
import sinon from "sinon";
import {api} from "./fixtures/api.mjs";

const {test, expect, beforeEach} = setupTestContext();

test.describe('rest-api', function () {

    beforeEach(async ({services}) => {
        // mock event handler to ignore login events
        getInstanceBinder(services).setInstance(s_eventHandler, {
            handleEvent: sinon.stub()
        })
    })

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
                .loadOne({userTest: userTest0, publicId: response.body.id});

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

        test.skip('should not create api key if not authorized', async () => {
            const {context} = await api.loginWithToken();

            // await database.users.revokeUserRole('DevOps', 'dev.token', 'god');
            // await context
            //     .newSession()
            //     .login()
            //     .request()
            //     .post(urls[URL_API_KEYS])
            //     .send({name: 'toto key'})
            //     .expect(403);
        })

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
            await getUserDAO(services).loseApiKey(userTest0, {publicId: apiKeyId});
            let response = await api.apiKeys(context).getOne(apiKeyId);
            expect(response.status).to.eq(404);
        })

        test('should not get api key if not logged in', async ({api, services}) => {
            const {context} = await api.getCsrfToken();
            let apiKey = await getDataFromResponse(
                api.apiKeys(context).create({name: 'tototo key'})
            );
            const apiKeyId = apiKey.id;
            let response = await api.apiKeys(context).getOne(apiKeyId);
            expect(response.status).to.eq(401);
        })

        test('should delete api key', async ({api, services}) => {
            const {context} = await api.loginWithToken();
            let apiKey = await getDataFromResponse(
                api.apiKeys(context).create({name: 'tototo key'})
            );

            let loaded = await getApiKeyDAO(services).loadOne(apiKey);
            expect(loaded).to.not.be.undefined;

            const apiKeyId = apiKey.id;

            let response = await getDataFromResponse(
                api.apiKeys(context).delete(apiKeyId)
            );

            expect(response).to.have.property('name', 'tototo key');
            expect(response).to.have.property('creation');
            const date = new Date(response.creation);
            let now = new Date();
            now = addSeconds(now, 1);
            expect(date).to.be.below(now);
            now = addSeconds(now, -2);
            expect(date).to.be.above(now);
            expect(Object.keys(response)).to.have.length(4);

            let none = await getApiKeyDAO(services).loadOne(apiKey);
            expect(none).to.be.null;

        })

        test('should not delete api key if not logged in', async ({api, services}) => {
            let {context} = await api.loginWithToken();
            let apiKey = await getDataFromResponse(
                api.apiKeys(context).create({name: 'tototo key'})
            );

            const apiKeyId = apiKey.id;

            let loaded = await getApiKeyDAO(services).loadOne(apiKey);
            expect(loaded).to.not.be.undefined;

            ({context} = await api.getCsrfToken());
            let response = await api.apiKeys(context).delete(apiKeyId);
            expect(response).to.have.property('status', 401);

            loaded = await getApiKeyDAO(services).loadOne(apiKey);
            expect(loaded).to.not.be.undefined;
        })

        test('should not delete not owned key', async ({api, services}) => {
            let {context} = await api.loginWithFirstToken();
            let apiKey = await getDataFromResponse(
                api.apiKeys(context).create({name: 'tototo key'})
            );

            const apiKeyId = apiKey.id;

            let loaded = await getApiKeyDAO(services).loadOne(apiKey);
            expect(loaded).to.not.be.undefined;

            ({context} = await api.loginWithSecondToken());
            let response = await api.apiKeys(context).delete(apiKeyId);
            expect(response).to.have.property('status', 404);

            loaded = await getApiKeyDAO(services).loadOne(apiKey);
            expect(loaded).to.not.be.undefined;
        })
    })

})