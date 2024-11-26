import {GitHubStrategy} from "./github.mjs";
import {GoogleStrategy} from "./google.mjs";
import {MagicLinkStrategy} from "./magiclink.mjs";
import {TokenStrategy} from "./token.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import passport from 'passport';
import {
    AUTH_GITHUB,
    AUTH_GOOGLE,
    AUTH_MAGIC_LINK,
    AUTH_TOKEN
} from "velor-contrib/contrib/authProviders.mjs";
import {getUserSerializer} from "../../application/services/serverServices.mjs";

export function createStrategies(services, providers) {

    let google = providers[AUTH_GOOGLE];
    let github = providers[AUTH_GITHUB];
    let token = providers[AUTH_TOKEN];
    let magiclink = providers[AUTH_MAGIC_LINK];

    let strategies = {};

    if (github) {
        strategies[AUTH_GITHUB] =
            getServiceBinder(services).createInstance(GitHubStrategy,
                passport,
                github.clientID, github.clientSecret);
    }

    if (google) {
        strategies[AUTH_GOOGLE] =
            getServiceBinder(services).createInstance(GoogleStrategy,
                passport,
                google.clientID, google.clientSecret);
    }

    if (magiclink) {
        strategies[AUTH_MAGIC_LINK] =
            getServiceBinder(services).createInstance(MagicLinkStrategy,
                passport,
                magiclink.clientSecret);
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
    })

    return strategies;
}