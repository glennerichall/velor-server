import url from "url";
import {getAclValidator} from "../../../backend/auth/acl.mjs";
import {ACL_CATEGORY_REST} from "../../../shared/constants/permissions.mjs";
import {UNAUTHORIZED} from "./wsErrors.mjs";

import {getDatabase} from "../../../backend/application/services/backendServices.mjs";
import {getLogger} from "velor/utils/injection/services.mjs";


export async function verifyWsConnectionOnApiKey(req) {

    const uuid = req.headers['x-printer-uuid'];
    const apiKey = req.headers['x-api-key'];
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    const database = getDatabase(req);

    getLogger(req).debug('Verifying printer websocket connection for ' + uuid);

    const instance = await database.printers.queryPrinterInstance(uuid);

    let granted = await getAclValidator(req, ACL_CATEGORY_REST)
        .isResourceGranted(pathname, method);

    const isOwned = await database.printers.queryForPrinterApiKey(uuid, apiKey)

    if (!instance || !granted || !isOwned) {
        return UNAUTHORIZED;

    } else {
        getLogger(req).debug('Printer websocket connection established for ' + uuid);
        req.printerInstance = instance;

        return true;
    }
}