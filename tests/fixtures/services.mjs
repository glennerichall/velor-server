import {mergeDefaultServerOptions} from "../../application/services/mergeDefaultServerOptions.mjs";
import {
    AUTH_EMAIL_USER,
    AUTH_TOKEN_SECRET,
    COOKIE_SECRETS,
    CSRF_SECRETS,
    MAGIC_LINK_ENCRYPT_IV,
    MAGIC_LINK_ENCRYPT_KEY,
    SESSION_SECRETS,
    USER_ENCRYPT_IV,
    USER_ENCRYPT_KEY
} from "../../application/services/serverEnvKeys.mjs";
import {DATABASE_SCHEMA} from "velor-database/application/services/databaseEnvKeys.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {s_poolManager} from "velor-database/application/services/databaseServiceKeys.mjs";
import {s_logger} from "velor-services/injection/serviceKeys.mjs";
import {noOpLogger} from "velor-utils/utils/noOpLogger.mjs";
import crypto from "crypto";
import {s_mailerTransport} from "../../application/services/serverServiceKeys.mjs";
import {mailerTransport} from "./mailerTransport.mjs";
import {s_clientProvider} from "velor-distribution/application/services/distributionServiceKeys.mjs";
import {ClientTrackerPubSub} from "velor-distribution/distribution/ClientTrackerPubSub.mjs";

export const services =
    async ({configs, databaseConnectionPool}, use, testInfo) => {

        const {
            schema,
        } = configs;

        const {
            pool
        } = databaseConnectionPool;

        let options = mergeDefaultServerOptions(
            {
                factories: {
                    [s_poolManager]: () => pool,
                    [s_logger]: () => noOpLogger,
                    [s_mailerTransport]: () => mailerTransport,
                    [s_clientProvider]: ClientTrackerPubSub,
                },
                env: {
                    [CSRF_SECRETS]: 'double-submit-csrf-secret1;double-submit-csrf-secret2',
                    [AUTH_TOKEN_SECRET]: 'a-secret-token',
                    [AUTH_EMAIL_USER]: 'zupfe@velor.ca',
                    [DATABASE_SCHEMA]: schema,
                    [SESSION_SECRETS]: 'session-secret-1;session-secret-2;session-secret-3',
                    [COOKIE_SECRETS]: 'cookie-secret-1;cookie-secret-2;cookie-secret-3',
                    [USER_ENCRYPT_KEY]: crypto.randomBytes(32).toString('hex'),
                    [USER_ENCRYPT_IV]: crypto.randomBytes(16).toString('hex'),
                    [MAGIC_LINK_ENCRYPT_KEY]: crypto.randomBytes(32).toString('hex'),
                    [MAGIC_LINK_ENCRYPT_IV]: crypto.randomBytes(16).toString('hex'),
                }
            });
        let services = createAppServicesInstance(options);

        await use(services);
    }