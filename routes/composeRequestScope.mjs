import {AsyncLocalStorage} from 'node:async_hooks';
import {
    getServiceBinder,
    getServiceBuilder,
    SCOPE_REQUEST
} from "velor-services/injection/ServicesContext.mjs";

const kAsyncStorage = Symbol("async-storage");

export function getRequestScopeStorage(services) {

    let asyncLocalStorage = services[kAsyncStorage];

    if (!asyncLocalStorage) {
        asyncLocalStorage = new AsyncLocalStorage();

        getServiceBuilder(services).addScope(SCOPE_REQUEST, {
            storeProvider: () => asyncLocalStorage.getStore() ?? {},
        }).done();

        services[kAsyncStorage] = asyncLocalStorage;
    }

    return asyncLocalStorage;
}

export function composeRequestScope(services) {
    const asyncLocalStorage = getRequestScopeStorage(services);

    return (req, res, next) => {
        getServiceBinder(services).makeServiceAware(req);
        const requestStorage = {
            request: req
        };
        asyncLocalStorage.run(requestStorage, () => next());
    };
}