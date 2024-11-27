import {makeRequestServiceAware} from "./makeRequestServiceAware.mjs";
import {observeServerClose} from "./observeServerClose.mjs";
import {enableProxy} from "./enableProxy.mjs";
import {createConstants} from "./createConstants.mjs";

export async function setupExpressApp(services) {

    // configure express app and add a top global middleware for logging all api to server.
    enableProxy(services);

    // since the routes are now mounted, we have access to all urls.
    // create an endpoint list.
    createConstants(services);

    // add some properties to the express Request class.
    // createConstants must be called prior
    makeRequestServiceAware(services);

    // capture the server close method to stop all other services
    observeServerClose(services);

    // since the routes are now mounted, we have access to all urls.
    // we can now initialize all auth strategies with callback urls

}