import {getProvider} from "velor-services/injection/baseServices.mjs";
import {
    s_apiKeyDAO,
    s_authDAO,
    s_emitter,
    s_eventQueue,
    s_expressApp,
    s_mailer,
    s_messageFactory,
    s_preferenceDAO,
    s_rateLimiter,
    s_resourceBuilder,
    s_roleDAO,
    s_routerBuilder,
    s_ruleDAO,
    s_server,
    s_userDAO,
    s_userSerializer,
    s_wsConnectionManager,
    s_wsManagerProvider,
} from "./serverServiceKeys.mjs";

export function getMessageFactory(services) {
    return getProvider(services)[s_messageFactory]();
}

export function getEmitter(services) {
    return getProvider(services)[s_emitter]();
}

export function getEventQueue(services) {
    return getProvider(services)[s_eventQueue]();
}

export function getMailer(services) {
    return getProvider(services)[s_mailer]();
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

export function getPreferenceDAO(services) {
    return getProvider(services)[s_preferenceDAO]();
}

export function getUserSerializer(services) {
    return getProvider(services)[s_userSerializer]();
}

export function getWsConnectionManager(services) {
    return getProvider(services)[s_wsConnectionManager]();
}

export function getWsManagerProvider(services) {
    return getProvider(services)[s_wsManagerProvider]();
}

export function getRateLimiter(services, configs) {
    return getProvider(services)[s_rateLimiter](configs);
}

export function getRouterBuilder(services) {
    return getProvider(services)[s_routerBuilder]();
}

export function getResourceBuilder(services, configs) {
    return getProvider(services)[s_resourceBuilder](configs);
}