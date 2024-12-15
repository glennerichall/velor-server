import {TokenStrategy} from "./token.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import passport from 'passport';
import {
    AUTH_OPENID,
    AUTH_TOKEN,
} from "velor-contrib/contrib/authProviders.mjs";
import {getUserSerializer} from "../../application/services/services.mjs";
import {VelorStrategy} from "./velor.mjs";

export function createStrategies(services, providers) {

    let token = providers[AUTH_TOKEN];
    let openId = providers[AUTH_OPENID];

    let strategies = {};

    if (openId) {
        strategies[AUTH_OPENID] =
            getServiceBinder(services).createInstance(VelorStrategy,
                passport,
                openId.clientId, openId.clientSecret);
    }

    if (token) {
        strategies[AUTH_TOKEN] =
            getServiceBinder(services).createInstance(TokenStrategy,
                passport,
                token.token);
    }

    const userSerializer = getUserSerializer(services);
    passport.serializeUser(async (user, done) => {
        done(null, userSerializer.serialize(user));
    });

    passport.deserializeUser(async (user, done) => {
        done(null, userSerializer.deserialize(user));
    });


    return strategies;
}