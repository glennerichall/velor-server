import * as access from './access.mjs';
import * as acl from './acl.mjs';
import * as apiKeys from './apiKeys.mjs';
import * as authTokens from './authTokens.mjs';
import * as userAuths from './user_auths.mjs';
import * as users from './users.mjs';
import * as auths from './auths.mjs';
import * as roles from './roles.mjs';

import {
    DATA_ACCESS,
    DATA_ACL,
    DATA_API_KEYS,
    DATA_AUTH_TOKENS,
    DATA_AUTHS,
    DATA_USER_AUTHS,
    DATA_USERS,
    DATA_ROLES
} from "../application/services/serverDataKeys.mjs";

export const statements = {
    [DATA_ACCESS]: access,
    [DATA_AUTH_TOKENS]: authTokens,
    [DATA_AUTHS]: auths,
    [DATA_USER_AUTHS]: userAuths,
    [DATA_USERS]: users,
    [DATA_API_KEYS]: apiKeys,
    [DATA_ACL]: acl,
    [DATA_ROLES]: roles,
};