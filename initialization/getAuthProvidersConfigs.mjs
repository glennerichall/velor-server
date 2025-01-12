import {
    AUTH_OPENID,
    AUTH_TOKEN
} from "velor-contrib/contrib/authProviders.mjs";
import {
    getEnvValue,
    getEnvValueArray,
    getEnvValues,
    isProduction,
    isStaging
} from "velor-services/application/services/baseServices.mjs";
import {
    AUTH_OPENID_CLIENT_ID,
    AUTH_OPENID_CLIENT_SECRET,
    AUTH_TOKEN_SECRETS
} from "../application/services/envKeys.mjs";

export function getAuthProvidersConfigs(services) {

    let providers = {};

    if (!isProduction(services) || !isStaging(services)) {
        const tokens = getEnvValueArray(services, AUTH_TOKEN_SECRETS);
        if (tokens) {
            providers[AUTH_TOKEN] = {tokens};
        }
    }

    let clientId = getEnvValue(services, AUTH_OPENID_CLIENT_ID);
    let clientSecret = getEnvValue(services, AUTH_OPENID_CLIENT_SECRET);

    if (clientId && clientSecret) {
        providers[AUTH_OPENID] = {
            clientId,
            clientSecret,
        };
    } else if (clientId || clientSecret) {
        throw new Error("clientId and clientSecret must be provided to enable openid provider");
    }

    return providers;
}