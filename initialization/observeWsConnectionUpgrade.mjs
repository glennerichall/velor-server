import {getServer} from "../application/services/serverServices.mjs";
import {chainHandlers} from "../core/chainHandlers.mjs";
import {composeResponse} from "../sockets/upgrade/composeResponse.mjs";
import {verifyClient} from "../sockets/upgrade/verifyClient.mjs";
import {handleUpgrade} from "../sockets/upgrade/handleUpgrade.mjs";
import {composeGetWsManager} from "../sockets/upgrade/composeGetWsManager.mjs";
import {composeGuardRequest} from "../sockets/upgrade/composeGuardRequest.mjs";
import {composeConformRequest} from "../sockets/upgrade/composeConformRequest.mjs";
import {serverIsOpened} from "../sockets/upgrade/serverIsOpened.mjs";

export function observeWsConnectionUpgrade(services) {
    const server = getServer(services);
    const conformRequest = composeConformRequest(services);
    const guardRequest = composeGuardRequest(services);
    const getWsManager = composeGetWsManager(services);
    const createResponse = composeResponse(services);

    server.on('upgrade', async (req, wsSocket, head) => {
        let res = createResponse(wsSocket);
        req.wsSocket = wsSocket;
        req.head = head;

        await chainHandlers(
            conformRequest,
            guardRequest,
            getWsManager,
            serverIsOpened,
            verifyClient,
            handleUpgrade
        )(req, res);

    });
}