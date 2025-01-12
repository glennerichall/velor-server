import Custom from 'passport-custom';
import {AUTH_TOKEN} from "velor-contrib/contrib/authProviders.mjs";
import {chainHandlers} from "../../core/chainHandlers.mjs";
import {composeOnProfileReceived} from "./composeOnProfileReceived.mjs";
import os from "os";
import {StrategyBase} from "./StrategyBase.mjs";
import {login} from "../handlers/login.mjs";

function composeOnProfileReceivedTokenAdapter(onProfileReceived, tokens) {
    return (req, done) => {
        let idx = tokens.indexOf(req.get('Authorization'));
        if (idx >= 0) {
            const currentUser = os.userInfo().username;

            onProfileReceived(req, null, null, {
                id: `token_${idx}`,
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

    return chainHandlers(
        initiate,
        login,
        replyOnError
    );
}

const kp_strategy = Symbol();
const kp_initiator = Symbol();
const kp_tokens = Symbol();

export class TokenStrategy extends StrategyBase {

    constructor(passport, tokens) {
        super(passport);
        this[kp_tokens] = tokens;
        this[kp_initiator] = composeInitiator(passport);
    }

    initialize() {
        this[kp_strategy] = new Custom.Strategy(
            composeOnProfileReceivedTokenAdapter(
                composeOnProfileReceived(AUTH_TOKEN),
                this[kp_tokens]
            )
        );
        this.passport.use(AUTH_TOKEN, this[kp_strategy]);
    }

    initiate(req, res, next) {
        return this[kp_initiator](req, res, next);
    }
}
