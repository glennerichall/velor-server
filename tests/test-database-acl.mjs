import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {getFSAsync} from "velor-utils/utils/sysProvider.mjs";
import * as path from "node:path";
import {queryRaw} from "velor-database/database/queryRaw.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

const __dirname = import.meta.dirname;

describe('database acl', () => {
    beforeEach(async ({database}) => {
        const {
            schema,
            client
        } = database;
        let createSql = await getFSAsync().readFile(path.join(__dirname, '..', 'sql', 'createSql.sql'));
        createSql = createSql.replace('@SCHEMA', schema);
        await queryRaw(client, createSql);
    })
})