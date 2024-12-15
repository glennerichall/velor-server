import {
    getEnvValue,
    getProvider
} from "velor-services/application/services/baseServices.mjs";

import {s_mailerTransport} from "../services/serviceKeys.mjs";
import {
    AUTH_EMAIL_USER,
} from "../services/envKeys.mjs";
import {Mailer} from "../../mailer/Mailer.mjs";

export function createMailerInstance(services) {
    const provider = getProvider(services);
    const mailerTransport = provider[s_mailerTransport]();
    const sender = getEnvValue(services, AUTH_EMAIL_USER);

    return new Mailer(mailerTransport, sender);
}