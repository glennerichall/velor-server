import {
    getConstants,
    getEnvValue,
    getProvider,
    isDevelopment
} from "velor-services/injection/baseServices.mjs";
import {forRequestSession} from "../../distribution/matchingRules.mjs";
import {getClientProvider} from "velor-distribution/application/services/distributionServices.mjs";
import {
    BACKEND_URL,
    FULL_HOST_URLS
} from "./serverEnvKeys.mjs";

export function getRequest(request) {
    return getProvider(request).request();
}

export function getUrls(req) {
    const {endpoints} = getConstants(req);
    return endpoints;
}

export function getRequestInfo(req) {
    return getRequest(req).requestDetails;
}

export function getSessionId(req) {
    return getSession(req).id;
}

export function getSession(req) {
    return getRequest(req).session;
}

export function getFullHostUrl(req) {
    const fullHostUrls = getEnvValue(req, FULL_HOST_URLS);
    const backendUrl = getEnvValue(req, BACKEND_URL);

    if (req.query?.host === 'off' || !fullHostUrls && req.query?.host !== 'on') {
        return '';

    } else if (typeof fullHostUrls === 'string') {
        return fullHostUrls;

    } else if (typeof fullHostUrls === 'function') {
        return fullHostUrls();

    } else if (!backendUrl || isDevelopment(req)) {
        const port = !!req.port ? `:${req.port}` : '';
        const host = req.get('host');
        return `${req.protocol}://${host}${port}`;
    }

    return backendUrl;
}

export function getFullHostUrls(req) {
    const urls = getUrls(req);
    const hostUrl = getFullHostUrl(req);
    let fullHostUrls = {}
    for (let key in urls) {
        fullHostUrls[key] = hostUrl + urls[key];
    }
    return fullHostUrls;
}

export function getUser(req) {
    return getRequest(req).user;
}

export function getClientsBySession(req, context) {
    if (!context) context = getRequestInfo(req);
    return getClientProvider(req).getClients(forRequestSession(context));
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
