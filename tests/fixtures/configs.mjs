import {DATABASE_CONNECTION_STRING} from "velor-database/application/services/databaseEnvKeys.mjs";
import {defaultTableNames} from "../../installation/defaultTableNames.mjs";

let workerIndex = Number.parseInt(process.env.TEST_WORKER_INDEX);
let schema = `test_w${workerIndex}`;

export const configs = [
    async ({}, use, testInfo) => {
        const connectionString = process.env[DATABASE_CONNECTION_STRING] ??
            'postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable';

        const initialTableNames = {
            ...defaultTableNames
        };

        // this default renaming is to ensure that original sql queries does
        // use the provided default table names and not any hardcoded table name
        for (let name in defaultTableNames) {
            defaultTableNames[name] = defaultTableNames[name] + "_w" + workerIndex
        }

        try {
            await use({
                workerIndex,
                schema,
                connectionString
            });
        } finally {
            for (let name in initialTableNames) {
                defaultTableNames[name] = initialTableNames[name];
            }
        }

    }, {scope: 'worker'}
]