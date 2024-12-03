import {
    getServiceBinder,
    getServiceBuilder,
    SCOPE_REQUEST
} from "velor-services/injection/ServicesContext.mjs";

export function composeRequestScope(services) {
    return (request, res, next) => {
        let clone = getServiceBuilder(services).clone()
            .addScope(SCOPE_REQUEST, {request})
            .done();

        getServiceBinder(clone).makeServiceAware(request);

        next();
    };
}