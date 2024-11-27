import {
    getEnvValue,
    getProvider
} from "velor-services/injection/baseServices.mjs";

import {s_mailerTransport} from "../services/serverServiceKeys.mjs";
import {
    AUTH_EMAIL_USER,
} from "../services/serverEnvKeys.mjs";
import {Mailer} from "../../mailer/Mailer.mjs";

export function createMailerInstance(services) {
    const provider = getProvider(services);
    const mailerTransport = provider[s_mailerTransport]();
    const sender = getEnvValue(services, AUTH_EMAIL_USER);

    return new Mailer(mailerTransport, sender);
}