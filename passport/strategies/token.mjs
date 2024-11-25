import Custom from 'passport-custom';
import {AUTH_TOKEN} from "velor-contrib/contrib/authProviders.mjs";
import {chainHandlers} from "../../core/chainHandlers.mjs";
import {composeOnProfileReceived} from "./composeOnProfileReceived.mjs";
import {getFullHostUrls} from "../../application/services/requestServices.mjs";
import {URL_LOGIN_SUCCESS} from "velor-contrib/contrib/urls.mjs";
import os from "os";

function composeOnProfileReceivedTokenAdapter(onProfileReceived, token) {
    return (req, done) => {
        if (req.get('Authorization') === token) {
            const currentUser = os.userInfo().username;

            onProfileReceived(req, null, null, {
                id: 'Token',
                email: 'zupfe@velor.ca',
                displayName: currentUser,
            }, done);
        } else {
            done(new Error('Invalid token'));
        }
    }
}

function composeInitiator(passport) {
    const initiate = passport.authenticate(AUTH_TOKEN,
        {
            passReqToCallback: true,
        });

    const replyOnError = (err, req, res, next) => {
        if (err.message === 'Invalid token') {
            res.status(401).end();
        } else {
            next(err);
        }
    };

    const replyLoggedIn = (req, res) => {
        const urls = getFullHostUrls(req)[URL_LOGIN_SUCCESS];
        res.redirect(urls);
    };

    return chainHandlers(
        initiate,
        replyLoggedIn,
        replyOnError
    );
}

export class TokenStrategy {
    #passport;
    #strategy;
    #initiator;
    #token;

    constructor(passport, token) {
        this.#passport = passport;
        this.#token = token;
        this.#initiator = composeInitiator(passport);
    }

    get initialized() {
        return !!this.#strategy;
    }

    initialize() {
        this.#strategy = new Custom.Strategy(
            composeOnProfileReceivedTokenAdapter(
                composeOnProfileReceived(this, AUTH_TOKEN),
                this.#token
            )
        );
        this.#passport.use(AUTH_TOKEN, this.#strategy);
    }

    initiate(req, res, next) {
        return this.#initiator(req, res, next);
    }
}
