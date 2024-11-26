import {AUTH_TOKEN} from "velor-contrib/contrib/authProviders.mjs";
import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {AUTH_TOKEN_SECRET} from "../../application/services/serverEnvKeys.mjs";
import {
    getEventQueue,
    getExpressApp,
    getRoleDAO
} from "../../application/services/serverServices.mjs";
import {createAuthConfiguration} from "../../routes/auth.mjs";
import {createRouterBuilder} from "../../core/createRouterBuilder.mjs";
import {composeSessionParser} from "../../auth/composeSessionParser.mjs";
import {patchPassport} from "../../auth/patchPassport.mjs";
import passport from "passport";
import {setupExpressApp} from "../../initialization/setupExpressApp.mjs";

import {composeCookieParser} from "../../auth/composeCookieParser.mjs";
import {composeCsrfProtection} from "../../auth/composeCsrfProtection.mjs";
import {composeAuth} from "../../auth/composeAuth.mjs";

export const rest =
    async ({services, request}, use, testInfo) => {
        let providers = {
            [AUTH_TOKEN]: {
                token: getEnvValue(services, AUTH_TOKEN_SECRET),
            }
        };

        let application = getExpressApp(services);
        let auth = composeAuth(services, providers);

        let session = composeSessionParser(services);
        let cookies = composeCookieParser(services);
        let {csrfProtection, csrf} = composeCsrfProtection(services);


        application
            // .use(cors({credentials: true, origin: true}))
            .use(session)
            .use(patchPassport)
            .use(passport.initialize())
            .use(passport.session())
            .use(cookies)
            .use(csrfProtection)

            .use('/csrf', csrf)
            .use('/auth', auth)

            .post('/validate-csrf', (req, res) => {
                res.sendStatus(200);
            });

        // setup must be called after routes have been mounted
        await setupExpressApp(services);

        // create normal role
        await getRoleDAO(services).saveOne({name: 'normal'});

        // initialize event queue
        getEventQueue(services);

        use({
            services,
            request,
            loginWithToken: request.loginWithToken,
        })
    }
