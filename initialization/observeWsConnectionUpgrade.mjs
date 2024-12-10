import {getServer} from "../application/services/serverServices.mjs";
import {composeResponse} from "../sockets/upgrade/composeResponse.mjs";
import {composeWsUpgradeHandler} from "../sockets/upgrade/composeWsUpgradeHandler.mjs";

export function observeWsConnectionUpgrade(services) {
    const server = getServer(services);
    const createResponse = composeResponse(services);
    const handleUpgrade = composeWsUpgradeHandler(services);

    server.on('upgrade', async (req, wsSocket, head) => {
        let res = createResponse(wsSocket);
        req.wsSocket = wsSocket;
        req.head = head;
        await handleUpgrade(req, res);
    });
}