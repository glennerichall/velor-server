import {doubleCsrf} from "csrf-csrf";
import {
    getEnvValue,
    isProduction,
    isStaging
} from "velor-services/injection/baseServices.mjs";
import {AUTH_TOKEN_SECRET} from "../application/services/serverEnvKeys.mjs";
import {getSessionId} from "../application/services/requestServices.mjs";

export function composeCsrfProtection(services) {
    const {
        doubleCsrfProtection
    } = doubleCsrf({
        getSecret: ()=> getEnvValue(services, AUTH_TOKEN_SECRET),
        getSessionIdentifier: (req) => getSessionId(req),
        cookieOptions: {
            secure: isProduction(services) || isStaging(services),
        }
    });

    return doubleCsrfProtection;
}