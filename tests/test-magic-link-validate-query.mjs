import sinon from "sinon";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {validateMagicLink} from "../passport/strategies/magiclink/validateMagicLink.mjs";
import {E_BAD_LOGIN_TOKEN} from "velor-contrib/contrib/errors.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {URL_LOGIN_FAILURE} from "velor-contrib/contrib/urls.mjs";
import {encryptText} from "velor-utils/utils/encryption.mjs";
import {s_magicLinkEncryption} from "../application/services/serverServiceKeys.mjs";
import {
    identOp,
} from "velor-utils/utils/functional.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

test.describe('validateMagicLink function', () => {

    test('It should redirect to loginFailureUrl with error if req.query.ws is missing', async ({page}) => {
        const req = {
            flash: sinon.spy(),
            query: {},
            redirect: sinon.spy(),
            services: createAppServicesInstance({
                constants: {
                    endpoints: {
                        [URL_LOGIN_FAILURE]: '/loginFailure'
                    }
                },
                factories: {
                    [s_magicLinkEncryption]: sinon.stub().returns(
                        {
                            encryptObject: identOp,
                            decryptObject: identOp,
                        }
                    )
                }
            })
        };
        const res = {redirect: sinon.spy()};
        const next = sinon.spy();


        await validateMagicLink(req, res, next);
        expect(req.flash.callCount).to.eq(1);
        expect(req.flash).calledWith('error', E_BAD_LOGIN_TOKEN);
        expect(res.redirect).calledWith('/loginFailure');
    });

    test('It should call the next middleware when req.query.ws is valid', async ({page}) => {
        const req = {
            flash: sinon.spy(),
            query: {ws: '{"ws":"valid_token"}'},
            redirect: sinon.spy(),
            services: createAppServicesInstance({
                constants: {
                    endpoints: {
                        [URL_LOGIN_FAILURE]: '/loginFailure'
                    }
                },
                factories: {
                    [s_magicLinkEncryption]: sinon.stub().returns(
                        {
                            encryptObject: identOp,
                            decryptObject: token=>JSON.parse(token),
                        }
                    )
                }
            })
        };
        const res = {redirect: sinon.spy()};
        const next = sinon.spy();

        await validateMagicLink(req, res, next);
        expect(next.callCount).to.eq(1);
    });

    test('It should redirect to loginFailureUrl with error if req.query.ws is invalid', async ({page}) => {
        const req = {
            flash: sinon.spy(),
            query: {ws: 'invalid_token'},
            redirect: sinon.spy(),
            services: createAppServicesInstance({
                constants: {
                    endpoints: {
                        [URL_LOGIN_FAILURE]: '/loginFailure'
                    }
                },
                factories: {
                    [s_magicLinkEncryption]: sinon.stub().returns(
                        {
                            encryptObject: identOp,
                            decryptObject: sinon.stub().throws(new Error()),
                        }
                    )
                }
            })
        };
        const res = {redirect: sinon.spy()};
        const next = sinon.spy();

        await validateMagicLink(req, res, next);
        expect(req.flash.callCount).to.eq(1);
        expect(req.flash).calledWith('error', E_BAD_LOGIN_TOKEN);
        expect(res.redirect).calledWith('/loginFailure');
    });

    test('It should redirect to loginFailureUrl with error if json parsse req.query.ws throws', async ({page}) => {
        const req = {
            flash: sinon.spy(),
            query: {ws: '{bad json'},
            redirect: sinon.spy(),
            services: createAppServicesInstance({
                constants: {
                    endpoints: {
                        [URL_LOGIN_FAILURE]: '/loginFailure'
                    }
                },
                factories: {
                    [s_magicLinkEncryption]: sinon.stub().returns(
                        {
                            encryptObject: identOp,
                            decryptObject: identOp,
                        }
                    )
                }
            })
        };
        const res = {redirect: sinon.spy()};
        const next = sinon.spy();

        await validateMagicLink(req, res, next);
        expect(req.flash.callCount).to.eq(1);
        expect(req.flash).calledWith('error', E_BAD_LOGIN_TOKEN);
        expect(res.redirect).calledWith('/loginFailure');
    });

});