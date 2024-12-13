import {ACL_CATEGORY_ANY} from "../auth/permissions.mjs";
import {getTableNames} from "../installation/defaultTableNames.mjs";

export function getUsersSql(schema, tableNames = {}) {
    const {
        users,
        acl,
        rolesAcl,
        roles,
        userRoles,
        auths,
    } = getTableNames(tableNames);

    const getPrimaryAuthByUserIdSql = `
        select a.auth_id     as profile_id,
               a.provider    as provider,
               a.email       as email,
               a.verified    as verified,
               a.displayname as display_name,
               a.lastname    as last_name,
               a.firstname   as first_name,
               a.avatar      as avatar,
               a.id          as primary_auth_id,
               u.id          as id
        from ${schema}.${users} u
                 inner join ${schema}.${auths} a on a.id = u.primary_auth_id
        where u.id = $1
    `;

    const getPrimaryAuthByProfileSql = `
        select a.auth_id     as profile_id,
               a.provider    as provider,
               a.email       as email,
               a.verified    as verified,
               a.displayname as display_name,
               a.lastname    as last_name,
               a.firstname   as first_name,
               a.avatar      as avatar,
               a.id          as primary_auth_id,
               u.id          as id
        from ${schema}.${auths} a
                 inner join ${schema}.${users} u on a.id = u.primary_auth_id
        where a.auth_id = $1
          and a.provider = $2
    `;

    const getPrimaryAuthByAuthIdSql = `
        select a.auth_id     as profile_id,
               a.provider    as provider,
               a.email       as email,
               a.verified    as verified,
               a.displayname as display_name,
               a.lastname    as last_name,
               a.firstname   as first_name,
               a.avatar      as avatar,
               a.id          as primary_auth_id,
               u.id          as id
        from ${schema}.${users} u
                 inner join ${schema}.${auths} a on a.id = u.primary_auth_id
        where a.id = $1
    `;

    const queryByLastFingerprintSql = `
        select *
        from ${schema}.logins
        where fingerprint = $1
        order by date desc
            limit 1
    `;

    const insertUserSql = `
        insert into ${schema}.${users} (primary_auth_id)
        values ($1) returning *
    `;

    const queryForLastLoginSql = `
        select logins.id, ip, date, fingerprint
        from ${schema}.user_auths
            inner join ${schema}.logins
        on logins.auth_id = user_auths.auth_id
        where user_id = $1
          and type = 'login'
        order by date desc
            limit 2
    `;

    const insertLoginEventSql = `
        insert into ${schema}.logins (fingerprint, auth_id, ip, type)
        values ($1, $2, $3, $4)
    `;

    const grantUserRoleByProfileSql = `
        insert into ${schema}.${userRoles} (role_id, user_id)
        values ((select id from ${schema}.${roles} where name = $1),
                (select u.id
                 from ${schema}.${users} u
                          inner join ${schema}.${auths} a on a.id = u.primary_auth_id
                 where a.auth_id = $2
                   and a.provider = $3))
    `;

    const grantUserRoleByUserIdSql = `
        insert into ${schema}.${userRoles} (role_id, user_id)
        values ((select id from ${schema}.${roles} where name = $1),
                $2)
    `;

    const getUserIdByApiKeySql = `
        select ${schema}.${users}.*
        from ${schema}.api_keys
                 inner join ${schema}.users_api_keys on users_api_keys.api_key_id = api_keys.id
                 inner join ${schema}.${users} on users_api_keys.user_id = users.id
        where api_keys.value = crypt(left($1, 36), api_keys.value)
          and api_keys.public_id = right ($1
            , 36)
    `;

    const revokeUserRoleByProfileSql = `
        delete
        from ${schema}.${userRoles}
        where role_id in (select id from ${schema}.${roles} where name = $1)
          and user_id in (select u.id
                         from ${schema}.${users} u
                                  inner join ${schema}.${auths} a on a.id = u.primary_auth_id
                         where a.auth_id = $2
                           and a.provider = $3)
    `;

    const revokeUserRoleByUserIdSql = `
        delete
        from ${schema}.${userRoles}
        where role_id in (select id from ${schema}.${roles} where name = $1)
          and user_id in $2)
    `;

    const getUserAclRulesByUserIdSql = `
        select
            a.id            as id,
            a.name          as name,
            a.resource      as resource,
            a.method        as method,
            a.permission    as permission,
            a.category      as category
        from ${schema}.${acl} a
                 inner join ${schema}.${rolesAcl} ra on a.id = ra.acl_id
                 inner join ${schema}.${roles} r on r.id = ra.role_id
                 inner join ${schema}.${userRoles} ur on r.id = ur.role_id
                 inner join ${schema}.${users} u on u.id = ur.user_id
        where u.id = $1
            and (a.category = ANY($2::text[]) or 
                    '*' = ANY($2::text[]) or
                    a.category = '*')
        order by a.permission, a.resource
    `;

    const addApiKeyOwnerSql = `
        insert into ${schema}.users_api_keys
            (api_key_id, user_id)
        values ($1, $2)
    `;

    const countUsersSql = `
        select count(*)
        from ${schema}.${users}
    `;

    const queryApiKeyByAuthSql = `
        select ${schema}.api_keys.*
        from ${schema}.auths
                 inner join ${schema}.user_auths on auths.id = user_auths.auth_id
                 inner join ${schema}.${users} on user_auths.user_id = users.id
                 inner join ${schema}.users_api_keys on users.id = users_api_keys.user_id
                 inner join ${schema}.api_keys on users_api_keys.api_key_id = api_keys.id
        where auths.auth_id = $1
          and auths.provider = $2
    `;

    const queryApiKeyByUserSql = `
        select *
        from ${schema}.api_keys k
                 inner join ${schema}.users_api_keys u on k.id = u.api_key_id
        where u.user_id = $1
          and k.public_id = $2
    `;

    const queryApiKeyForValueByUserSql = `
        select *
        from ${schema}.api_keys k
                 inner join ${schema}.users_api_keys u on k.id = u.api_key_id
        where u.user_id = $1
          and k.value = crypt(left($2, 36), k.value)
          and k.public_id = right ($2
            , 36)
    `;

    const getUserApiKeysByUserIdSql = `
        select *
        from ${schema}.api_keys k
                 inner join ${schema}.users_api_keys u on k.id = u.api_key_id
        where u.user_id = $1
    `;

    const getUserRolesByUserIdSql = `
        select r.id          as id,
               r.name        as name,
               r.description as description
        from ${schema}.${roles} r
                 inner join ${schema}.${userRoles} ur on r.id = ur.role_id
                 inner join ${schema}.${users} u on u.id = ur.user_id
        where u.id = $1
    `;

    return {
        getPrimaryAuthByUserIdSql,
        getPrimaryAuthByProfileSql,
        queryByLastFingerprintSql,
        insertUserSql,
        queryForLastLoginSql,
        insertLoginEventSql,
        grantUserRoleByProfileSql,
        grantUserRoleByUserIdSql,
        getUserIdByApiKeySql,
        revokeUserRoleByProfileSql,
        revokeUserRoleByUserIdSql,
        getUserAclRulesByUserIdSql,
        getPrimaryAuthByAuthIdSql,
        addApiKeyOwnerSql,
        countUsersSql,
        queryApiKeyByAuthSql,
        queryApiKeyByUserSql,
        queryApiKeyForValueByUserSql,
        getUserApiKeysByUserIdSql,
        getUserRolesByUserIdSql,
    };
}

export function composeUsersDataAccess(schema, tableNames = {}) {


    const {
        getPrimaryAuthByUserIdSql,
        getPrimaryAuthByProfileSql,
        queryByLastFingerprintSql,
        insertUserSql,
        queryForLastLoginSql,
        insertLoginEventSql,
        grantUserRoleByProfileSql,
        grantUserRoleByUserIdSql,
        getUserIdByApiKeySql,
        revokeUserRoleByProfileSql,
        revokeUserRoleByUserIdSql,
        getUserAclRulesByUserIdSql,
        getPrimaryAuthByAuthIdSql,
        addApiKeyOwnerSql,
        countUsersSql,
        queryApiKeyByAuthSql,
        getUserRolesByUserIdSql,
    } = getUsersSql(schema, tableNames);


    async function getPrimaryAuthByUserId(client, userId) {
        const res = await client
            .query(getPrimaryAuthByUserIdSql, [userId]);
        return res.rows.length === 1 ? res.rows[0] : null;
    }

    async function getPrimaryAuthByProfile(client, profileId, provider) {
        const res = await client.query(getPrimaryAuthByProfileSql, [profileId, provider]);
        return res.rows.length === 1 ? res.rows[0] : null;
    }

    async function getPrimaryAuthByAuthId(client, authId) {
        const res = await client.query(getPrimaryAuthByAuthIdSql, [authId]);
        return res.rows.length === 1 ? res.rows[0] : null;
    }

    async function queryByLastFingerprint(client, fp) {
        const res = await client.query(queryByLastFingerprintSql, [fp]);
        return res.rows.length === 1 ? res.rows[0].user_id : null;
    }

    async function insertUser(client, authId) {
        const res = await client.query(insertUserSql, [authId,]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    async function queryForLastLogin(client, userId) {
        const res = await client.query(queryForLastLoginSql, [userId]);
        return res.rows;
    }

    async function insertLoginEvent(client, fingerprint, auth_id, ip, type = 'login') {
        const res = await client.query(insertLoginEventSql, [fingerprint, auth_id, ip, type]);
        return res.rowCount === 1;
    }

    async function grantUserRoleByProfile(client, profileId, provider, roleName) {
        await client.query(grantUserRoleByProfileSql, [roleName, profileId, provider]);
    }

    async function grantUserRoleByUserId(client, userId, roleName) {
        await client.query(grantUserRoleByUserIdSql, [roleName, userId]);
    }

    async function getUserIdByApiKey(client, apiKeyValue) {
        const result = await client.query(getUserIdByApiKeySql, [apiKeyValue]);
        return result.rowCount === 1 ? result.rows[0] : null;
    }

    async function revokeUserRoleByProfile(client, authName, provider, roleName) {
        await client.query(revokeUserRoleByProfileSql, [roleName, authName, provider]);
    }

    async function revokeUserRoleByUserId(client, userId, roleName) {
        await client.query(revokeUserRoleByUserIdSql, [roleName, userId]);
    }

    async function getUserAclRulesByUserId(client, userId, ...categories) {
        if (categories.length === 0) {
            categories.push(ACL_CATEGORY_ANY);
        }
        const res = await client.query(getUserAclRulesByUserIdSql, [userId, categories]);
        return res.rows;
    }

    async function addApiKeyOwner(client, apiKeyId, userId) {
        const res = await client.query(addApiKeyOwnerSql, [apiKeyId, userId]);
        return res.rowCount === 1;
    }

    async function queryApiKeyByAuth(client, authId, provider) {
        const res = await client.query(queryApiKeyByAuthSql, [authId, provider]);
        return res.rows;
    }

    async function queryApiKeyByUser(client, id, userId) {
        const res = await client.query(queryApiKeyByUserSql, [userId, id]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    async function queryApiKeyForValueByUser(client, value, userId) {
        const res = await client.query(queryApiKeyForValueByUserSql, [userId, value]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    async function getUserApiKeysByUserId(client, userId) {
        const res = await client.query(getUserApiKeysByUserIdSql, [userId]);
        return res.rows;
    }

    async function getUserRolesByUserId(client, userId) {
        const res = await client.query(getUserRolesByUserIdSql, [userId]);
        return res.rows;
    }

    async function countUsers(client) {
        const res = await client.query(countUsersSql);
        return Number.parseInt(res.rows[0].count);
    }

    return {
        getPrimaryAuthByUserId,
        getPrimaryAuthByProfile,
        getPrimaryAuthByAuthId,
        queryByLastFingerprint,
        insertUser,
        queryForLastLogin,
        insertLoginEvent,
        grantUserRoleByProfile,
        grantUserRoleByUserId,
        getUserIdByApiKey,
        revokeUserRoleByProfile,
        revokeUserRoleByUserId,
        getUserAclRulesByUserId,
        addApiKeyOwner,
        queryApiKeyByAuth,
        queryApiKeyByUser,
        queryApiKeyForValueByUser,
        getUserApiKeysByUserId,
        getUserRolesByUserId,
        countUsers
    };
}