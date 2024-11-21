import {ACL_CATEGORY_ANY} from "../auth/permissions.mjs";

export async function getAllRoles(client, schema) {
    const res = await client.query(`select * from ${schema}.role`);
    return res.rows;
}

export async function createRole(client, schema, name, description) {
    const res = await client.query(`INSERT INTO ${schema}.role (name, description)
             VALUES ($1, $2) RETURNING *`, [name, description]);
    return res.rows[0];
}

export async function getRoleAclRulesByName(client, schema, roleId, ...categories) {
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
                where r.name = $1
                  and (${schema}.acl.category = ANY ($2::text[]) or
                       '*' = ANY ($2::text[]) or
                       ${schema}.acl.category = '*')
                order by ${schema}.acl.permission, ${schema}.acl.resource`, [roleId, categories]);
    return res.rows;
}

export async function addAclRuleToRole(client, schema, roleName, aclName) {
    const res = await client.query(`insert into ${schema}.role_acl (role,acl)
         values ((select id from ${schema}.role where name=$1),
                 (select id from ${schema}.acl where name=$2))`,
        [roleName, aclName]);
    return res.rowCount;
}

export async function getRoleById(client, schema, roleId) {
    const res = await client.query(`select * from ${schema}.role 
        where id = $1`, [roleId]);
    return res.rowCount === 1 ? res.rows[0] : null;
}

export async function getRoleByName(client, schema, name) {
    const res = await client.query(`select * from ${schema}.role 
        where name = $1`, [name]);
    return res.rowCount === 1 ? res.rows[0] : null;
}
