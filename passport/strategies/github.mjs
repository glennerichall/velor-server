import Strategy from 'passport-github2';
import {AUTH_GITHUB} from "velor-contrib/contrib/authProviders.mjs";
import {composeOnProfileReceived} from "./composeOnProfileReceived.mjs";


export class GitHubStrategy {
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
            callbackURL: callbackURL.replace(':provider', AUTH_GITHUB),
            passReqToCallback: true,
            scope: ['profile'],
            state: true
        };

        this.#strategy = new Strategy(configs,
            composeOnProfileReceived(this, AUTH_GITHUB));

        this.#passport.use(AUTH_GITHUB, this.#strategy);
    }

    initiate(req, res, next) {
        return this.#passport.authenticate(AUTH_GITHUB,
            {
                scope: ['user:email'],
                passReqToCallback: true,
            })(req, res, next);
    }

    authenticate(req, res, next) {
        return this.#passport.authenticate(AUTH_GITHUB,
            {
                failureFlash: true,
            })(req, res, next);
    }
}