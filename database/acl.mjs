export const ACL_GRANT = 'grant';
export const ACL_DENY = 'deny';

export async function insertAclRule(client, schema, {
    name,
    resource,
    permission,
    method,
    category,
    description
}) {
    const res = await client
        .query(`insert into ${schema}.acl 
           (name, resource, permission, method, category, description) 
           values ($1, $2, $3, $4, $5, $6) returning *`,
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

export async function insertAclGrantRule(client, schema, rule) {
    return insertAclRule(client, schema, {
        ...rule,
        permission: ACL_GRANT
    });
}

export async function insertAclDenyRule(client, schema, rule) {
    return insertAclRule(client, schema, {
        ...rule,
        permission: ACL_DENY
    });
}

export async function getAllAclRules(client, schema) {
    const res = await client
        .query(`select * from ${schema}.acl`);
    return res.rows;
}

export async function getAclRuleById(client, schema, ruleId) {
    const res = await client
        .query(`select * from ${schema}.acl
                where id = $1`, [ruleId]);
    return res.rowCount === 1 ? res.rows[0] : null;
}


export async function getAclRuleByName(client, schema, name) {
    const res = await client
        .query(`select * from ${schema}.acl
                where name = $1`, [name]);
    return res.rowCount === 1 ? res.rows[0] : null;
}
