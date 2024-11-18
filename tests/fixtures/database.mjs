import {test as baseTest} from 'velor-utils/test/setupTestContext.mjs'
import {createConnectionPool} from "velor-database/database/impl/postgres.mjs";

export const test = baseTest.extend({
    database: [
        async ({}, use, testInfo) => {
            let workerIndex = Number.parseInt(process.env.TEST_WORKER_INDEX);
            let schema = `schema-run-${workerIndex}`;
            let pool = createConnectionPool(process.env.DATABASE_CONNECTION_STRING);
            let client = await pool.connect();
            await use({
                workerIndex,
                schema
            });
        }, {scope: 'worker'}
    ]
})