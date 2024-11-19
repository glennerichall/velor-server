import {getLogger} from "velor-services/injection/services.mjs";

export async function clearAcl(database) {
    let {schema} = database;
    await database.queryRaw(`delete from ${schema}.auths where provider != 'system'`);
    getLogger(database).debug('cleared database: acl');
}

export async function clearAuths(database) {
    let {schema} = database;
    await database.queryRaw(`delete from ${schema}.auths where provider != 'system'`); // it's all cascaded
    getLogger(database).debug('cleared database: auths');
}

export async function clearPreferences(database) {
    let {schema} = database;
    await database.queryRaw(`delete from ${schema}.preferences where true`);
    getLogger(database).debug('cleared database: preferences');
}

export async function clearRoles(database) {
    let {schema} = database;
    await database.queryRaw(`delete from ${schema}.role where true`);
    getLogger(database).debug('cleared database: role');
}

export async function clearAccessLog(database) {
    let {schema} = database;
    await database.queryRaw(`delete from ${schema}.access where true`);
    getLogger(database).debug('cleared database: access log');
}

export async function clearApiKeys(database) {
    let {schema} = database;
    await database.queryRaw(`delete from ${schema}.api_keys
                    where id not in (
                        select api_key_id as id
                        from ${schema}.users_api_keys
                        where users_api_keys.user_id in (
                            select users.id
                            from ${schema}.users,
                               ${schema}.auths
                            where auths.id = users.primary_auth_id
                            and auths.provider = 'system'))`
    );
    getLogger(database).debug('cleared database: api keys');

}

export async function clearTokens(database) {
    let {schema} = database;
    await database.queryRaw(`delete from ${schema}.tokens where true`);
    getLogger(database).debug('cleared database: tokens');

}

export async function clearDatabase(database) {
    return await Promise.all([
            clearApiKeys(database),
            clearAccessLog(database),
            clearPreferences(database),
            clearAuths(database),
            clearAcl(database),
            clearTokens(database),
        ]);
}