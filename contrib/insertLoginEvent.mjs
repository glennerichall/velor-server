import {
    getRequestInfo,
    getUser
} from "../application/services/requestServices.mjs";
import {getDataAccess} from "../application/services/dataServices.mjs";

export async function insertLoginEvent(req, event) {
    const {
        fingerprint,
        ip,
    } = getRequestInfo(req);
    const user = getUser(req);
    await getDataAccess(req).insertLoginEvent(fingerprint, user.loginAuth.id, ip, event);
}