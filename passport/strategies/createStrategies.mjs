import {TokenStrategy} from "./token.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import passport from 'passport';
import {
    AUTH_TOKEN,
    AUTH_VELOR
} from "velor-contrib/contrib/authProviders.mjs";
import {getUserSerializer} from "../../application/services/serverServices.mjs";
import {VelorStrategy} from "./velor.mjs";

export function createStrategies(services, providers) {

    let token = providers[AUTH_TOKEN];
    let velor = providers[AUTH_VELOR];

    let strategies = {};

    if (velor) {
        strategies[AUTH_VELOR] =
            getServiceBinder(services).createInstance(VelorStrategy,
                passport,
                velor.clientId, velor.clientSecret);
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