import {makeRequestScope} from "../../core/makeRequestScope.mjs";

export function composeConformRequest(services) {

    return (req, res, next) => {
        const forwardedFor = req.headers['x-forwarded-for'];

        // Get actual client ip if behind reverse proxy
        req.ip = forwardedFor ? forwardedFor.split(',')[0].trim() :
            req.socket.remoteAddress;

        // api from websocket are not patched with custom properties
        // when bootstrapped. Inject the services into the request so
        // authentication can be done.
        makeRequestScope(services, req);

        next();
    };
}