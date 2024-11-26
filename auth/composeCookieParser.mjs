import cookieParser from 'cookie-parser';
import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {COOKIE_SECRET} from "../application/services/serverEnvKeys.mjs";

export function composeCookieParser(services) {
    const secret = getEnvValue(services, COOKIE_SECRET);
    return cookieParser(secret);
}