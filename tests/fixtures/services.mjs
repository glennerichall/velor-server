import {mergeDefaultServerOptions} from "../../application/services/mergeDefaultServerOptions.mjs";
import {
    AUTH_EMAIL_USER,
    AUTH_TOKEN_SECRET,
    COOKIE_SECRETS,
    CSRF_SECRETS,
    SESSION_SECRETS,
    USER_ENCRYPT_IV,
    USER_ENCRYPT_KEY
} from "../../application/services/envKeys.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {noOpLogger} from "velor-utils/utils/noOpLogger.mjs";
import crypto from "crypto";
import {s_mailerTransport} from "../../application/services/serviceKeys.mjs";
import {mailerTransport} from "./mailerTransport.mjs";
import {s_clientProvider} from "velor-distribution/application/services/serviceKeys.mjs";
import {ClientTrackerPubSub} from "velor-distribution/distribution/ClientTrackerPubSub.mjs";
import {LOG_LEVEL} from "velor-distribution/application/services/envKeys.mjs";
import {s_logger} from "velor-services/application/services/serviceKeys.mjs";
import {getEventQueue} from "velor-services/application/services/services.mjs";
import {
    EVENT_SERVER_CLOSED,
    EVENT_USER_LOGIN,
    EVENT_USER_LOGOUT
} from "../../application/services/eventKeys.mjs";

export const services =
    async ({databaseServicesOptions}, use) => {

        let options = mergeDefaultServerOptions(
            {
                factories: {
                    ...databaseServicesOptions.factories,
                    [s_logger]: () => noOpLogger,
                    [s_mailerTransport]: () => mailerTransport,
                    [s_clientProvider]: ClientTrackerPubSub,
                },
                env: {
                    ...databaseServicesOptions.env,
                    [CSRF_SECRETS]: 'double-submit-csrf-secret1;double-submit-csrf-secret2',
                    [AUTH_TOKEN_SECRET]: 'a-secret-token',
                    [AUTH_EMAIL_USER]: 'zupfe@velor.ca',
                    [SESSION_SECRETS]: 'session-secret-1;session-secret-2;session-secret-3',
                    [COOKIE_SECRETS]: 'cookie-secret-1;cookie-secret-2;cookie-secret-3',
                    [USER_ENCRYPT_KEY]: crypto.randomBytes(32).toString('hex'),
                    [USER_ENCRYPT_IV]: crypto.randomBytes(16).toString('hex'),
                    [LOG_LEVEL]: "debug",
                    ...process.env
                }
            });
        let services = createAppServicesInstance(options);

        getEventQueue(services)
            .listen(EVENT_USER_LOGIN)
            .listen(EVENT_USER_LOGOUT)
            .listen(EVENT_SERVER_CLOSED);

        await use(services);
    }