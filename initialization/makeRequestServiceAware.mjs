import {ENV_TEST} from "velor-utils/env.mjs";
import {getEnvironment,} from "velor-services/injection/baseServices.mjs";
import {
    cloneWithScope,
    getInstanceBinder,
    SCOPE_REQUEST
} from "velor-services/injection/ServicesContext.mjs";
import {getExpressApp} from "../application/services/serverServices.mjs";

export function createRequestContext(services, request) {
    getInstanceBinder(request).setInstance(request, 'request');
    return cloneWithScope(services, SCOPE_REQUEST);
}

export function makeRequestServiceAware(services) {
    const {NODE_ENV} = getEnvironment(services);
    const expressApp = getExpressApp(services);

    let servicesSymbol = Symbol("services");

    let configurable = NODE_ENV === ENV_TEST;
    Object.defineProperty(expressApp.request, 'services', {
        enumerable: true,
        configurable,
        get() {
            if (!this[servicesSymbol]) {
                // create a new service context with a request scope.
                // each new request call will create a new request scope.
                this[servicesSymbol] = createRequestContext(services, this);
            }
            return this[servicesSymbol];
        }
    });

}