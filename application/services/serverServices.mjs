import {getProvider} from "velor-services/injection/baseServices.mjs";
import {
    s_apiKeyDAO,
    s_authDAO,
    s_emitter,
    s_expressApp,
    s_mailer,
    s_messageFactory,
    s_roleDAO,
    s_ruleDAO,
    s_server,
    s_userDAO,
    s_userManager
} from "./serverServiceKeys.mjs";

export function getMessageFactory(services) {
    return getProvider(services)[s_messageFactory]();
}

export function getEmitter(services) {
    return getProvider(services)[s_emitter]();
}

export function getMailer(services) {
    return getProvider(services)[s_mailer]();
}

export function getUserManager(services) {
    return getProvider(services)[s_userManager]();
}

export function getExpressApp(services) {
    return getProvider(services)[s_expressApp]();
}

export function getServer(services) {
    return getProvider(services)[s_server]();
}

export function getRoleDAO(services) {
    return getProvider(services)[s_roleDAO]();
}

export function getRuleDAO(services) {
    return getProvider(services)[s_ruleDAO]();
}

export function getApiKeyDAO(services) {
    return getProvider(services)[s_apiKeyDAO]();
}

export function getUserDAO(services) {
    return getProvider(services)[s_userDAO]();
}

export function getAuthDAO(services) {
    return getProvider(services)[s_authDAO]();
}