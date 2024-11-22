import {
    DATA_ACCESS,
    DATA_ACL,
    DATA_API_KEYS,
    DATA_AUTH_TOKENS,
    DATA_AUTHS,
    DATA_USERS,
    DATA_ROLES,
    DATA_PREFERENCES
} from "../application/services/serverDataKeys.mjs";

export const statements = {
    [DATA_ACCESS]: access,
    [DATA_AUTH_TOKENS]: authTokens,
    [DATA_AUTHS]: auths,
    [DATA_USERS]: users,
    [DATA_API_KEYS]: apiKeys,
    [DATA_ACL]: acl,
    [DATA_ROLES]: roles,
    [DATA_PREFERENCES]: preferences,
};