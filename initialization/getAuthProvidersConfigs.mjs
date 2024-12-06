import {
    AUTH_OPENID,
    AUTH_TOKEN
} from "velor-contrib/contrib/authProviders.mjs";
import {
    getEnvValue,
    isProduction,
    isStaging
} from "velor-services/injection/baseServices.mjs";
import {
    AUTH_OPENID_CLIENT_ID,
    AUTH_OPENID_CLIENT_SECRET,
    AUTH_TOKEN_SECRET
} from "../application/services/serverEnvKeys.mjs";

export function getAuthProvidersConfigs(services) {

    let providers = {};

    if (!isProduction(services) || !isStaging(services)) {
        const token = getEnvValue(services, AUTH_TOKEN_SECRET);
        if (token) {
            providers[AUTH_TOKEN] = {token};
        }
    }

    {
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
    }

    return providers;
}