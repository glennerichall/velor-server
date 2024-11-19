// import {uuidPattern} from "../helpers/utils/constants.mjs";
// import {
//     EVENT_APIKEY_CREATED,
//     EVENT_APIKEY_DELETED
// } from "../../src/shared/constants/events.mjs";
// import {
//     URL_API_KEY,
//     URL_API_KEYS
// } from "../../src/shared/constants/urls.mjs";
// import {getFullHostUrls} from "../../src/server/application/services/requestServices.mjs";
// import {getDatabase} from "../../src/backend/application/services/backendServices.mjs";
// import {addSeconds} from "date-fns";
// import {setupTestContext} from "../fixtures/setupTestContext.mjs";
//
// const {test, expect} = setupTestContext();
//
// test.describe('rest-api', function () {
//     let context, database, urls;
//
//     test.beforeEach(async ({backendContext}) => {
//         context = backendContext;
//         database = getDatabase(context);
//         urls = getFullHostUrls(context);
//         await database.users.grantUserRoleByAuth('DevOps', 'dev.token', 'god');
//     })
//
//     test.describe('api-keys', () => {
//
//         test('should create api key', async () => {
//             const response = await context
//                 .newSession()
//                 .login()
//                 .request()
//                 .post(urls[URL_API_KEYS])
//                 .send({name: 'toto key'})
//                 .expect(201);
//
//             expect(response.body).to.have.property('name', "toto key");
//             expect(response.body).to.have.property('value');
//             expect(response.body).to.have.property('creation');
//             expect(response.body).to.have.property('id');
//             expect(response.body.value).to.match(uuidPattern);
//
//             let date = new Date(response.body.creation);
//             let now = new Date();
//             now = addSeconds(now, 1);
//             expect(date).to.be.below(now);
//             now = addSeconds(now, -2);
//             expect(date).to.be.above(now);
//             expect(Object.keys(response.body)).to.have.length(4);
//         })
//
//         test('should not create api key if not logged in', async () => {
//             await context
//                 .newSession()
//                 .request()
//                 .post(urls[URL_API_KEYS])
//                 .send({name: 'toto key'})
//                 .expect(403);
//         })
//
//         test('should not create api key if not authorized', async () => {
//             await database.users.revokeUserRole('DevOps', 'dev.token', 'god');
//             await context
//                 .newSession()
//                 .login()
//                 .request()
//                 .post(urls[URL_API_KEYS])
//                 .send({name: 'toto key'})
//                 .expect(403);
//         })
//
//         test('should get api key info', async () => {
//             const session = await context
//                 .newSession()
//                 .login();
//
//             let response = await session
//                 .request()
//                 .post(urls[URL_API_KEYS])
//                 .send({name: 'tototo key'})
//                 .expect(201);
//
//             const apiKey = response.body.value;
//             const apiKeyId = response.body.id;
//             response = await session.request()
//                 .get(urls[URL_API_KEY].replace(':key', apiKeyId))
//                 .expect(200);
//
//             expect(response.body).to.have.property('name', 'tototo key');
//             expect(response.body).to.have.property('creation');
//             expect(response.body).to.have.property('id');
//             const date = new Date(response.body.creation);
//             let now = new Date();
//             now = addSeconds(now, 1);
//             expect(date).to.be.below(now);
//             now = addSeconds(now, -2);
//             expect(date).to.be.above(now);
//             expect(Object.keys(response.body)).to.have.length(3);
//         })
//
//         test('should not get not owned key', async () => {
//             const session = await context
//                 .newSession()
//                 .login();
//
//             let response = await session
//                 .request()
//                 .post(urls[URL_API_KEYS])
//                 .send({name: 'tototo key'})
//                 .expect(201);
//
//             const apiKey = response.body.value;
//             const apiKeyId = response.body.id;
//
//             const user = await session.getUser();
//
//             await database.queryRaw(`delete from ${database.schema}.users_api_keys where user_id=$1`, [user.id]);
//             const apiKeyInDb = await database.apiKeys.queryApiKeyByValue(apiKey);
//             expect(apiKeyInDb).to.not.be.null;
//
//             response = await session
//                 .request()
//                 .get(urls[URL_API_KEY].replace(':key', apiKeyId))
//                 .expect(404);
//         })
//
//         test('should not get api key if not logged in', async () => {
//             let response = await context
//                 .newSession()
//                 .login()
//                 .request()
//                 .post(urls[URL_API_KEYS])
//                 .send({name: 'tototo key'})
//                 .expect(201);
//
//             const apiKey = response.body.value;
//             const apiKeyId = response.body.id;
//             await context
//                 .newSession()
//                 .request()
//                 .get(urls[URL_API_KEY].replace(':key', apiKeyId))
//                 .expect(401);
//         })
//
//         test('should notify user when api key created', async () => {
//             const session = await context
//                 .newSession()
//                 .login();
//
//             await session
//                 .request()
//                 .post(urls[URL_API_KEYS])
//                 .send({name: 'tototo key'})
//                 .expect(201);
//
//             const message = await session.dequeMessage();
//             expect(message.isEvent).to.be.true;
//             expect(message.event === EVENT_APIKEY_CREATED);
//
//         })
//
//         test('should delete api key', async () => {
//             const session = await context
//                 .newSession()
//                 .login();
//
//             let response = await session
//                 .request()
//                 .post(urls[URL_API_KEYS])
//                 .send({name: 'tototo key'})
//                 .expect(201);
//
//             const apiKey = response.body.value;
//             const apiKeyId = response.body.id;
//
//             response = await session
//                 .request()
//                 .delete(urls[URL_API_KEY].replace(':key', apiKeyId))
//                 .expect(200);
//
//             expect(response.body).to.have.property('name', 'tototo key');
//             expect(response.body).to.have.property('creation');
//             const date = new Date(response.body.creation);
//             let now = new Date();
//             now = addSeconds(now, 1);
//             expect(date).to.be.below(now);
//             now = addSeconds(now, -2);
//             expect(date).to.be.above(now);
//             expect(Object.keys(response.body)).to.have.length(3);
//         })
//
//         test('should not delete not owned key', async () => {
//             const session = await context
//                 .newSession()
//                 .login();
//
//             let response = await session
//                 .request()
//                 .post(urls[URL_API_KEYS])
//                 .send({name: 'tototo key'})
//                 .expect(201);
//
//             const apiKey = response.body.value;
//             const apiKeyId = response.body.id;
//             const user = await session.getUser();
//
//             await database.queryRaw(`delete from  ${database.schema}.users_api_keys where user_id=$1`, [user.id]);
//             let apiKeyInDb = await database.apiKeys.queryApiKeyByValue(apiKey);
//             expect(apiKeyInDb).to.not.be.null;
//
//             response = await session
//                 .request()
//                 .delete(urls[URL_API_KEY].replace(':key', apiKeyId))
//                 .expect(404);
//
//             apiKeyInDb = await database.apiKeys.queryApiKeyByValue(apiKey);
//             expect(apiKeyInDb).to.not.be.null;
//         })
//
//         test('should not delete api key if not logged in', async () => {
//             let response = await context
//                 .newSession()
//                 .login()
//                 .request()
//                 .post(urls[URL_API_KEYS])
//                 .send({name: 'tototo key'})
//                 .expect(201);
//
//             const apiKey = response.body.value;
//             const apiKeyId = response.body.id;
//             await context
//                 .newSession()
//                 .request()
//                 .delete(urls[URL_API_KEY].replace(':key', apiKeyId))
//                 .expect(401);
//         })
//
//         test('should notify user when api key deleted', async () => {
//             const session = await context
//                 .newSession()
//                 .login();
//
//             const response = await session
//                 .request()
//                 .post(urls[URL_API_KEYS])
//                 .send({name: 'tototo key'})
//                 .expect(201);
//
//             const apiKey = response.body.value;
//             const apiKeyId = response.body.id;
//
//             await session
//                 .request()
//                 .delete(urls[URL_API_KEY].replace(':key', apiKeyId))
//                 .expect(200);
//
//             const message = await session.dequeMessage();
//             expect(message.isEvent).to.be.true;
//             expect(message.event === EVENT_APIKEY_DELETED);
//         })
//     })
//
// })