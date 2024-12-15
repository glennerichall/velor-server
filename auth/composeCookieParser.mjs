import cookieParser from 'cookie-parser';
import {getEnvValueArray} from "velor-services/application/services/baseServices.mjs";
import {COOKIE_SECRETS} from "../application/services/envKeys.mjs";

export function composeCookieParser(services) {
    const secrets = getEnvValueArray(services, COOKIE_SECRETS);
    return (req, res, next) => {
        return cookieParser(secrets)(req, res, next);
    };
}