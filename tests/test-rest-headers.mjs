import {URL_SESSION} from "../../src/shared/constants/urls.mjs";
import {getFullHostUrls} from "../../src/server/application/services/requestServices.mjs";
import {setupTestContext} from "../fixtures/setupTestContext.mjs";

const {test, expect} = setupTestContext();

test.describe('rest-api', function () {
    let context, urls;

    test.beforeEach(async ({backendContext}) => {
        context = backendContext;
        urls = getFullHostUrls(context);
    })

    test.describe("headers", () => {
        test("should set access-control-allow-credentials", async () => {
            const response = await context.request()
                .get('/api/version')
                .expect(200);

            expect(response.headers).to.nested.include.deep({
                    'access-control-allow-credentials': 'true',
                    'content-type': 'application/json; charset=utf-8',
                }
            );
        })

        test('should provide x-fpu', async () => {
            await context.request()
                .get(urls[URL_SESSION])
                .expect(400);
        })

        test('should be 200 when x-fpu', async () => {
            await context.request()
                .get(urls[URL_SESSION])
                .set('X-fpu', '1234567')
                .expect(200);
        })
    })
})