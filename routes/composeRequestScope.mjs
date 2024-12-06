import {makeRequestScope} from "../core/makeRequestScope.mjs";

export function composeRequestScope(services) {
    return (request, res, next) => {
        makeRequestScope(services, request);
        next();
    };
}