import cookieParser from 'cookie-parser';
import {getEnvValueArray} from "velor-services/injection/baseServices.mjs";
import {COOKIE_SECRETS} from "../application/services/serverEnvKeys.mjs";

export function composeCookieParser(services) {
    const secrets = getEnvValueArray(services, COOKIE_SECRETS);
    return (req, res, next) => {
        return cookieParser(secrets)(req, res, next);
    };
}