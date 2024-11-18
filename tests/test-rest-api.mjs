import {urls} from "../helpers/backend/urls.mjs";
import {timeoutAsync} from "velor/utils/sync.mjs";

import {getDatabase} from "../../src/backend/application/services/backendServices.mjs";
import {getEnvironment} from "velor/utils/injection/baseServices.mjs";
import {setupTestContext} from "../fixtures/setupTestContext.mjs";

const {test, expect} = setupTestContext();

test.describe('rest-api', function () {
    let context, database, env;

    test.beforeEach(async ({backendContext}) => {
        context = backendContext;
        database = getDatabase(backendContext);
        env = getEnvironment(backendContext);
    });

    async function waitForLogCount(n) {
        // we wait to see if eventually all is logged in as test.afterAll being logged, the
        // browser gets the success page
        let rows;
        while (true) {
            rows = await database.queryRaw('select * from test.access');
            if (rows.length === n) break;
            await timeoutAsync(500);
        }

        return rows;
    }

    test.describe('api', () => {
        test('should get api without hostname', async () => {
            let response = await context
                .request()
                .get(`/api/version?host=off`);
            expect(response.body).to.deep.eq({
                api: {
                    version: 'v1',
                    urls
                },
                "version": env.ZUPFE_VERSION
            });
        })

        test('should get api with hostname', async () => {
            // had the bug where https://localhost:3004 was appended every time this route
            // was called
            for (let i = 0; i < 3; i++) {
                let response = await context
                    .request()
                    .get(`/api/version`);

                expect(response.body).to.deep.eq({
                    api: {
                        version: 'v1',
                        urls: Object.keys(urls).reduce((acc, key) => {
                            acc[key] = env.ZUPFE_BACKEND_URL + urls[key];
                            return acc;
                        }, {})
                    },
                    version: env.ZUPFE_VERSION
                });
            }
        })

        test.skip('should log all access', async () => {
            await waitForLogCount(0);

            let response = await context
                .request()
                .get('/api/version')
                .expect(200);

            let rows = await waitForLogCount(1);

            expect(rows[0]).excluding(['id', 'datetime']).to.deep.eq({
                "bv": process.env.ZUPFE_VERSION,
                "fingerprint": null,
                "fv": process.env.ZUPFE_VERSION,
                "ip": "::ffff:127.0.0.1",
                "logged_in": null,
                "method": "GET",
                "resource": "/api/version",
                "user_id": null
            });
        })

        test.skip('should log session access', async () => {
            await waitForLogCount(0);

            await context.newSession();

            let rows = await waitForLogCount(1);

            expect(rows[0]).excluding(['id', 'datetime']).to.deep.eq({
                "bv": process.env.ZUPFE_VERSION,
                "fingerprint": '1234567',
                "fv": process.env.ZUPFE_VERSION,
                "ip": "::ffff:127.0.0.1",
                "logged_in": null,
                "method": "GET",
                "resource": "/api/v1/session",
                "user_id": null
            });
        })

        test.skip('should log login', async () => {
            await waitForLogCount(0);

            const session = await context.newSession();
            await session.login();

            let rows = await waitForLogCount(2);

            expect(rows[1]).excluding(['id', 'datetime']).to.deep.eq({
                "bv": process.env.ZUPFE_VERSION,
                "fingerprint": '1234567',
                "fv": process.env.ZUPFE_VERSION,
                "ip": "::ffff:127.0.0.1",
                "logged_in": false,
                "method": "GET",
                "resource": "/api/v1/auth/login/token",
                "user_id": null
            });
        })

        test.skip('should log user info', async () => {
            await waitForLogCount(0);

            await context.newSession()
                .login()
                .request()
                .get('/api/v1/preferences/files')
                .expect(200);

            let rows = await waitForLogCount(3);

            rows = rows.filter(row => row.resource === '/api/v1/preferences/files');
            expect(rows).to.have.length(1);

            const user = await context
                .newSession()
                .login()
                .getUser();

            expect(rows[0]).excluding(['id', 'datetime']).to.deep.eq({
                "bv": process.env.ZUPFE_VERSION,
                "fingerprint": '1234567',
                "fv": process.env.ZUPFE_VERSION,
                "ip": "::ffff:127.0.0.1",
                "logged_in": true,
                "method": "GET",
                "resource": "/api/v1/preferences/files",
                "user_id": user.id
            });
        })
    })

})