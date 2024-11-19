import {queryRaw} from "velor-database/database/queryRaw.mjs";

export const database = [
    async ({databaseConnectionPool}, use, testInfo) => {

        const {pool, schema} = databaseConnectionPool;

        let client = await pool.acquireClient();

        try {
            await use({
                schema,
                client,
                queryRaw: (...args) => queryRaw(client, ...args)
            });

        } finally {
            client.release();
        }
    },
    {scope: 'worker'}
];