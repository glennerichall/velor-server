import {setupTestContext as setupTest} from 'velor-utils/test/setupTestContext.mjs';
import {database} from "./database.mjs";
import {configs} from "./configs.mjs";
import {databaseConnectionPool} from "./databaseConnectionPool.mjs";
import {services} from "./services.mjs";
import {request} from "./request.mjs";
import {rest} from "./rest.mjs";

export function setupTestContext() {
    return setupTest({
        database,
        configs,
        databaseConnectionPool,
        services,
        request,
        rest
    });
}