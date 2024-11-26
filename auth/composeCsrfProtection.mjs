import {doubleCsrf} from "csrf-csrf";
import {
    getEnvValue,
    isProduction,
    isStaging
} from "velor-services/injection/baseServices.mjs";
import {AUTH_TOKEN_SECRET} from "../application/services/serverEnvKeys.mjs";
import {getSessionId} from "../application/services/requestServices.mjs";
import {createRouterBuilder} from "../core/createRouterBuilder.mjs";
import {URL_CSRF} from "velor-contrib/contrib/urls.mjs";
import {chainHandlers} from "../core/chainHandlers.mjs";
import {E_BAD_CSRF_TOKEN} from "velor-contrib/contrib/errors.mjs";

export function composeCsrfProtection(services) {
    const {
        doubleCsrfProtection,
        generateToken
    } = doubleCsrf({
        getSecret: () => getEnvValue(services, AUTH_TOKEN_SECRET),
        getSessionIdentifier: (req) => getSessionId(req),
        cookieOptions: {
            secure: isProduction(services) || isStaging(services),
        },
        errorConfig: {
            code: E_BAD_CSRF_TOKEN
        }
    });

    let csrfConfigs = [
        {
            path: '/csrf-token',
            name: URL_CSRF,
            get: (req, res) => {
                const csrfToken = generateToken(req, res, true);
                res.json({csrfToken});
            },
        }
    ];

    let csrf = createRouterBuilder().configure(csrfConfigs).done();
    let csrfProtection = chainHandlers(
        doubleCsrfProtection,
        (err, req, res, next) => {
            res.status(err.statusCode).send(
                {
                    message: err.message,
                    code: err.code
                }
            );
        })

    return {
        csrfProtection,
        csrf
    };
}