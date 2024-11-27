import {mergeDefaultServerOptions} from "../../application/services/mergeDefaultServerOptions.mjs";
import {
    AUTH_TOKEN_SECRET,
    CSRF_SECRET,
    SESSION_SECRET1,
    SESSION_SECRET2,
    USER_ENCRYPT_IV,
    USER_ENCRYPT_KEY
} from "../../application/services/serverEnvKeys.mjs";
import {DATABASE_SCHEMA} from "velor-database/application/services/databaseEnvKeys.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {
    s_databaseStatements,
    s_poolManager
} from "velor-database/application/services/databaseServiceKeys.mjs";
import {composeStatements} from "../../database/composeStatements.mjs";
import {s_logger} from "velor-services/injection/serviceKeys.mjs";
import {noOpLogger} from "velor-utils/utils/noOpLogger.mjs";
import crypto from "crypto";
import {s_mailerTransport} from "../../application/services/serverServiceKeys.mjs";
import {
    mailerTransport
} from "./mailerTransport.mjs";

export const services = [
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
                    [s_databaseStatements]: () => composeStatements,
                    [s_logger]: () => noOpLogger,
                    [s_mailerTransport]: ()=> mailerTransport
                },
                env: {
                    [CSRF_SECRET]: 'double-submit-csrf-secret',
                    [AUTH_TOKEN_SECRET]: 'a-secret-token',
                    [DATABASE_SCHEMA]: schema,
                    [SESSION_SECRET1]: 'session-secret-1',
                    [SESSION_SECRET2]: 'session-secret-2',
                    [USER_ENCRYPT_KEY]: crypto.randomBytes(32).toString('hex'),
                    [USER_ENCRYPT_IV]: crypto.randomBytes(16).toString('hex'),
                }
            });
        let services = createAppServicesInstance(options);

        await use(services);
    },
    {scope: 'worker'}
]