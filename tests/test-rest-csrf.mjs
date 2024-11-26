import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getFullHostUrls} from "../application/services/requestServices.mjs";
import {URL_CSRF} from "velor-contrib/contrib/urls.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('csrf', function () {
    let services,
        request,
        loginWithToken;

    beforeEach(async ({rest}) => {
        ({
            services,
            request,
            loginWithToken
        } = rest);
    })

    it('should get a csrf token', async () => {
        let urls = getFullHostUrls(services);
        const response = await request()
            .get(urls[URL_CSRF])
            .expect(200);

        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('csrfToken');

        let csrfCookie = response.context.cookies["__Host-psifi.x-csrf-token"];
        expect(response.body.csrfToken).to.equal(csrfCookie.split('%')[0]);
    })

    it('should validate csrf token', async () => {
        let urls = getFullHostUrls(services);
        const {context: {cookies}, body: {csrfToken}} = await request()
            .get(urls[URL_CSRF])
            .expect(200);

        await request()
            .post('/validate-csrf')
            .setCookies(cookies)
            .setCsrfToken(csrfToken)
            .expect(200);
    })

    it('should have request test submit cookies and csrf token', async () => {
        let urls = getFullHostUrls(services);
        const {context} = await request()
            .get(urls[URL_CSRF])
            .expect(200);

        await request(context)
            .post('/validate-csrf')
            .expect(200);
    })

    it('should protect from invalid csrf token', async () => {
        let urls = getFullHostUrls(services);
        let {context: {cookies}, body: {csrfToken}} = await request()
            .get(urls[URL_CSRF])
            .expect(200);

        let badCsrfToken = 'aa' + csrfToken.substring(2);

        await request()
            .post('/validate-csrf')
            .setCookies(cookies)
            .setCsrfToken(badCsrfToken)
            .expect(403);

        await request()
            .post('/validate-csrf')
            .setCsrfToken(csrfToken)
            .expect(403);
    })

    it('should set error code', async () => {
        await request()
            .post('/validate-csrf')
            .expect(403)
            .expect({
                message: 'invalid csrf token',
                code: 'E_BAD_CSRF_TOKEN'
            });
    })

    it('should get a new csrf token', async()=> {
        let urls = getFullHostUrls(services);
        const {context: ctx1} = await request()
            .get(urls[URL_CSRF])
            .expect(200);

        const {context: ctx2} = await request(ctx1)
            .get(urls[URL_CSRF])
            .expect(200);

        await request(ctx2)
            .post('/validate-csrf')
            .expect(200);

        expect(ctx2.csrf).to.not.eq(ctx1.csrf);
    })

})
