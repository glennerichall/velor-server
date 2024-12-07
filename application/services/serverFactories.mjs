import {
    s_apiKeyDAO,
    s_authDAO,
    s_emitter,
    s_eventQueue,
    s_expressApp,
    s_mailer,
    s_mailerTransport,
    s_preferenceDAO,
    s_rateLimiter,
    s_roleDAO,
    s_ruleDAO,
    s_server,
    s_userDAO,
    s_userSerializer,
    s_wsConnectionManager,
    s_wsManagerProvider,
} from "./serverServiceKeys.mjs";
import {s_databaseStatements} from "velor-database/application/services/databaseServiceKeys.mjs";
import {createServerInstance} from "../factories/createServerInstance.mjs";
import express from "express";
import {Emitter} from "velor-utils/utils/Emitter.mjs";
import {RoleDAO} from "../../models/RoleDAO.mjs";
import {RuleDAO} from "../../models/RuleDAO.mjs";
import {AuthDAO} from "../../models/AuthDAO.mjs";
import {ApiKeyDAO} from "../../models/ApiKeyDAO.mjs";
import {UserDAO} from "../../models/UserDAO.mjs";
import {PreferenceDAO} from "../../models/PreferenceDAO.mjs";
import {createStatementsInstance} from "../factories/createStatementsInstance.mjs";
import {createEventQueueInstance} from "../factories/createEventQueueInstance.mjs";
import {createUserSerializerInstance} from "../factories/createUserSerializerInstance.mjs";
import {createMailerInstance} from "../factories/createMailerInstance.mjs";
import {createMailerTransportInstance} from "../factories/createMailerTransportInstance.mjs";
import {s_clientProvider} from "velor-distribution/application/services/distributionServiceKeys.mjs";
import {ClientProviderPubSub} from "velor-distribution/distribution/ClientProviderPubSub.mjs";
import {createWsUserConnectionManagerInstance} from "../factories/createWsUserConnectionManagerInstance.mjs";
import {WsManagerProvider} from "../../sockets/WsManagerProvider.mjs";
import {SCOPE_PROTOTYPE} from "velor-services/injection/ServicesContext.mjs";
import {RateLimiterMemory} from "rate-limiter-flexible";

export const serverFactories = {
    [s_databaseStatements]: createStatementsInstance,
    [s_server]: createServerInstance,
    [s_expressApp]: () => express(),
    [s_emitter]: Emitter,
    [s_eventQueue]: createEventQueueInstance,
    [s_roleDAO]: RoleDAO,
    [s_ruleDAO]: RuleDAO,
    [s_authDAO]: AuthDAO,
    [s_apiKeyDAO]: ApiKeyDAO,
    [s_userDAO]: UserDAO,
    [s_preferenceDAO]: PreferenceDAO,
    [s_userSerializer]: createUserSerializerInstance,
    [s_mailer]: createMailerInstance,
    [s_mailerTransport]: createMailerTransportInstance,
    [s_clientProvider]: ClientProviderPubSub,
    [s_wsConnectionManager]: createWsUserConnectionManagerInstance,
    [s_wsManagerProvider]: WsManagerProvider,
    [s_rateLimiter]: {
        scope: SCOPE_PROTOTYPE,
        factory: (_, configs) => new RateLimiterMemory(configs),
    }
}