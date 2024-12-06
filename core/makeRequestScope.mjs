import {
    getServiceBinder,
    getServiceBuilder,
    SCOPE_REQUEST
} from "velor-services/injection/ServicesContext.mjs";

export function makeRequestScope(services, request) {
    let clone = getServiceBuilder(services).clone()
        .addScope(SCOPE_REQUEST, {request})
        .done();

    getServiceBinder(clone).makeServiceAware(request);
}