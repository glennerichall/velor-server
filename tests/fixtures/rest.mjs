import {
    AUTH_MAGIC_LINK,
    AUTH_TOKEN
} from "velor-contrib/contrib/authProviders.mjs";
import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {AUTH_TOKEN_SECRET} from "../../application/services/serverEnvKeys.mjs";
import {
    getEventQueue,
    getExpressApp,
    getRoleDAO
} from "../../application/services/serverServices.mjs";
import {composeSessionParser} from "../../auth/composeSessionParser.mjs";
import {patchPassport} from "../../auth/patchPassport.mjs";
import passport from "passport";
import {setupExpressApp} from "../../initialization/setupExpressApp.mjs";

import {composeCookieParser} from "../../auth/composeCookieParser.mjs";
import {composeCsrfProtection} from "../../auth/composeCsrfProtection.mjs";
import {composeAuth} from "../../auth/composeAuth.mjs";
import express from "express";
import {composeRequestScope} from "../../routes/composeRequestScope.mjs";
import flash from "connect-flash";
import {wsIdFromCookies} from "../../session/wsIdFromCookies.mjs";

export const rest =
    async ({services}, use, testInfo) => {
        let providers = {
            [AUTH_TOKEN]: {
                token: getEnvValue(services, AUTH_TOKEN_SECRET),
            },
            [AUTH_MAGIC_LINK]: {
                clientSecret: 'magic-link-client-secret'
            }
        };

        let application = getExpressApp(services);
        let auth = composeAuth(services, providers);

        let session = composeSessionParser(services);
        let cookies = composeCookieParser(services);
        let {csrfProtection, csrf} = composeCsrfProtection(services);
        let requestScope = composeRequestScope(services);

        application
            .use(requestScope)
            // .use(cors({credentials: true, origin: true}))
            .use(express.json())
            .use(express.text())

            .use(session)
            .use(patchPassport)
            .use(passport.initialize())
            .use(passport.session())

            // cookies must be declared after session
            .use(cookies)
            // these must be declared after cookies
            .use(wsIdFromCookies)
            .use(flash())
            .use(csrfProtection)

            .use('/csrf', csrf)
            .use('/auth', auth)

            // this is only for tests
            .post('/validate-csrf', (req, res) => {
                res.sendStatus(200);
            });

        // setup must be called after routes have been mounted
        await setupExpressApp(services);

        // create normal role
        await getRoleDAO(services).saveOne({name: 'normal'});

        // initialize event queue
        getEventQueue(services);

        await use();
    }
