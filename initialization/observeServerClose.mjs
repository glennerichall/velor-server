import {bindOnAfterMethods} from "velor-utils/utils/proxy.mjs";
import {
    isDevelopment,
    isTest,
} from "velor-services/application/services/baseServices.mjs";
import {
    getEmitter,
    getLogger
} from "velor-services/application/services/services.mjs";
import {getUuid} from "velor-services/injection/ServicesContext.mjs";
import {getMessageQueue} from "velor-distribution/application/services/services.mjs";
import {
    getServer,
    getWsConnectionManager
} from "../application/services/services.mjs";
import {EVENT_SERVER_CLOSED} from "../application/services/eventKeys.mjs";

export function observeServerClose(services) {

    const server = getServer(services);

    // In production, server termination means process kill but in tests
    // server will be closed after each test and any pending connection will
    // prevent server to fully close. Keep track of socket connections and
    // simply destroy them on server close.
    const sockets = new Set();
    if (isDevelopment(services) || isTest(services)) {
        server.on('connection', socket => {
            sockets.add(socket);
            socket.on('close', () => sockets.delete(socket));
        });
    }

    bindOnAfterMethods(server, {
        async onClose() {

            // destroy any http sockets.
            // for (let socket of sockets) {
            // socket.destroySoon();
            // }

            let logger = getLogger(services);
            logger.debug(`Closing server[${getUuid(server)}]`);

            const queue = getMessageQueue(services);
            const wsConnections = getWsConnectionManager(services);
            // const database = getDatabase(services);

            try {
                await Promise.all([
                    wsConnections.close()
                        .then(() => logger.debug('Frontend socket server closed'))
                        .catch(e => logger.error('Error while closing frontend socket server: ' + e.message)),
                    queue.close()
                        .then(() => logger.debug('Job queue closed'))
                        .catch(e => logger.error('Error while closing job queue: ' + e.message)),
                    // database.close(),
                ]);

                getEmitter(services).emit(EVENT_SERVER_CLOSED, server);
            } catch (e) {
                // TODO what to do about it ?????
                logger.error(`Error while closing services on server close error: ${e.message}`);
            }
        }
    });

}