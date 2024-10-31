import {configs} from "./magiclink/configs.mjs";
import {MagicLinkTokenStorage} from "./magiclink/MagicLinkTokenStorage.mjs";
import {MAGIC_LINK} from "../../auth/authProviders.mjs";
import {composeOnProfileReceivedMagicLinkAdapter} from "./magiclink/composeOnProfileReceivedMagicLinkAdapter.mjs";
import MagicLink from "passport-magic-link";
import {composeSendTokenByEmail} from "./magiclink/composeSendTokenByEmail.mjs";
import {
    getDatabase,
    getMailer
} from "../../application/services/backendServices.mjs";
import {composeMagicLinkInitiator} from "./magiclink/composeMagicLinkInitiator.mjs";
import {composeOnProfileReceived} from "./composeOnProfileReceived.mjs";
import {composeMagicLinkAuthenticator} from "./magiclink/composeMagicLinkAuthenticator.mjs";
import {composeLoginFromXHR} from "./magiclink/composeLoginFromXHR.mjs";


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

    get initialized() {
        return !!this.#strategy;
    }

    initialize(callbackURL,loginSuccessURL,
               loginFailureURL) {
        const config = {
            secret: this.#secret,
            userFields: ['email'],
            tokenField: 'token',
            storage: new MagicLinkTokenStorage(getDatabase(this).authTokens),
            passReqToCallbacks: true,
            userPrimaryKey: 'loginAuth',
            ...configs,
        };

        const mailer = getMailer(this);

        this.#strategy = new MagicLink.Strategy(
            config,
            composeSendTokenByEmail(callbackURL.replace(':provider', MAGIC_LINK), mailer.sendMail.bind(mailer)),
            composeOnProfileReceivedMagicLinkAdapter(
                composeOnProfileReceived(this, MAGIC_LINK)
            ));

        this.#passport.use(MAGIC_LINK, this.#strategy);

        const loginFromXHR = composeLoginFromXHR(this);

        this.#initiator = composeMagicLinkInitiator(this.#passport);
        this.#authenticator = composeMagicLinkAuthenticator(this.#passport, {
            loginSuccessURL,
            loginFailureURL,
            loginFromXHR
        });
    }

    initiate(req, res, next) {
        return this.#initiator(req, res, next);
    }

    authenticate(req, res, next) {
        return this.#authenticator(req, res, next);
    }
}

