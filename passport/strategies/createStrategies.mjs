import {GitHubStrategy} from "./github.mjs";
import {GoogleStrategy} from "./google.mjs";
import {MagicLinkStrategy} from "./magiclink.mjs";
import {TokenStrategy} from "./token.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import passport from 'passport';

export function createStrategies(services, configs) {

    const {
        google,
        github,
        token,
        magiclink
    } = configs;

    let strategies = [];

    if (github) {
        strategies.push(
            getServiceBinder(services).createInstance(GitHubStrategy,
                passport,
                github.clientID, github.clientSecret)
        );
    }

    if (google) {
        strategies.push(
            getServiceBinder(services).createInstance(GoogleStrategy,
                passport,
                google.clientID, google.clientSecret)
        );
    }

    if (magiclink) {
        strategies.push(
            getServiceBinder(services).createInstance(MagicLinkStrategy,
                passport,
                magiclink.sendMail, magiclink.clientSecret)
        );
    }

    if (token) {
        strategies.push(
            getServiceBinder(services).createInstance(TokenStrategy,
                passport,
                token.token)
        );
    }

    return strategies;
}