import {ACL_CATEGORY_ANY} from "../auth/permissions.mjs";
import {getTableNames} from "../installation/defaultTableNames.mjs";

export function getRolesSql(schema, tableNames = {}) {
    const {
        roles,
        rolesAcl,
        acl
    } = getTableNames(tableNames);


    const getAllRolesSql = `
        select *
        from ${schema}.${roles}
    `;

    const createRoleSql = `
        INSERT INTO ${schema}.${roles} (name, description)
        VALUES ($1, $2) RETURNING *
    `;

    const getRoleAclRulesByNameSql = `
        select ${schema}.${acl}.id         as id,
               ${schema}.${acl}.name       as name,
               ${schema}.${acl}.resource   as resource,
               ${schema}.${acl}.method     as method,
               ${schema}.${acl}.permission as permission,
               ${schema}.${acl}.category   as category
        from ${schema}.${acl}
                 inner join ${schema}.${rolesAcl} ra on ${schema}.${acl}.id = ra.acl
                 inner join ${schema}.${roles} r on r.id = ra.role
        where r.name = $1
          and (${schema}.${acl}.category = ANY ($2::text[]) or
               '*' = ANY ($2::text[]) or
               ${schema}.${acl}.category = '*')
        order by ${schema}.${acl}.permission, ${schema}.${acl}.resource
    `;

    const addAclRuleToRoleSql = `
        insert into ${schema}.${rolesAcl} (role, acl)
        values ((select id from ${schema}.${roles} where name = $1),
                (select id from ${schema}.${acl} where name = $2))
    `;

    const getRoleByIdSql = `
        select *
        from ${schema}.${roles}
        where id = $1
    `;

    const getRoleByNameSql = `
        select *
        from ${schema}.${roles}
        where name = $1
    `;


    return {
        getAllRolesSql,
        createRoleSql,
        getRoleAclRulesByNameSql,
        addAclRuleToRoleSql,
        getRoleByIdSql,
        getRoleByNameSql
    };

}

export function composeRolesDataAccess(schema, tableNames = {}) {

    const {
        getAllRolesSql,
        createRoleSql,
        getRoleAclRulesByNameSql,
        addAclRuleToRoleSql,
        getRoleByIdSql,
        getRoleByNameSql
    } = getRolesSql(schema, tableNames);

    async function getAllRoles(client) {
        const res = await client.query(getAllRolesSql);
        return res.rows;
    }

    async function createRole(client, name, description) {
        const res = await client.query(createRoleSql, [name, description]);
        return res.rows[0];
    }

    async function getRoleAclRulesByName(client, roleName, ...categories) {
        if (categories.length === 0) {
            categories.push(ACL_CATEGORY_ANY);
        }
        const res = await client.query(getRoleAclRulesByNameSql, [roleName, categories]);
        return res.rows;
    }

    async function addAclRuleToRole(client, roleName, aclName) {
        const res = await client.query(addAclRuleToRoleSql, [roleName, aclName]);
        return res.rowCount;
    }

    async function getRoleById(client, roleId) {
        const res = await client.query(getRoleByIdSql, [roleId]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    async function getRoleByName(client, name) {
        const res = await client.query(getRoleByNameSql, [name]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    return {
        getAllRoles,
        createRole,
        getRoleAclRulesByName,
        addAclRuleToRole,
        getRoleById,
        getRoleByName
    };
}