import {
    getTableNames
} from "../installation/defaultTableNames.mjs";

export const ACL_GRANT = 'grant';
export const ACL_DENY = 'deny';

export function getAclSql(schema, tableNames = {}) {
    const {
        acl,
    } = getTableNames(tableNames);

    const insertAclRuleSql = `
        insert into ${schema}.${acl}
            (name, resource, permission, method, category, description)
        values ($1, $2, $3, $4, $5, $6) returning *
    `;

    const getAllAclRulesSql = `
        select *
        from ${schema}.${acl}
    `;

    const getAclRuleByIdSql = `
        select *
        from ${schema}.${acl}
        where id = $1
    `;

    const getAclRuleByNameSql = `
        select *
        from ${schema}.${acl}
        where name = $1
    `;


    return {
        insertAclRuleSql,
        getAllAclRulesSql,
        getAclRuleByIdSql,
        getAclRuleByNameSql
    };
}

export function composeAclDataAccess(schema, tableNames = {}) {

    const {
        insertAclRuleSql,
        getAllAclRulesSql,
        getAclRuleByIdSql,
        getAclRuleByNameSql
    } = getAclSql(schema, tableNames);


    async function insertAclRule(client, {
        name,
        resource,
        permission,
        method,
        category,
        description
    }) {
        const res = await client
            .query(insertAclRuleSql,
                [
                    name,
                    resource,
                    permission,
                    method,
                    category,
                    description
                ]);
        return res.rows[0];
    }

    async function insertAclGrantRule(client, rule) {
        return insertAclRule(client, {
            ...rule,
            permission: ACL_GRANT
        });
    }

    async function insertAclDenyRule(client, rule) {
        return insertAclRule(client, {
            ...rule,
            permission: ACL_DENY
        });
    }

    async function getAllAclRules(client) {
        const res = await client.query(getAllAclRulesSql);
        return res.rows;
    }

    async function getAclRuleById(client, ruleId) {
        const res = await client.query(getAclRuleByIdSql, [ruleId]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    async function getAclRuleByName(client, name) {
        const res = await client.query(getAclRuleByNameSql, [name]);
        return res.rowCount === 1 ? res.rows[0] : null;
    }

    return {
        insertAclRule,
        insertAclGrantRule,
        insertAclDenyRule,
        getAllAclRules,
        getAclRuleById,
        getAclRuleByName,
    };
}