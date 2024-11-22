import {queryRaw} from "velor-database/database/queryRaw.mjs";
import {composeClearDataAccess} from "./database-clear.mjs";

export const database = [
    async ({databaseConnectionPool}, use, testInfo) => {

        const {pool, schema} = databaseConnectionPool;

        let client = await pool.acquireClient();

        let {clearDatabase} = composeClearDataAccess(schema);

        try {
            let database = {
                schema,
                client,
                clear: () => clearDatabase(database),
                queryRaw: (...args) => queryRaw(client, ...args)
            };

            await use(database);

        } finally {
            client.release();
        }
    },
    {scope: 'worker'}
];