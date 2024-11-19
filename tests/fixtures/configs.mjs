import {DATABASE_CONNECTION_STRING} from "velor-database/application/services/databaseEnvKeys.mjs";

let workerIndex = Number.parseInt(process.env.TEST_WORKER_INDEX);
let schema = `test_w${workerIndex}`;

export const configs = [
    async ({}, use, testInfo) => {
        const connectionString = process.env[DATABASE_CONNECTION_STRING] ??
            'postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable';

        await use({
            workerIndex,
            schema,
            connectionString
        });

    }, {scope: 'worker'}
]