import {getProvider} from "velor-services/application/services/baseServices.mjs";
import {getClientProvider} from "velor-distribution/application/services/services.mjs";
import {
    getChannelForSession,
    getChannelForUserId
} from "../../distribution/channels.mjs";

export function getRequest(request) {
    return getProvider(request).request();
}

export function getSessionId(req) {
    return getSession(req)?.id ?? 'no-session';
}

export function getWsId(req) {
    return getRequest(req).wsId;
}

export function getSession(req) {
    return getRequest(req).session;
}

export function getUser(req) {
    return getRequest(req).user;
}

export function getClientsBySession(req) {
    let sessionId = getSession(req);
    return getClientProvider(req).getClients(
        getChannelForSession(sessionId)
    );
}

export function getClientByUser(req) {
    let user = getUser(req);
    return getClientProvider(req).getClients(
        getChannelForUserId(user.id)
    );
}

export function getClientsForUser(req, ...userIds) {
    req = getRequest(req);
    if (userIds.length === 0) {
        let user = getUser(req);
        if (user) {
            userIds.push(user.id);
        }
    }
    return getClientTracker(req).getClients(forUserId(...userIds));
}
