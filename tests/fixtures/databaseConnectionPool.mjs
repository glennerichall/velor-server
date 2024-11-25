import {queryRaw} from "velor-database/database/queryRaw.mjs";
import {PoolManager} from "velor-database/database/PoolManager.mjs";
import {getCreateSql} from "../../installation/getCreateSql.mjs";

let pool;
let createSql;

export const databaseConnectionPool = [
    async ({configs}, use, testInfo) => {

        const {connectionString, schema} = configs;

        if (!pool) {
            pool = new PoolManager(connectionString);
            pool.connect();
        }

        let client;
        if (!createSql) {
            client = await pool.acquireClient();

            createSql = await getCreateSql(schema);

            try {
                await queryRaw(client,
                    `drop schema if exists "${schema}" cascade`);

                await queryRaw(client,
                    `create schema if not exists "${schema}"`);

                await queryRaw(client, createSql);

            } finally {
                client.release();
            }
        }

        await use({
            connectionString,
            schema,
            pool,
            createSql,
        });

        try {
            client = await pool.acquireClient();
            await queryRaw(client,
                `drop schema if exists "${schema}" cascade`);
        } finally {
            client.release();
        }
    },
    {scope: 'worker', auto: true}
];