import {MapArray} from "velor-utils/utils/map.mjs";
import sinon from "sinon";
import {WsConnection} from "../../sockets/core/WsConnection.mjs";
import {WsManagerPolicy} from "../../sockets/core/WsManagerPolicy.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {mergeDefaultServerOptions} from "../../application/services/mergeDefaultServerOptions.mjs";
import {
    s_server,
    s_wsConnectionManager
} from "../../application/services/serviceKeys.mjs";
import {s_logger} from "velor-services/application/services/serviceKeys.mjs";
import {noOpLogger} from "velor-utils/utils/noOpLogger.mjs";
import {
    getWsConnectionManager,
    getWsManagerProvider
} from "../../application/services/services.mjs";
import {observeWsConnectionUpgrade} from "../../initialization/observeWsConnectionUpgrade.mjs";
import {createCsrfDirect} from "../contrib/createCsrfDirect.mjs";
import {createWsIdDirect} from "../contrib/createWsIdDirect.mjs";

export const websocket = async ({}, use) => {
    let services, events,
        req, wsSocket, head,
        onUpgrade, wsClient, wsServer,
        verifyClient, manager, acceptMessage;


    events = new MapArray();

    const serverFactory = () => {
        return {
            on(event, listener) {
                events.push(event, listener);
            },
        }
    };

    wsClient = {
        on: sinon.stub(),
        send: sinon.stub()
    };

    wsServer = {
        on: sinon.stub(),
        handleUpgrade: sinon.stub().callsFake((request, wsSocket, head, cb) => {
            cb(wsClient);
        }),
        close: sinon.stub(),
        emit: sinon.stub()
    };

    const createWsServer = sinon.stub().returns(wsServer);
    const createWsClient = sinon.stub().returns(
        new WsConnection()
    );

    verifyClient = sinon.stub().returns(true);
    acceptMessage = sinon.stub().returns(true);

    const wsManagerFactory = () => {
        const Manager = WsManagerPolicy({
            createWsServer,
            createWsClient,
            verifyClient,
            acceptMessage
        });
        return new Manager({});
    };

    services = createAppServicesInstance(
        mergeDefaultServerOptions(
            {
                factories: {
                    [s_server]: serverFactory,
                    [s_wsConnectionManager]: wsManagerFactory,
                    [s_logger]: noOpLogger
                }
            }
        )
    );

    manager = getWsConnectionManager(services);
    getWsManagerProvider(services).add('/api', manager);

    manager.open();

    observeWsConnectionUpgrade(services);
    onUpgrade = events.get('upgrade')[0];

    req = {
        headers: {
            'x-forwarded-for': 'localhost',
        },
        cookies: {},
        signedCookies: {},
        session: {
            id: 'a-session-id',
        },
        ip: '127.0.0.1',
        originalUrl: 'https://localhost:3000/api?ignored=query'
    };

    createCsrfDirect(services, req);
    createWsIdDirect(services, req);

    wsSocket = {
        write: sinon.stub(),
        destroy: sinon.stub(),
    };
    head = {};

    await use({
        services,
        req,
        wsSocket,
        head,
        onUpgrade,
        wsClient,
        wsServer,
        verifyClient,
        manager,
        acceptMessage
    });
}