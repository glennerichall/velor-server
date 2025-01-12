import {mergeDefaultServerOptions} from "../../application/services/mergeDefaultServerOptions.mjs";
import {
    AUTH_EMAIL_USER,
    AUTH_TOKEN_SECRETS,
    COOKIE_SECRETS,
    CSRF_SECRETS,
    SESSION_SECRETS,
    USER_ENCRYPT_IV,
    USER_ENCRYPT_KEY
} from "../../application/services/envKeys.mjs";
import {
    createAppServicesInstance,
    getInstanceBinder
} from "velor-services/injection/ServicesContext.mjs";
import {noOpLogger} from "velor-utils/utils/noOpLogger.mjs";
import crypto from "crypto";
import {s_mailerTransport} from "../../application/services/serviceKeys.mjs";
import {mailerTransport} from "./mailerTransport.mjs";
import {s_clientProvider} from "velor-distribution/application/services/serviceKeys.mjs";
import {ClientTrackerPubSub} from "velor-distribution/distribution/ClientTrackerPubSub.mjs";
import {s_logger} from "velor-services/application/services/serviceKeys.mjs";
import {getEventQueue} from "velor-services/application/services/services.mjs";
import {
    EVENT_SERVER_CLOSED,
    EVENT_USER_LOGIN,
    EVENT_USER_LOGOUT
} from "../../application/services/eventKeys.mjs";
import {getDatabase} from "velor-database/application/services/services.mjs";
import {s_database} from "velor-database/application/services/serviceKeys.mjs";
import {getRoleDAO} from "velor-dbuser/application/services/services.mjs";
import {createLoggerInstance} from "velor-distribution/application/factories/createLoggerInstance.mjs";

export const services =
    async ({databaseServicesOptions}, use) => {


        let options = mergeDefaultServerOptions(
            {
                factories: {
                    ...databaseServicesOptions.factories,
                    [s_logger]: process.env.LOG_LEVEL !== null ? createLoggerInstance : ()=> noOpLogger,
                    [s_mailerTransport]: () => mailerTransport,
                    [s_clientProvider]: ClientTrackerPubSub,
                },
                env: {
                    ...databaseServicesOptions.env,
                    [CSRF_SECRETS]: 'double-submit-csrf-secret1;double-submit-csrf-secret2',
                    [AUTH_TOKEN_SECRETS]: 'secret-token1;secret-token2;secret-token3',
                    [AUTH_EMAIL_USER]: 'zupfe@velor.ca',
                    [SESSION_SECRETS]: 'session-secret-1;session-secret-2;session-secret-3',
                    [COOKIE_SECRETS]: 'cookie-secret-1;cookie-secret-2;cookie-secret-3',
                    [USER_ENCRYPT_KEY]: crypto.randomBytes(32).toString('hex'),
                    [USER_ENCRYPT_IV]: crypto.randomBytes(16).toString('hex'),
                    ...process.env
                }
            });
        let services = createAppServicesInstance(options);

        // shadow the real database with a transaction
        let database = getDatabase(services);
        database = await database.beginTransact();
        getInstanceBinder(services).setInstance(s_database, database);

        getEventQueue(services)
            .listen(EVENT_USER_LOGIN)
            .listen(EVENT_USER_LOGOUT)
            .listen(EVENT_SERVER_CLOSED);

        // create normal role
        await getRoleDAO(services).saveOne({name: 'normal'});

        await use(services);

        await database.rollback();
    }