import {Strategy} from 'openid-client/passport';
import * as client from 'openid-client';
import Url from "node:url";
import {composeOnProfileReceived} from "./composeOnProfileReceived.mjs";
import {
    AUTH_VELOR
} from "velor-contrib/contrib/authProviders.mjs";

function composeOnProfileReceivedAdapter(onProfileReceived) {
    return (req, tokens, done) => {
        let profile = tokens.claims();
        onProfileReceived(req, null, null, profile, done);
    };
}

export class VelorStrategy {
    #strategy;
    #passport;
    #clientID;
    #clientSecret;
    #velorUrl;

    constructor(passport, clientID, clientSecret, velorUrl) {
        this.#clientID = clientID;
        this.#clientSecret = clientSecret;
        this.#passport = passport;
        this.#velorUrl = velorUrl;
    }

    async initialize() {
        let config = await client.discovery(
            new Url.URL(`${hostname}/realms/${clientID}/.well-known/openid-configuration`),
            clientID,
            clientSecret,
            undefined,
        );

        let scope = 'openid email profile';

        this.#strategy = new Strategy(
            {
                config,
                scope,
                passReqToCallback: true,
                callbackURL: 'https://localhost:3000/callback'
            },
            composeOnProfileReceivedAdapter(
                composeOnProfileReceived(AUTH_VELOR)
            ),
        );

        this.#passport.use(AUTH_VELOR, this.#strategy);
    }

    initiate(req, res, next) {
        return this.#passport.authenticate(AUTH_VELOR,
            {
                scope: 'openid email profile',
                passReqToCallback: true,
            })(req, res, next);
    }

    authenticate(req, res, next) {
        return this.#passport.authenticate(AUTH_VELOR,
            {
                failureFlash: true,
            })(req, res, next);
    }

}