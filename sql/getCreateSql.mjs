import {getFSAsync} from "velor-utils/utils/sysProvider.mjs";
import path from "node:path";
import {
    getTableNames
} from "./defaultTableNames.mjs";

const __dirname = import.meta.dirname;

export async function getCreateSql(schema, tableNames = {}) {

    const {
        error,
        access,
        preferences,
        migrations,
        deployments,
        auths,
        logins,
        users,
        userAuths,
        rolesAcl,
        userRoles,
        roles,
        acl,
        apiKeys,
        apiKeysAcl,
        userApiKeys,
        authTokens,
        tokens,
    } = getTableNames(tableNames);

    let createSql = await getFSAsync().readFile(path.join(__dirname, 'createSql.sql'));
    return createSql.toString()
        .replaceAll('@{SCHEMA}', schema)
        .replaceAll('@{TABLE_DEPLOYMENTS}', deployments)
        .replaceAll('@{TABLE_MIGRATIONS}', migrations)
        .replaceAll('@{TABLE_ERROR}', error)
        .replaceAll('@{TABLE_ACCESS}', access)
        .replaceAll('@{TABLE_PREFERENCES}', preferences)
        .replaceAll('@{TABLE_AUTHS}', auths)
        .replaceAll('@{TABLE_LOGINS}', logins)
        .replaceAll('@{TABLE_USERS}', users)
        .replaceAll('@{TABLE_USER_AUTHS}', userAuths)
        .replaceAll('@{TABLE_ROLE_ACL}', rolesAcl)
        .replaceAll('@{TABLE_USER_ROLE}', userRoles)
        .replaceAll('@{TABLE_ROLE}', roles)
        .replaceAll('@{TABLE_ACL}', acl)
        .replaceAll('@{TABLE_API_KEYS}', apiKeys)
        .replaceAll('@{TABLE_API_KEYS_ACL}', apiKeysAcl)
        .replaceAll('@{TABLE_USERS_API_KEYS}', userApiKeys)
        .replaceAll('@{TABLE_AUTH_TOKENS}', authTokens)
        .replaceAll('@{TABLE_TOKENS}', tokens);
}