import {composeAuth} from "../auth/composeAuth.mjs";
import {composeSessionParser} from "../auth/composeSessionParser.mjs";
import {composeCookieParser} from "../auth/composeCookieParser.mjs";
import {composeCsrfProtection} from "../guards/composeCsrfProtection.mjs";
import {composeRequestScope} from "../routes/composeRequestScope.mjs";
import {getAuthProvidersConfigs} from "./getAuthProvidersConfigs.mjs";
import express from "express";
import {patchPassport} from "../passport/middlewares/patchPassport.mjs";
import passport from "passport";
import flash from "connect-flash";
import {composeGetWsId} from "../sockets/upgrade/composeGetWsId.mjs";

export function setupRoutes(services) {
    let providers = getAuthProvidersConfigs(services);

    let auth = composeAuth(services, providers);

    let session = composeSessionParser(services);
    let cookies = composeCookieParser(services);
    let {csrfProtection, csrf} = composeCsrfProtection(services);
    let requestScope = composeRequestScope(services);
    let {getWsId, createWsIdCookie} = composeGetWsId(services);

    return new express.Router()
        // create a request scope in services
        .use(requestScope)

        .use(express.json())
        .use(express.text())

        // parse cookie session
        .use(session)

        // this is mandatory because of a bug in passport
        .use(patchPassport)

        // this is for authentication
        .use(passport.initialize())
        .use(passport.session())

        // cookies must be declared after session
        .use(cookies)

        // these must be declared after cookies
        .use(getWsId)
        .use(flash())
        .use(csrfProtection)

        // declare here all api routes
        .use('/api/v2/csrf', csrf)
        .use('/api/v2/ws-id', createWsIdCookie)
        .use('/api/v2/auth', auth)
}