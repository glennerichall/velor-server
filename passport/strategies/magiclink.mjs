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

        const config = {
            secret: this.#secret,
            userFields: ['email'],
            tokenField: 'token',
            storage: new MagicLinkTokenStorage(getDataAuthTokens(this)),
            passReqToCallbacks: true,
            userPrimaryKey: 'loginAuth',
            ...configs,
        };

        this.#strategy = new MagicLink.Strategy(
            config,
            composeSendTokenByEmail('name'),
            composeOnProfileReceivedMagicLinkAdapter(
                composeOnProfileReceived(AUTH_MAGIC_LINK)
            ));

        this.#passport.use(AUTH_MAGIC_LINK, this.#strategy);
    }

    initiate(req, res, next) {
        return this.#initiator(req, res, next);
    }

    authenticate(req, res, next) {
        return this.#authenticator(req, res, next);
    }
}

