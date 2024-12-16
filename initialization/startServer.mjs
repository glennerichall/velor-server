import {
    getExpressApp,
    getServer
} from "../application/services/services.mjs";
import {setupRoutes} from "./setupRoutes.mjs";
import {setupServer} from "./setupServer.mjs";
import {
    logErrors,
    proceed
} from "../guards/guardMiddleware.mjs";
import {
    getEnvironment
} from "velor-services/application/services/baseServices.mjs";
import {getLogger} from "velor-services/application/services/services.mjs";
import {PORT} from "../application/services/envKeys.mjs";

export async function startServer(services, options = {}) {
    let application = getExpressApp(services);
    let server = getServer(services);

    const routes = setupRoutes(services);

    const {
        prologue = proceed,
        epilogue = logErrors,
    } = options;

    application
        .use(prologue)
        .use(routes)
        .use(epilogue);

    // setup must be called after routes have been mounted
    await setupServer(services);

    let port = getEnvironment(services)[PORT];
    server.listen(port, () => {
        getLogger(services).debug(`server listening on port ${port}`);
    })
}