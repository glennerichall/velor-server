export async function getAllRoles(client, schema) {
    const res = await client.query(`select * from ${schema}.role`);
    return res.rows;
}

export async function insertRole(client, schema, name, description) {
    const res = await client.query(`INSERT INTO ${schema}.role (name, description)
             VALUES ($1, $2) RETURNING *`, [name, description]);
    return res.rows[0];
}

export async function addAclRuleToRole(client, schema, roleName, aclName) {
    const res = client.query(`insert into ${schema}.role_acl (role,acl)
         values ((select id from ${schema}.role where name=$1),
                 (select id from ${schema}.acl where name=$2))`,
        [roleName, aclName]);
    return res.rowCount;
}

