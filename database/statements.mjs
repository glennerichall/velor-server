import * as access from './access.mjs';
import * as acl from './acl.mjs';
import * as apiKeys from './apiKeys.mjs';
import * as authTokens from './authTokens.mjs';
import * as users from './users.mjs';
import * as auths from './auths.mjs';
import * as roles from './roles.mjs';
import * as preferences from './preferences.mjs';

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