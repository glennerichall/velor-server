import {setupTestContext as setupTest} from 'velor-utils/test/setupTestContext.mjs';
import {services} from "./services.mjs";
import {request} from "./request.mjs";
import {rest} from "./rest.mjs";
import {api} from "./api.mjs";
import {websocket} from "./websocket.mjs";
import {servicesOptions} from 'velor-dbuser/tests/fixtures/servicesOptions.mjs';
import {databaseConnectionPool} from 'velor-dbuser/tests/fixtures/databaseConnectionPool.mjs';
import {configs} from 'velor-dbuser/tests/fixtures/configs.mjs';
import {database} from 'velor-dbuser/tests/fixtures/database.mjs';
import {assets} from "./assets.mjs";

export function setupTestContext() {
    return setupTest({
        services,
        assets,
        request,
        rest,
        api,
        websocket,
        configs,
        database,
        databaseConnectionPool,
        databaseServicesOptions: servicesOptions
    });
}