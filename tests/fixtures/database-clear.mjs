import {getLogger} from "velor-services/injection/services.mjs";
import {getTableNames} from "../../installation/defaultTableNames.mjs";

export function getClearDatabaseSql(schema, tableNames = {}) {
    const {
        auths,
        acl,
        preferences,
        access,
        roles,
        apiKeys,
        userApiKeys,
        tokens,
        users,
    } = getTableNames(tableNames);

    const clearAclSql = `delete from ${schema}.${acl} where true`;

    const clearAuthsSql = `delete from ${schema}.${auths} where provider != 'system'`;

    const clearPreferencesSql = `delete from ${schema}.${preferences} where true`;

    const clearRolesSql = `delete from ${schema}.${roles} where true`;

    const clearAccessLogSql = `delete from ${schema}.${access} where true`;

    const clearApiKeysSql = `delete from ${schema}.${apiKeys} where id not in (
                        select api_key_id as id
                        from ${schema}.${userApiKeys} uak
                        where uak.user_id in (
                            select u.id
                            from ${schema}.${users} u,
                                ${schema}.${auths} a
                            where a.id = u.primary_auth_id
                            and a.provider = 'system'))`;

    const clearTokensSql = `delete from ${schema}.${tokens} where true`;


    return {
        clearAclSql,
        clearAuthsSql,
        clearPreferencesSql,
        clearRolesSql,
        clearAccessLogSql,
        clearApiKeysSql,
        clearTokensSql
    };
}

export function composeClearDataAccess(schema, tableNames = {}) {

    const {
        clearAclSql,
        clearAuthsSql,
        clearPreferencesSql,
        clearRolesSql,
        clearAccessLogSql,
        clearApiKeysSql,
        clearTokensSql
    } = getClearDatabaseSql(schema, tableNames);

    async function clearAcl(database) {
        await database.queryRaw(clearAclSql);
        getLogger(database).debug('cleared database: acl');
    }

    async function clearAuths(database) {
        await database.queryRaw(clearAuthsSql);
        getLogger(database).debug('cleared database: auths');
    }

    async function clearPreferences(database) {
        await database.queryRaw(clearPreferencesSql);
        getLogger(database).debug('cleared database: preferences');
    }

    async function clearRoles(database) {
        await database.queryRaw(clearRolesSql);
        getLogger(database).debug('cleared database: role');
    }

    async function clearAccessLog(database) {
        await database.queryRaw(clearAccessLogSql);
        getLogger(database).debug('cleared database: access log');
    }

    async function clearApiKeys(database) {
        await database.queryRaw(clearApiKeysSql);
        getLogger(database).debug('cleared database: api keys');

    }

    async function clearTokens(database) {
        await database.queryRaw(clearTokensSql);
        getLogger(database).debug('cleared database: tokens');

    }

    async function clearDatabase(database) {
        return await Promise.all([
            clearRoles(database),
            clearApiKeys(database),
            clearAccessLog(database),
            clearPreferences(database),
            clearAuths(database),
            clearAcl(database),
            clearTokens(database),
        ]);
    }


    return {
        clearAcl,
        clearAuths,
        clearPreferences,
        clearRoles,
        clearAccessLog,
        clearApiKeys,
        clearTokens,
        clearDatabase,
    };
}