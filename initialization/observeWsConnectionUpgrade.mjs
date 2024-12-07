import {getServer} from "../application/services/serverServices.mjs";
import {chainHandlers} from "../core/chainHandlers.mjs";
import {composeResponse} from "./websocket/composeResponse.mjs";
import {verifyClient} from "./websocket/verifyClient.mjs";
import {handleUpgrade} from "./websocket/handleUpgrade.mjs";
import {composeGetWsManager} from "./websocket/composeGetWsManager.mjs";
import {composeGuardRequest} from "./websocket/composeGuardRequest.mjs";
import {composeConformRequest} from "./websocket/composeConformRequest.mjs";
import {serverIsOpened} from "./websocket/serverIsOpened.mjs";

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