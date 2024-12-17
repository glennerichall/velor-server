import {Strategy} from 'openid-client/passport';
import * as client from 'openid-client';
import Url from "node:url";
import {composeOnProfileReceived} from "./composeOnProfileReceived.mjs";
import {URL_PASSPORT_CALLBACK} from "velor-contrib/contrib/urls.mjs";
import {StrategyBase} from "./StrategyBase.mjs";
import {AUTH_OPENID} from "velor-contrib/contrib/authProviders.mjs";
import {getFullHostUrls} from "../../application/services/constants.mjs";

function composeOnProfileReceivedAdapter(onProfileReceived) {
    return (req, tokens, done) => {
        let profile = tokens.claims();
        onProfileReceived(req, null, null, profile, done);
    };
}

export class VelorStrategy extends StrategyBase {
    #strategy;
    #clientID;
    #clientSecret;
    #velorUrl;

    constructor(passport, clientID, clientSecret, velorUrl = 'https://auth.velor.ca') {
        super(passport)
        this.#clientID = clientID;
        this.#clientSecret = clientSecret;
        this.#velorUrl = velorUrl;
    }

    async use() {
        if (this.#strategy) return;

        let config = await client.discovery(
            new Url.URL(`${this.#velorUrl}/realms/${this.#clientID}/.well-known/openid-configuration`),
            this.#clientID,
            this.#clientSecret,
            undefined,
        );

        let scope = 'openid email profile';
        let callbackURL = getFullHostUrls(this)[URL_PASSPORT_CALLBACK].replace(':provider', AUTH_OPENID);

        this.#strategy = new Strategy(
            {
                config,
                scope,
                passReqToCallback: true,
                callbackURL,
            },
            composeOnProfileReceivedAdapter(
                composeOnProfileReceived(AUTH_OPENID)
            ),
        );

        this.#strategy.currentUrl = req => {
            return new URL(`${req.protocol}://${req.host}:${req.socket.localPort}${req.originalUrl ?? req.url}`);
        }

        this.passport.use(AUTH_OPENID, this.#strategy);
    }

    initiate(req, res, next) {
        return this.passport.authenticate(AUTH_OPENID,
            {
                scope: 'openid email profile',
                passReqToCallback: true,
            })(req, res, next);
    }

    authenticate(req, res, next) {
        return this.passport.authenticate(AUTH_OPENID,
            {
                failureFlash: true,
            })(req, res, next);
    }

}