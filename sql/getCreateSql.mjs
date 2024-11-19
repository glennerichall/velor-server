import {getFSAsync} from "velor-utils/utils/sysProvider.mjs";
import path from "node:path";

const __dirname = import.meta.dirname;

export async function getCreateSql(schema, {
    error = 'error',
    access = 'access',
    preferences = 'preferences',
    migrations = 'migrations',
    deployments = 'deployments',
    auths = 'auths',
    logins = 'logins',
    users = 'users',
    userAuths = 'user_auths',
    roleAcl = 'role_acl',
    userRole = 'user_role',
    role = 'role',
    acl = 'acl',
    apiKeys = 'api_keys',
    apiKeysAcl = 'api_keys_acl',
    userApiKeys = 'users_api_keys',
    authTokens = 'auth_tokens',
    tokens = 'tokens',
} = {}) {
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
        .replaceAll('@{TABLE_ROLE_ACL}', roleAcl)
        .replaceAll('@{TABLE_USER_ROLE}', userRole)
        .replaceAll('@{TABLE_ROLE}', role)
        .replaceAll('@{TABLE_ACL}', acl)
        .replaceAll('@{TABLE_API_KEYS}', apiKeys)
        .replaceAll('@{TABLE_API_KEYS_ACL}', apiKeysAcl)
        .replaceAll('@{TABLE_USERS_API_KEYS}', userApiKeys)
        .replaceAll('@{TABLE_AUTH_TOKENS}', authTokens)
        .replaceAll('@{TABLE_TOKENS}', tokens);
}