import cookieSession from "cookie-session";
import {
    getEnvValue,
    isProduction,
    isStaging
} from "velor-services/injection/baseServices.mjs";
import {
    SESSION_SECRET1,
    SESSION_SECRET2
} from "../application/services/serverEnvKeys.mjs";


export function composeSessionParser(services) {
    let now = new Date();
    return cookieSession({
        name: 'session',
        keys: [
            getEnvValue(services, SESSION_SECRET1),
            getEnvValue(services, SESSION_SECRET2),
        ],
        expires: new Date(now.getFullYear() + 100, now.getMonth(), now.getDate()),
        // sameSite: getEnvValue(services, SAME_SITE) ?? "strict",
        secure: isProduction(services) || isStaging(services),
    });
}