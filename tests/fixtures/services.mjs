import {mergeDefaultServerOptions} from "../../application/services/mergeDefaultServerOptions.mjs";
import {AUTH_TOKEN_SECRET} from "../../application/services/serverEnvKeys.mjs";
import {DATABASE_SCHEMA} from "velor-database/application/services/databaseEnvKeys.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {
    s_databaseStatements,
    s_poolManager
} from "velor-database/application/services/databaseServiceKeys.mjs";
import {composeStatements} from "../../database/composeStatements.mjs";
import {s_logger} from "velor-services/injection/serviceKeys.mjs";
import {noOpLogger} from "velor-utils/utils/noOpLogger.mjs";

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
                    [s_logger]: ()=> noOpLogger
                },
                env: {
                    [AUTH_TOKEN_SECRET]: 'a-secret-token',
                    [DATABASE_SCHEMA]: schema
                }
            });
        let services = createAppServicesInstance(options);

        await use(services);
    },
    {scope: 'worker'}
]