import {
    s_clientEventHandler,
    s_eventHandler,
    s_expressApp,
    s_fileManager,
    s_fileStore,
    s_loginEventHandler,
    s_mailer,
    s_mailerTransport,
    s_messageFactory,
    s_rateLimiter,
    s_resourceBuilder,
    s_routerBuilder,
    s_server,
    s_userSerializer,
    s_wsConnectionManager,
    s_wsManagerProvider,
} from "./serviceKeys.mjs";
import {createServerInstance} from "../factories/createServerInstance.mjs";
import express from "express";
import {createUserSerializerInstance} from "../factories/createUserSerializerInstance.mjs";
import {createMailerInstance} from "../factories/createMailerInstance.mjs";
import {createMailerTransportInstance} from "../factories/createMailerTransportInstance.mjs";
import {s_clientProvider} from "velor-distribution/application/services/serviceKeys.mjs";
import {ClientProviderPubSub} from "velor-distribution/distribution/ClientProviderPubSub.mjs";
import {createWsUserConnectionManagerInstance} from "../factories/createWsUserConnectionManagerInstance.mjs";
import {WsManagerProvider} from "../../sockets/WsManagerProvider.mjs";
import {
    SCOPE_PROTOTYPE
} from "velor-services/injection/ServicesContext.mjs";
import {RateLimiterMemory} from "rate-limiter-flexible";
import {createRouterBuilder} from "../../core/RouterBuilder.mjs";
import {ResourceBuilder} from "../../core/ResourceBuilder.mjs";
import {createMessageFactoryInstance} from "../factories/createMessageFactoryInstance.mjs";
import {EventHandler} from "../../events/EventHandler.mjs";
import {LoginHandler} from "../../events/LoginHandler.mjs";
import {ClientEventHandler} from "../../events/ClientEventHandler.mjs";
import {FileManager} from "../../files/FileManager.mjs";
import {createFileStoreInstance} from "../factories/createFileStoreInstance.mjs";

export const factories = {

    // Singletons

    [s_server]: createServerInstance,
    [s_expressApp]: () => express(),
    [s_userSerializer]: createUserSerializerInstance,
    [s_mailer]: createMailerInstance,
    [s_mailerTransport]: createMailerTransportInstance,
    [s_clientProvider]: ClientProviderPubSub,
    [s_wsConnectionManager]: createWsUserConnectionManagerInstance,
    [s_wsManagerProvider]: WsManagerProvider,
    [s_messageFactory]: createMessageFactoryInstance,

    [s_eventHandler]: EventHandler,
    [s_loginEventHandler]: LoginHandler,
    [s_clientEventHandler]: ClientEventHandler,
    [s_fileManager]: FileManager,
    [s_fileStore]: createFileStoreInstance,


    // Prototypes

    [s_rateLimiter]: {
        scope: SCOPE_PROTOTYPE,
        factory: (_, configs) => new RateLimiterMemory(configs),
    },
    [s_routerBuilder]: {
        scope: SCOPE_PROTOTYPE,
        factory: createRouterBuilder
    },
    [s_resourceBuilder]: {
        scope: SCOPE_PROTOTYPE,
        clazz: ResourceBuilder
    },

    // Request scope

}