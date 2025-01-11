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

const kp_strategy = Symbol();
const kp_clientID = Symbol();
const kp_clientSecret = Symbol();
const kp_velorUrl = Symbol();

export class VelorStrategy extends StrategyBase {

    constructor(passport, clientID, clientSecret, velorUrl = 'https://auth.velor.ca') {
        super(passport)
        this[kp_clientID] = clientID;
        this[kp_clientSecret] = clientSecret;
        this[kp_velorUrl] = velorUrl;
    }

    async use() {
        if (this[kp_strategy]) return;

        let config = await client.discovery(
            new Url.URL(`${this[kp_velorUrl]}/realms/${this[kp_clientID]}/.well-known/openid-configuration`),
            this[kp_clientID],
            this[kp_clientSecret],
            undefined,
        );

        let scope = 'openid email profile';
        let callbackURL = getFullHostUrls(this)[URL_PASSPORT_CALLBACK].replace(':provider', AUTH_OPENID);

        this[kp_strategy] = new Strategy(
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

        this[kp_strategy].currentUrl = req => {
            return new URL(`${req.protocol}://${req.host}:${req.socket.localPort}${req.originalUrl ?? req.url}`);
        }

        this.passport.use(AUTH_OPENID, this[kp_strategy]);
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