import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {observeWsConnectionUpgrade} from "../initialization/observeWsConnectionUpgrade.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {mergeDefaultServerOptions} from "../application/services/mergeDefaultServerOptions.mjs";
import {s_server} from "../application/services/serverServiceKeys.mjs";
import {getServer} from "../application/services/serverServices.mjs";
import sinon from "sinon";
import {MapArray} from "velor-utils/utils/map.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('observeWsConnectionUpgrade', () => {
    let services, events;

    beforeEach(async ({services: s}) => {
        events = new MapArray();
        services = createAppServicesInstance(
            mergeDefaultServerOptions(
                {
                    factories: {
                        [s_server]: () => {
                            return {
                                on(event, listener) {
                                    events.push(event, listener);
                                },
                                upgrade: sinon.stub()
                            }
                        }
                    }
                }
            )
        );
    })

    it('should handle server upgrade', async () => {
        const server = getServer(services);
        const req = {
            headers: {
                'x-forwarded-for': 'localhost'
            },
            path: '/there/is/no/ws/manager/here'
        };
        const wss = {
            write: sinon.stub(),
            destroy: sinon.stub()
        };
        const head = {};

        observeWsConnectionUpgrade(services);
        let upgradeListener = events.get('upgrade')[0];
        await upgradeListener(req, wss, head);

        expect(server.upgrade).calledOnce();
    })

    it('should respond 404 when no manager mounted on path', async () => {

        const req = {
            headers: {
                'x-forwarded-for': 'localhost'
            },
            path: '/there/is/no/ws/manager/here'
        };
        const wss = {
            write: sinon.stub(),
            destroy: sinon.stub()
        };
        const head = {};

        observeWsConnectionUpgrade(services);
        let upgradeListener = events.get('upgrade')[0];
        await upgradeListener(req, wss, head);

        expect(wss.write).calledWith('HTTP/1.1 404 Not Found\r\n\r\n');
    })
});
