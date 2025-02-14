import {getProvider} from "velor-services/application/services/baseServices.mjs";
import {
    s_eventHandler,
    s_expressApp,
    s_fileManager,
    s_fileStore,
    s_mailer,
    s_messageFactory,
    s_rateLimiter,
    s_resourceBuilder,
    s_routerBuilder,
    s_server,
    s_userSerializer,
    s_wsConnectionManager,
    s_wsManagerProvider,
} from "./serviceKeys.mjs";

export function getMessageFactory(services) {
    return getProvider(services)[s_messageFactory]();
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

export function getEventHandler(services) {
    return getProvider(services)[s_eventHandler]();
}

export function getFileManager(services) {
    return getProvider(services)[s_fileManager]();
}

export function getFileStore(services) {
    return getProvider(services)[s_fileStore]();
}
