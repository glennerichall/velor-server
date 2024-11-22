import {
    DATA_ACL,
    DATA_API_KEYS,
    DATA_AUTH_TOKENS,
    DATA_AUTHS,
    DATA_PREFERENCES,
    DATA_ROLES,
    DATA_USERS
} from "../application/services/serverDataKeys.mjs";
import {composeAuthTokensDataAccess} from "./authTokens.mjs";
import {composeAuthsDataAccess} from "./auths.mjs";
import {composeUsersDataAccess} from "./users.mjs";
import {composeApiKeysDataAccess} from "./apiKeys.mjs";
import {composeAclDataAccess} from "./acl.mjs";
import {composeRolesDataAccess} from "./roles.mjs";
import {composePreferencesDataAccess} from "./preferences.mjs";

export function composeStatements(schema, tableNames = {}) {
    return {
        [DATA_AUTH_TOKENS]: composeAuthTokensDataAccess(schema, tableNames),
        [DATA_AUTHS]: composeAuthsDataAccess(schema, tableNames),
        [DATA_USERS]: composeUsersDataAccess(schema, tableNames),
        [DATA_API_KEYS]: composeApiKeysDataAccess(schema, tableNames),
        [DATA_ACL]: composeAclDataAccess(schema, tableNames),
        [DATA_ROLES]: composeRolesDataAccess(schema, tableNames),
        [DATA_PREFERENCES]: composePreferencesDataAccess(schema, tableNames),
    }
}