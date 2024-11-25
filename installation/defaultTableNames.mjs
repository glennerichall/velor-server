export const defaultTableNames = {
    error: 'error',
    access: 'access',
    preferences: 'preferences',
    migrations: 'migrations',
    deployments: 'deployments',
    auths: 'auths',
    logins: 'logins',
    users: 'users',
    userAuths: 'user_auths',
    rolesAcl: 'role_acl',
    userRoles: 'user_role',
    roles: 'role',
    acl: 'acl',
    apiKeys: 'api_keys',
    apiKeysAcl: 'api_keys_acl',
    userApiKeys: 'users_api_keys',
    authTokens: 'auth_tokens',
    tokens: 'tokens',
};

export function getTableNames(tableNames = {}) {
    return {
        ...defaultTableNames,
        ...tableNames,
    };
}