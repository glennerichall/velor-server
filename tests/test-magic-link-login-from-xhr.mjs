import sinon from "sinon";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {composeLoginFromXHR} from "../passport/strategies/magiclink/composeLoginFromXHR.mjs";
import {ErrorCode} from "../core/ErrorCode.mjs";
import {
    E_INTERNAL_ERROR,
    E_SESSION_EXPIRED
} from "velor-contrib/contrib/errors.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {s_clientProvider} from "velor-distribution/application/services/distributionServiceKeys.mjs";
import {s_messageFactory} from "../application/services/serverServiceKeys.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();
describe('composeLoginFromXHR Function', () => {

    it('should return a json response', async () => {
        let response = {
            status: 200
        };
        const getClientProviderMock = sinon.stub().returns({
            getSubscriptionCount: sinon.stub().resolves(1),
            getClient: sinon.stub().resolves({
                submit: sinon.stub().resolves({
                    isJson: true,
                    json: sinon.stub().returns(response)
                })
            })
        });
        const servicesMock = createAppServicesInstance({
            factories: {
                [s_clientProvider]: getClientProviderMock,
                [s_messageFactory]: sinon.stub().returns({requireLogin: sinon.stub()})
            }
        });

        const loginFromXHR = composeLoginFromXHR(servicesMock);

        const result = await loginFromXHR("mockSessionId");
        expect(result).to.equal(response);
    });

    it('should throw an error if subscription count is less than 1', async () => {
        const getClientProviderMock = sinon.stub().returns({getSubscriptionCount: sinon.stub().resolves(0)});
        const getMessageFactoryMock = sinon.stub();
        const servicesMock = createAppServicesInstance({
            factories: {
                [s_clientProvider]: getClientProviderMock,
                [s_messageFactory]: getMessageFactoryMock
            }
        });

        const loginFromXHR = composeLoginFromXHR(servicesMock);

        await expect(loginFromXHR("mockSessionId")).to.be.rejected.then(error => {
            expect(error).to.be.an.instanceof(ErrorCode);
            expect(error.message).to.equal("The browser session who initiated the login request was closed");
            expect(error.errorCode).to.equal(E_SESSION_EXPIRED);
        });
    });

    it('should throw an internal server error', async () => {
        const getClientProviderMock = sinon.stub().returns({
            getSubscriptionCount: sinon.stub().resolves(1),
            getClient: sinon.stub().resolves({
                submit: sinon.stub().resolves({
                    isJson: false
                })
            })
        });
        const getMessageFactoryMock = sinon.stub().returns({requireLogin: sinon.stub()});

        const servicesMock = createAppServicesInstance({
            factories: {
                [s_clientProvider]: getClientProviderMock,
                [s_messageFactory]: getMessageFactoryMock
            }
        });

        const connection = composeLoginFromXHR(servicesMock);

        await expect(connection("mockSessionId")).to.be.rejected.then(error => {
            expect(error).to.be.an.instanceof(ErrorCode);
            expect(error.message).to.equal("Internal server error, please report bug at zupfe@velor.ca");
            expect(error.errorCode).to.equal(E_INTERNAL_ERROR);
        });
    });
});