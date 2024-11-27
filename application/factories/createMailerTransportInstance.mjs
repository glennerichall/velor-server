import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {
    AUTH_EMAIL_HOST,
    AUTH_EMAIL_PASSWORD,
    AUTH_EMAIL_PORT,
    AUTH_EMAIL_USER
} from "../services/serverEnvKeys.mjs";
import nodemailer from "nodemailer";

export function createMailerTransportInstance(services) {

    const host = getEnvValue(services, AUTH_EMAIL_HOST);
    const port = getEnvValue(services, AUTH_EMAIL_PORT);
    const user = getEnvValue(services, AUTH_EMAIL_USER);
    const pass = getEnvValue(services, AUTH_EMAIL_PASSWORD);

    return nodemailer.createTransport({
        host,
        port,
        secure: true,
        auth: {
            user,
            pass
        }
    });
}