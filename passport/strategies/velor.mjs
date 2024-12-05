import {Strategy} from 'openid-client/passport';
import * as client from 'openid-client';
import Url from "node:url";
import {composeOnProfileReceived} from "./composeOnProfileReceived.mjs";
import {AUTH_VELOR} from "velor-contrib/contrib/authProviders.mjs";
import {getFullHostUrls} from "../../application/services/requestServices.mjs";
import {URL_PASSPORT_CALLBACK} from "velor-contrib/contrib/urls.mjs";
import {StrategyBase} from "./StrategyBase.mjs";

function composeOnProfileReceivedAdapter(onProfileReceived) {
    return (req, tokens, done) => {
        let profile = tokens.claims();
        onProfileReceived(req, null, null, profile, done);
    };
}

export class VelorStrategy  extends StrategyBase{
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
        let callbackURL = getFullHostUrls(this)[URL_PASSPORT_CALLBACK].replace(':provider', AUTH_VELOR);

        this.#strategy = new Strategy(
            {
                config,
                scope,
                passReqToCallback: true,
                callbackURL,
            },
            composeOnProfileReceivedAdapter(
                composeOnProfileReceived(AUTH_VELOR)
            ),
        );

        this.passport.use(AUTH_VELOR, this.#strategy);
    }

    initiate(req, res, next) {
        return this.passport.authenticate(AUTH_VELOR,
            {
                scope: 'openid email profile',
                passReqToCallback: true,
            })(req, res, next);
    }

    authenticate(req, res, next) {
        return this.passport.authenticate(AUTH_VELOR,
            {
                failureFlash: true,
            })(req, res, next);
    }

}