import {getExpressApp} from "../../application/services/serverServices.mjs";
import {getFullHostUrls} from "../../application/services/requestServices.mjs";
import {getTokenLoginUrl} from "velor-contrib/contrib/getUrl.mjs";
import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {AUTH_TOKEN_SECRET} from "../../application/services/serverEnvKeys.mjs";
import supertest from "supertest";


export const request =
    async ({services}, use) => {

        function parseCookies(response) {
            const rawCookies = response.header['set-cookie'];
            let parsedCookies = {};
            rawCookies?.forEach((rawCookie) => {
                const cookiePart = rawCookie.split(';')[0];

                // split only to the first = because value may be a base 64 terminated with a =
                const eqIndex = cookiePart.indexOf('=');
                const key = cookiePart.substring(0, eqIndex);
                const value = cookiePart.substring(eqIndex + 1);
                parsedCookies[key] = value;
            });
            return parsedCookies;
        }

        function parseCsrf(response) {
            let csrf;
            if (response.body?.csrfToken) {
                csrf = response.body.csrfToken
            }
            return csrf;
        }

        function setCookies(req, cookies) {
            if (cookies) {
                let header = Object.keys(cookies)
                    .map(key => `${key}=${cookies[key]}`)
                    .join(';');
                req = req.set('cookie', header);
            }
            return req;
        }

        function setCsrfToken(req, csrf) {
            if (csrf) {
                return req.set('x-csrf-token', csrf);
            }
            return req;
        }

        function parseResponse(response) {
            let cookies, csrf;
            if (response) {
                cookies = parseCookies(response);
                csrf = parseCsrf(response);
            }
            response.context = {
                cookies,
                csrf
            };
            return response;
        }

        function applyContext(req, context = {}) {
            let {
                cookies,
                csrf
            } = context;

            req = setCookies(req, cookies);
            req = setCsrfToken(req, csrf);

            // capture the request response
            const originalEnd = req.end.bind(req);

            req.end = callback =>
                originalEnd((err, response) => {
                    response = parseResponse(response);
                    callback(err, response);
                });

            return req;
        }

        function request(context) {
            let application = getExpressApp(services);
            return new Proxy({}, {
                get: (target, prop, receiver) => {
                    return (...args) => {
                        const req = supertest(application)[prop](...args);
                        req.setCookies = cookies => setCookies(req, cookies);
                        req.setCsrfToken = csrf => setCsrfToken(req, csrf);
                        return applyContext(req, context);
                    }
                }
            });
        }


        function loginWithToken(token) {
            let urls = getFullHostUrls(services);
            token = token ?? getEnvValue(services, AUTH_TOKEN_SECRET)
            return request()
                .get(getTokenLoginUrl(urls))
                .set('Authorization', token);
        }

        request.loginWithToken = loginWithToken;
        request.clearCookies = (context) => delete context.cookies;

        await use(request);
    }
;