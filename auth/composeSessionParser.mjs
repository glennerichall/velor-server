import cookieSession from "cookie-session";
import {
    getEnvValueArray,
    isProduction,
    isStaging
} from "velor-services/application/services/baseServices.mjs";
import {
    SESSION_SECRETS,
} from "../application/services/envKeys.mjs";


export function composeSessionParser(services) {
    let now = new Date();
    return cookieSession({
        name: 'session',
        keys: getEnvValueArray(services, SESSION_SECRETS),
        expires: new Date(now.getFullYear() + 100, now.getMonth(), now.getDate()),
        // sameSite: getEnvValue(services, SAME_SITE) ?? "strict",
        secure: isProduction(services) || isStaging(services),
    });
}