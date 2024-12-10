import {chainHandlers} from "../../core/chainHandlers.mjs";
import {serverIsOpened} from "./serverIsOpened.mjs";
import {verifyClient} from "./verifyClient.mjs";
import {handleUpgrade} from "./handleUpgrade.mjs";
import {composeConformRequest} from "./composeConformRequest.mjs";
import {composeRateLimiterGuard} from "./composeRateLimiterGuard.mjs";
import {composeGetWsManager} from "./composeGetWsManager.mjs";
import {composeCsrfProtection} from "../../guards/composeCsrfProtection.mjs";
import {composeCookieParser} from "../../auth/composeCookieParser.mjs";
import {composeGetWsId} from "./composeGetWsId.mjs";
import {verifyWsId} from "./verifyWsId.mjs";

export function composeWsUpgradeHandler(services) {
    const conformRequest = composeConformRequest(services);
    const rateLimit = composeRateLimiterGuard(services);
    const getWsManager = composeGetWsManager(services);
    const {csrfProtection} = composeCsrfProtection(services);
    let cookies = composeCookieParser(services);
    let {getWsId} = composeGetWsId(services);

    return chainHandlers(
        conformRequest,
        rateLimit,
        cookies,
        csrfProtection,
        getWsId,
        verifyWsId,
        getWsManager,
        serverIsOpened,
        verifyClient,
        handleUpgrade
    );
}