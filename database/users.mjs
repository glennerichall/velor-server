import {ACL_CATEGORY_ANY} from "../auth/permissions.mjs";

export async function getPrimaryAuthByUserId(client, schema, userId) {
    const res = await client
        .query(`select a.auth_id     as profile_id,
                       a.provider    as provider,
                       a.email       as email,
                       a.verified    as verified,
                       a.displayname as display_name,
                       a.lastname    as last_name,
                       a.firstname   as first_name,
                       a.avatar      as avatar,
                       a.id          as id,
                       users.id      as user_id
                from ${schema}.users
                         inner join ${schema}.auths a on a.id = users.primary_auth_id
                where users.id = $1`
            , [userId]);
    if (res.rows.length === 1) {
        return res.rows[0];
    }
    return null;
}


export async function getPrimaryAuthByProfile(client, schema, profileId, provider) {
    const res = await client
        .query(`select a.auth_id     as profile_id,
                       a.provider    as provider,
                       a.email       as email,
                       a.verified    as verified,
                       a.displayname as display_name,
                       a.lastname    as last_name,
                       a.firstname   as first_name,
                       a.avatar      as avatar,
                       a.id          as id,
                       u.id          as user_id
                from ${schema}.users u
                         inner join ${schema}.auths a on a.id = u.primary_auth_id
                where a.auth_id = $1
                  and a.provider = $2`
            , [profileId, provider]);
    if (res.rows.length === 1) {
        return res.rows[0];
    }
    return null;
}


export async function getPrimaryAuthByAuthId(client, schema, authId) {
    const res = await client
        .query(`select a.auth_id     as profile_id,
                       a.provider    as provider,
                       a.email       as email,
                       a.verified    as verified,
                       a.displayname as display_name,
                       a.lastname    as last_name,
                       a.firstname   as first_name,
                       a.avatar      as avatar,
                       a.id          as id,
                       u.id          as user_id
                from ${schema}.users u
                         inner join ${schema}.auths a on a.id = u.primary_auth_id
                where a.id = $1`
            , [authId]);
    if (res.rows.length === 1) {
        return res.rows[0];
    }
    return null;
}


export async function queryByLastFingerprint(client, schema, fp) {
    const res = await client
        .query(`select *
                from ${schema}.logins
                where fingerprint = $1
                order by date desc
                    limit 1`, [fp]);
    if (res.rows.length === 1) {
        return res.rows[0].user_id;
    }
    return null;
}

export async function insertUser(client, schema, authId) {
    const res = await client
        .query(`insert into ${schema}.users (primary_auth_id)
                values ($1) returning *`,
            [
                authId,
            ]);
    if (res.rowCount === 1) {
        return res.rows[0];
    }
    return null;
}

export async function queryForLastLogin(client, schema, userId) {
    const res = await client.query(`
                select logins.id, ip, date, fingerprint
                from ${schema}.user_auths
                    inner join ${schema}.logins
                on logins.auth_id = user_auths.auth_id
                where user_id = $1
                  and type = 'login'
                order by date desc
                    limit 2`,
        [userId]);
    return res.rows;
}

export async function insertLoginEvent(client, schema, fingerprint, auth_id, ip, type = 'login') {
    const res = await client
        .query(`insert into ${schema}.logins (fingerprint, auth_id, ip, type)
                values ($1, $2, $3, $4)`,
            [
                fingerprint, auth_id, ip, type
            ]);
    return res.rowCount === 1;
}

export async function grantUserRoleByProfile(client, schema, profileId, provider, roleName) {
    await client.query(`
                insert into ${schema}.user_role (role, "user")
                values ((select id from ${schema}.role where name = $1),
                        (select users.id
                         from ${schema}.users
                                  inner join ${schema}.auths a on a.id = users.primary_auth_id
                         where a.auth_id = $2
                           and a.provider = $3))`,
        [roleName, profileId, provider]);
}

export async function grantUserRoleByUserId(client, schema, userId, roleName) {
    await client.query(`
                insert into ${schema}.user_role (role, "user")
                values ((select id from ${schema}.role where name = $1),
                        $2)`,
        [roleName, userId]);
}

export async function getUserIdByApiKey(client, schema, apiKeyValue) {
    const result = await client.query(`
                select ${schema}.users.*
                from ${schema}.api_keys
                         inner join ${schema}.users_api_keys on users_api_keys.api_key_id = api_keys.id
                         inner join ${schema}.users on users_api_keys.user_id = users.id
                where api_keys.value = crypt(left($1, 36), api_keys.value)
                  and api_keys.public_id = right ($1, 36)`,
        [apiKeyValue]);

    return result.rowCount === 1 ? result.rows[0] : null;
}


export async function revokeUserRoleByProfile(client, schema, authName, provider, roleName) {
    await client.query(`
                delete
                from ${schema}.user_role
                where role in (select id from ${schema}.role where name = $1)
                  and "user" in (select users.id
                                 from ${schema}.users
                                          inner join ${schema}.auths a on a.id = users.primary_auth_id
                                 where a.auth_id = $2
                                   and a.provider = $3)`,
        [roleName, authName, provider]);
}

export async function revokeUserRoleByUserId(client, schema, userId, roleName) {
    await client.query(`
                delete
                from ${schema}.user_role
                where role in (select id from ${schema}.role where name = $1)
                  and "user" in $2)`,
        [roleName, userId]);
}

export async function getUserAclRulesByUserId(client, schema, userId, ...categories) {
    if (categories.length === 0) {
        categories.push(ACL_CATEGORY_ANY);
    }
    const res = await client
        .query(`select ${schema}.acl.id         as id,
                       ${schema}.acl.name       as name,
                       ${schema}.acl.resource   as resource,
                       ${schema}.acl.method     as method,
                       ${schema}.acl.permission as permission,
                       ${schema}.acl.category   as category
                from ${schema}.acl
                         inner join ${schema}.role_acl ra on ${schema}.acl.id = ra.acl
                         inner join ${schema}.role r on r.id = ra.role
                         inner join ${schema}.user_role ur on r.id = ur.role
                         inner join ${schema}.users u on u.id = ur.user
                where u.id = $1
                  and (${schema}.acl.category = ANY ($2::text[]) or
                       '*' = ANY ($2::text[]) or
                       ${schema}.acl.category = '*')
                order by ${schema}.acl.permission, ${schema}.acl.resource`, [userId, categories]);
    return res.rows;
}

export async function deleteApiKeyByUser(client, schema, publicId, userId) {
    const res = await client
        .query(`DELETE
                FROM ${schema}.api_keys
                WHERE id IN (SELECT api_keys.id
                             FROM ${schema}.api_keys
                                      INNER JOIN ${schema}.users_api_keys ON users_api_keys.api_key_id = api_keys.id
                             WHERE users_api_keys.user_id = $1
                               AND api_keys.public_id = $2) returning *`,
            [userId, publicId]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function addApiKeyOwner(client, schema, apiKeyId, userId) {
    const res = await client
        .query(`insert into ${schema}.users_api_keys
                    (api_key_id, user_id)
                values ($1, $2)`, [apiKeyId, userId]);

    return res.rowCount === 1;
}

export async function queryApiKeyByAuth(client, schema, authId, provider) {
    const res = await client
        .query(`select ${schema}.api_keys.*
                from ${schema}.auths
                         inner join ${schema}.user_auths on auths.id = user_auths.auth_id
                         inner join ${schema}.users on user_auths.user_id = users.id
                         inner join ${schema}.users_api_keys on users.id = users_api_keys.user_id
                         inner join ${schema}.api_keys on users_api_keys.api_key_id = api_keys.id
                where auths.auth_id = $1
                  and auths.provider = $2`,
            [authId, provider]);
    return res.rows;
}

export async function queryApiKeyByUser(client, schema, id, userId) {
    const res = await client
        .query(`select *
                from ${schema}.api_keys k
                         inner join ${schema}.users_api_keys u on k.id = u.api_key_id
                where u.user_id = $1
                  and k.public_id = $2`,
            [userId, id]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function queryApiKeyForValueByUser(client, schema, value, userId) {
    const res = await client
        .query(`select *
                from ${schema}.api_keys k
                         inner join ${schema}.users_api_keys u on k.id = u.api_key_id
                where u.user_id = $1
                  and k.value = crypt(left($2, 36), k.value)
                  and k.public_id = right ($2
                    , 36)`,
            [userId, value]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function getUserApiKeysByUserId(client, schema, userId) {
    const res = await client
        .query(`select *
                from ${schema}.api_keys k
                         inner join ${schema}.users_api_keys u on k.id = u.api_key_id
                where u.user_id = $1`,
            [userId]);
    return res.rows;
}

export async function getUserRolesByUserId(client, schema, userId) {
    const res = await client
        .query(`select r.id          as id,
                       r.name        as name,
                       r.description as description
                from ${schema}.role r
                         inner join ${schema}.user_role ur on r.id = ur.role
                         inner join ${schema}.users u on u.id = ur.user
                where u.id = $1`, [userId]);
    return res.rows;
}