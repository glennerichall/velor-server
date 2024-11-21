import {
    DATA_ACCESS,
    DATA_ACL,
    DATA_API_KEYS,
    DATA_AUTH_TOKENS,
    DATA_AUTHS,
    DATA_ROLES,
    DATA_USERS,
} from "./serverDataKeys.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";

export function getDataUsers(services) {
    return getDatabase(services)[DATA_USERS];
}

export function getDataAuths(services) {
    return getDatabase(services)[DATA_AUTHS];
}

export function getDataAccess(services) {
    return getDatabase(services)[DATA_ACCESS];
}

export function getDataAuthTokens(services) {
    return getDatabase(services)[DATA_AUTH_TOKENS];
}

export function getDataApiKeys(services) {
    return getDatabase(services)[DATA_API_KEYS];
}

export function getDataAcl(services) {
    return getDatabase(services)[DATA_ACL];
}

export function getDataRoles(services) {
    return getDatabase(services)[DATA_ROLES];
}