import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {composeRequestScope} from "../../routes/composeRequestScope.mjs";

export function composeConformRequest(services) {

    const requestScope = composeRequestScope(services);

    return (req, res, next) => {
        const forwardedFor = req.headers['x-forwarded-for'];

        // Get actual client ip if behind reverse proxy
        req.ip = forwardedFor ? forwardedFor.split(',')[0].trim() :
            req.socket.remoteAddress;

        // api from websocket are not patched with custom properties
        // when bootstrapped. Inject the services into the request so
        // authentication can be done.
        requestScope(req, res, next);
    };
}