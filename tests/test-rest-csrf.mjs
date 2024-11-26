import {setupTestContext} from "./fixtures/setupTestContext.mjs";

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

    it('should get a csrf token', async()=> {

    })

})
