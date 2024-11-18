import Strategy from 'passport-google-oauth20';
import {AUTH_GOOGLE} from "velor-contrib/contrib/authProviders.mjs";
import {composeOnProfileReceived} from "./composeOnProfileReceived.mjs";

export class GoogleStrategy {
    #strategy;
    #passport;
    #clientID;
    #clientSecret;

    constructor(passport, clientID, clientSecret) {
        this.#clientID = clientID;
        this.#clientSecret = clientSecret;
        this.#passport = passport;
    }

    get initialized() {
        return !!this.#strategy;
    }

    initialize(callbackURL) {
        const configs = {
            clientID: this.#clientID,
            clientSecret: this.#clientSecret,
            callbackURL: callbackURL.replace(':provider', AUTH_GOOGLE),
            passReqToCallback: true,
            scope: ['profile'],
            state: true,
        };

        this.#strategy = new Strategy(configs,
            composeOnProfileReceived(this, AUTH_GOOGLE));

        this.#passport.use(AUTH_GOOGLE, this.#strategy);
    }

    initiate(req, res, next) {
        return this.#passport.authenticate(AUTH_GOOGLE,
            {
                scope: ['profile', 'email'],
                passReqToCallback: true,
            })(req, res, next);
    }

    authenticate(req, res, next) {
        return this.#passport.authenticate(AUTH_GOOGLE,
            {
                failureFlash: true,
            })(req, res, next);
    }
}