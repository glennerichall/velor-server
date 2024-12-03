import crypto from "crypto";
import {configs} from "./configs.mjs";
import {
    getFullHostUrls,
    getSessionId,
    getWsId
} from "../../../application/services/requestServices.mjs";
import {
    getMagicLinkEncryption,
    getMailer
} from "../../../application/services/serverServices.mjs";
import {URL_PASSPORT_CALLBACK} from "velor-contrib/contrib/urls.mjs";
import {AUTH_MAGIC_LINK} from "velor-contrib/contrib/authProviders.mjs";

export function composeSendTokenByEmail(name) {

    return async (req, user, token) => {
        const mailer = getMailer(req);
        const urls = getFullHostUrls(req);
        const callbackURL = urls[URL_PASSPORT_CALLBACK].replace(':provider', AUTH_MAGIC_LINK);
        const encryption = getMagicLinkEncryption(req);

        req.requestId = crypto.randomInt(10000);
        const wsId = getWsId(req);

        // we call it rg arbitrarily
        let rg = encryption.encryptText(wsId);

        const content = `You requested to sign in to ${name}. Please open the link below in your browser to sign in.
Your request id is ${req.requestId}.

${callbackURL}?token=${token}&rg=${rg}

Link can only be used once and will expire in ${configs.ttl / 60} minutes
`;
        const email = user.email;
        const ok = await mailer.sendMail(email, `${name} sign-in`, content);
        if (!ok) {
            throw new Error('Unable to send mail');
        }
    }
}

