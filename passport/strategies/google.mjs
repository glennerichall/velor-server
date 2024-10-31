import Strategy from 'passport-google-oauth20';
import {GOOGLE} from "../../auth/authProviders.mjs";
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
            callbackURL: callbackURL.replace(':provider', GOOGLE),
            passReqToCallback: true,
            scope: ['profile'],
            state: true,
        };

        this.#strategy = new Strategy(configs,
            composeOnProfileReceived(this, GOOGLE));

        this.#passport.use(GOOGLE, this.#strategy);
    }

    initiate(req, res, next) {
        return this.#passport.authenticate(GOOGLE,
            {
                scope: ['profile', 'email'],
                passReqToCallback: true,
            })(req, res, next);
    }

    authenticate(req, res, next) {
        return this.#passport.authenticate(GOOGLE,
            {
                failureFlash: true,
            })(req, res, next);
    }
}