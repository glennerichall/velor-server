import {getProvider} from "velor/utils/injection/baseServices.mjs";

import {
    s_clientProvider,
    s_database,
    s_keyStore,
    s_mailer,
    s_messageQueue,
    s_pubSub,
    s_userManager,
} from "./backendServiceKeys.mjs";

export function getDatabase(req) {
    return getProvider(req)[s_database]();
}

export function getMessageQueue(services) {
    return getProvider(services)[s_messageQueue]();
}

export function getKeyStore(services) {
    return getProvider(services)[s_keyStore]();
}

export function getClientProvider(services) {
    return getProvider(services)[s_clientProvider]();
}

export function getPubSub(services) {
    return getProvider(services)[s_pubSub]();
}

export function getUserManager(services) {
    return getProvider(services)[s_userManager]();
}

export function getMailer(services) {
    return getProvider(services)[s_mailer]();
}
