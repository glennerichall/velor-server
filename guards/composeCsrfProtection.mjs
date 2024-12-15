import {doubleCsrf} from "csrf-csrf";
import {
    getEnvValueArray,
    isProduction,
    isStaging
} from "velor-services/application/services/baseServices.mjs";
import {CSRF_SECRETS} from "../application/services/envKeys.mjs";
import {getSessionId} from "../application/services/requestServices.mjs";
import {URL_CSRF} from "velor-contrib/contrib/urls.mjs";
import {chainHandlers} from "../core/chainHandlers.mjs";
import {E_BAD_CSRF_TOKEN} from "velor-contrib/contrib/errors.mjs";
import {getRouterBuilder} from "../application/services/services.mjs";

export function composeCsrfProtection(services, options = {}) {
    const {
        doubleCsrfProtection,
        generateToken
    } = doubleCsrf({
        getSecret: () => getEnvValueArray(services, CSRF_SECRETS),
        getSessionIdentifier: (req) => getSessionId(req),
        cookieOptions: {
            secure: isProduction(services) || isStaging(services),
        },
        errorConfig: {
            code: E_BAD_CSRF_TOKEN
        },
        ...options
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

    let csrf = getRouterBuilder(services).configure(csrfConfigs).done();
    let csrfProtection = chainHandlers(
        (req, res, next) => {
            try {
                doubleCsrfProtection(req, res, next)
            } catch (err) {
                let sdfd = 'sdt'
            }
        },
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
        csrf,
        generateToken
    };
}