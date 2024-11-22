import {ACL_CATEGORY_ANY} from "../auth/permissions.mjs";
import {getTableNames} from "../sql/defaultTableNames.mjs";

// export async function deleteApiKeyForValueByUser(client, schema, value, userId) {
//     const res = await client
//         .query(`DELETE FROM ${schema}.api_keys
//             WHERE id IN (
//                 SELECT api_keys.id
//                 FROM ${schema}.api_keys
//                 INNER JOIN ${schema}.users_api_keys ON users_api_keys.api_key_id = api_keys.id
//                 WHERE users_api_keys.user_id = $1
//                  AND api_keys.value = crypt($2, api_keys.value)
//             ) returning *`,
//             [userId, value]);
//     return res.rowCount === 1 ? res.rows[0] : null;
// }

export function getApiKeysSql(schema, tableNames = {}) {
    const {
        apiKeys,
        apiKeysAcl,
        acl
    } = getTableNames(tableNames);

    const getAllApiKeysSql = `
        select *
        from ${schema}.${apiKeys}
    `;

    // @formatter:off
    const createApiKeySql = `
        WITH ins AS (SELECT gen_random_uuid() AS uuid_value)
        INSERT INTO ${schema}.${apiKeys} (value, name)
        SELECT
            crypt(uuid_value::text, gen_salt('bf')) as value,
                        CASE
                            WHEN $1::text IS NULL THEN left(ins.uuid_value::text, 3) || '...' || right(ins.uuid_value::text, 2)
            ELSE
            replace(
            replace(
            replace(
            replace(
            replace(
            replace(
            $1::text,
            '__L2__', left(ins.uuid_value::text, 2)),
            '__L3__', left(ins.uuid_value::text, 3)),
            '__L4__', left(ins.uuid_value::text, 4)),
            '__R2__', right(ins.uuid_value::text, 2)),
            '__R3__', right(ins.uuid_value::text, 3)),
            '__R4__', right(ins.uuid_value::text, 4))
        END AS name
        FROM ins
        RETURNING 
            (SELECT uuid_value AS raw_uuid FROM ins), 
            (SELECT uuid_value || '-' || public_id AS api_key FROM ins),
            *
    `;
    // @formatter:on

    const addAclRuleToApiKeySql = `
        insert into ${schema}.${apiKeysAcl} (api_key_id, acl_id)
        select $2 as api_key_id, id as acl_id
        from ${schema}.acl
        where name = $1`;

    // @formatter:off
    const getApiKeyByValueSql = `
        select *
        from ${schema}.${apiKeys}
        where value = crypt(left($1, 36), value)
          and public_id = right ($1, 36)
    `;
    // @formatter:on

    const getApiKeyByIdSql = `
        select *
        from ${schema}.${apiKeys}
        where id = $1
    `;

    const getApiKeyByPublicIdSql = `
        select *
        from ${schema}.${apiKeys}
        where public_id = $1
    `;

    const getApiKeyAclRulesByIdSql = `
        select a.id         as id,
               a.name       as name,
               a.resource   as resource,
               a.method     as method,
               a.permission as permission
        from ${schema}.${acl} a
                 inner join ${schema}.${apiKeysAcl} aka on a.id = aka.acl_id
                 inner join ${schema}.${apiKeys} ak on aka.api_key_id = ak.id
        where ak.id = $1
            and a.category = ANY ($2::text[])
           or '*' = ANY ($2::text[]) )
        order by a.permission, a.resource
    `;

    return {
        getAllApiKeysSql,
        createApiKeySql,
        addAclRuleToApiKeySql,
        getApiKeyByValueSql,
        getApiKeyByIdSql,
        getApiKeyByPublicIdSql,
        getApiKeyAclRulesByIdSql,
    };

}

export function composeApiKeysDataAccess(schema, tableNames = {}) {

    const {
        getAllApiKeysSql,
        createApiKeySql,
        addAclRuleToApiKeySql,
        getApiKeyByValueSql,
        getApiKeyByIdSql,
        getApiKeyByPublicIdSql,
        getApiKeyAclRulesByIdSql,
    } = getApiKeysSql(schema, tableNames);

    async function getAllApiKeys(client) {
        const res = await client.query(getAllApiKeysSql);
        return res.rows;
    }

    async function createApiKey(client, name) {
        const res = await client.query(createApiKeySql, [name]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    async function addAclRuleToApiKey(client, apiKeyId, aclName) {
        const res = await client.query(addAclRuleToApiKeySql, [aclName, apiKeyId]);
        return res.rowCount;
    }

    async function getApiKeyByValue(client, apiKeyValue) {
        const res = await client.query(getApiKeyByValueSql, [apiKeyValue]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    async function getApiKeyById(client, apiKeyId) {
        const res = await client.query(getApiKeyByIdSql, [apiKeyId]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    async function getApiKeyByPublicId(client, publicId) {
        const res = await client.query(getApiKeyByPublicIdSql, [publicId]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

// export async function getApiKeyAclRulesByValue(client, schema, apiKeyValue, ...categories) {
//     if (categories.length === 0) {
//         categories.push(ACL_CATEGORY_ANY);
//     }
//
//     const res = await client
//         .query(`select
//                     ${schema}.acl.id as id,
//                     ${schema}.acl.name as name,
//                     ${schema}.acl.resource as resource,
//                     ${schema}.acl.method as method,
//                     ${schema}.acl.permission as permission
//                 from ${schema}.acl
//                          inner join ${schema}.api_keys_acl aka on ${schema}.acl.id = aka.acl_id
//                          inner join ${schema}.api_keys ak on aka.api_key_id = ak.id
//                 where ak.public_id = right($1, 36)
//                     and ak.value = crypt(left($1, 36), ak.value)
//                     and (${schema}.acl.category = ANY($2::text[]) or '*' = ANY($2::text[]))
//                 order by ${schema}.acl.permission, ${schema}.acl.resource`,
//             [apiKeyValue, categories]);
//     return res.rows;
// }

    async function getApiKeyAclRulesById(client, apiKeyId, ...categories) {
        if (categories.length === 0) {
            categories.push(ACL_CATEGORY_ANY);
        }

        const res = await client.query(getApiKeyAclRulesByIdSql, [apiKeyId, categories]);
        return res.rows;
    }

    return {
        getAllApiKeys,
        createApiKey,
        addAclRuleToApiKey,
        getApiKeyByValue,
        getApiKeyById,
        getApiKeyByPublicId,
        getApiKeyAclRulesById,
    }
}