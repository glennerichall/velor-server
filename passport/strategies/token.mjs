import Custom from 'passport-custom';
import {TOKEN} from "../../auth/authProviders.mjs";
import {chainHandlers} from "../../core/chainHandlers.mjs";
import {composeOnProfileReceived} from "./composeOnProfileReceived.mjs";

function composeOnProfileReceivedTokenAdapter(onProfileReceived, token) {
    return (req, done) => {
        if (req.get('Authorization') === token) {
            onProfileReceived(req, null, null, {
                id: 'DevOps',
                email: 'zupfe@velor.ca',
                displayName: 'DevOps',
            }, done);
        } else {
            done(new Error('Invalid token'));
        }
    }
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
                composeOnProfileReceived(this, TOKEN),
            )
        );

        this.#passport.use(TOKEN, this.#strategy);
    }

    initiate(req, res, next) {
        return this.#initiator(req, res, next);
    }
}

function composeInitiator(passport) {
    const initiate = passport.authenticate(TOKEN,
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

    return chainHandlers(
        initiate,
        replyOnError
    );
}