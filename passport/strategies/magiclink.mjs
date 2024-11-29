import {configs} from "./magiclink/configs.mjs";
import {MagicLinkTokenStorage} from "./magiclink/MagicLinkTokenStorage.mjs";
import {AUTH_MAGIC_LINK} from "velor-contrib/contrib/authProviders.mjs";
import {composeOnProfileReceivedMagicLinkAdapter} from "./magiclink/composeOnProfileReceivedMagicLinkAdapter.mjs";
import MagicLink from "passport-magic-link";
import {composeSendTokenByEmail} from "./magiclink/composeSendTokenByEmail.mjs";
import {composeMagicLinkInitiator} from "./magiclink/composeMagicLinkInitiator.mjs";
import {composeOnProfileReceived} from "./composeOnProfileReceived.mjs";
import {composeMagicLinkAuthenticator} from "./magiclink/composeMagicLinkAuthenticator.mjs";
import {getDataAuthTokens} from "../../application/services/dataServices.mjs";
import {getMailer} from "../../application/services/serverServices.mjs";
import {getFullHostUrls} from "../../application/services/requestServices.mjs";
import {
    URL_PASSPORT_CALLBACK
} from "velor-contrib/contrib/urls.mjs";


export class MagicLinkStrategy {
    #strategy;
    #passport;
    #initiator;
    #authenticator;
    #secret;

    constructor(passport, secret) {
        this.#passport = passport;
        this.#secret = secret;
    }

    initialize() {
        this.#initiator = composeMagicLinkInitiator(this.#passport);
        this.#authenticator = composeMagicLinkAuthenticator(this.#passport);
    }

    #prepare() {

        if (this.#strategy) return;

        const config = {
            secret: this.#secret,
            userFields: ['email'],
            tokenField: 'token',
            storage: new MagicLinkTokenStorage(getDataAuthTokens(this)),
            passReqToCallbacks: true,
            userPrimaryKey: 'loginAuth',
            ...configs,
        };

        const mailer = getMailer(this);
        const urls = getFullHostUrls(this);
        const callbackURL = urls[URL_PASSPORT_CALLBACK].replace(':provider', AUTH_MAGIC_LINK);

        this.#strategy = new MagicLink.Strategy(
            config,
            composeSendTokenByEmail(callbackURL, mailer.sendMail.bind(mailer)),
            composeOnProfileReceivedMagicLinkAdapter(
                composeOnProfileReceived(this, AUTH_MAGIC_LINK)
            ));

        this.#passport.use(AUTH_MAGIC_LINK, this.#strategy);
    }

    initiate(req, res, next) {
        this.#prepare();
        return this.#initiator(req, res, next);
    }

    authenticate(req, res, next) {
        this.#prepare();
        return this.#authenticator(req, res, next);
    }
}

