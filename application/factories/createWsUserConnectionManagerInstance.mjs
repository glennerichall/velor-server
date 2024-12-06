import {WsManagerPolicy} from "../../sockets/core/WsManagerPolicy.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {WsUserConnection} from "../../sockets/frontend/WsUserConnection.mjs";
import {WebSocketServer} from "ws";

export function createWsUserConnectionManagerInstance(services) {
    const createServer = new WebSocketServer({
        clientTracking: true,
        noServer: true,
    });

    const createClient = (ws, req) => getServiceBinder(services)
        .createInstance(WsUserConnection,
            req.session.id,
            req.user?.id,
            ws,
            req.ip);

    // no messages allowed from frontend
    const acceptMessage = () => false;

    const WsConnectionManager = WsManagerPolicy({
        createServer,
        createClient,
        acceptMessage,
    });

    return new WsConnectionManager();
}