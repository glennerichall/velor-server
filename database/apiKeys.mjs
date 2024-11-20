import {ACL_CATEGORY_ANY} from "../auth/permissions.mjs";

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

export async function createApiKey(client, schema, name) {
    const res = await client
        .query(`WITH ins AS (SELECT gen_random_uuid() AS uuid_value)
                INSERT INTO ${schema}.api_keys(value, name)
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
                    *`,
            [name]);

    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function addAclRuleToApiKey(client, schema, apiKeyId, ...aclNames) {
    const res = await client
        .query(`insert into ${schema}.api_keys_acl (api_key_id, acl_id)
                select $2 as api_key_id, id as acl_id
                from ${schema}.acl
                where name = ANY($1)`,
            [aclNames, apiKeyId]);
    return res.rowCount;
}


export async function getApiKeyByValue(client, schema, apiKeyValue) {
    const res = await client
        .query(`select * from ${schema}.api_keys
                where value=crypt(left($1,36),value)
                    and public_id=right($1,36)`,
            [apiKeyValue]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function getApiKeyAclRules(client, schema, apiKeyValue, ...categories) {
    if (categories.length === 0) {
        categories.push(ACL_CATEGORY_ANY);
    }

    const res = await client
        .query(`select
                    ${schema}.acl.id as id,
                    ${schema}.acl.name as name,
                    ${schema}.acl.resource as resource,
                    ${schema}.acl.method as method,
                    ${schema}.acl.permission as permission
                from ${schema}.acl
                         inner join ${schema}.api_keys_acl aka on ${schema}.acl.id = aka.acl_id
                         inner join ${schema}.api_keys ak on aka.api_key_id = ak.id
                where ak.public_id = right($1, 36)
                    and ak.value = crypt(left($1, 36), ak.value)
                    and (${schema}.acl.category = ANY($2::text[]) or '*' = ANY($2::text[]))
                order by ${schema}.acl.permission, ${schema}.acl.resource`,
            [apiKeyValue, categories]);
    return res.rows;
}