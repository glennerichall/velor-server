import {observeServerClose} from "./observeServerClose.mjs";
import {enableProxy} from "./enableProxy.mjs";
import {createConstants} from "./createConstants.mjs";
import {observeWsConnectionUpgrade} from "./observeWsConnectionUpgrade.mjs";

export async function setupServer(services) {

    // configure express app and add a top global middleware for logging all api to server.
    enableProxy(services);

    // since the routes are now mounted, we have access to all urls.
    // create an endpoint list.
    createConstants(services);

    // capture the server close method to stop all other services.
    observeServerClose(services);

    // listen to websocket connections on the server.
    observeWsConnectionUpgrade(services);

}