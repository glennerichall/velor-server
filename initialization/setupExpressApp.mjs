import {makeRequestServiceAware} from "./makeRequestServiceAware.mjs";
import {observerServerClose} from "./observerServerClose.mjs";
import {enableProxy} from "./enableProxy.mjs";
import {createConstants} from "./createConstants.mjs";

export async function setupExpressApp(services) {

    // configure express app and add a top global middleware for logging all api to server.
    enableProxy(services);

    // constants are built from endpoints declared in installRoutesAndMiddlewares
    // therefore calling createConstants must be after.
    createConstants(services);

    // add some properties to the express Request class.
    // createConstants must be called prior
    makeRequestServiceAware(services);

    // capture the server close method to stop all other services
    observerServerClose(services);
}