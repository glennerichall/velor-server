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
                parsedCookies[key.toLowerCase()] = value;
            });
            return parsedCookies;
        }

        function readCsrfToken(response) {
            return response.header['x-csrf-token'];
        }

        function applyContext(req, context = {}) {
            let {
                cookies,
                csrf
            } = context;

            if (cookies) {
                let header = Object.keys(cookies)
                    .map(key => `${key}=${cookies[key]}`)
                    .join(';');
                req = req.set('cookie', header);
                req = req.set('x-csrf-token', csrf);
            }

            // capture the request response
            const originalEnd = req.end.bind(req);

            req.end = callback =>
                originalEnd((err, response) => {
                    if (response) {
                        // mutate the current context with request response

                        // save the cookies
                        context.cookies = parseCookies(response);

                        // save the current csrf token
                        context.csrf = readCsrfToken(response);
                    }
                    response.context = context;
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
        request.clearCookies = () => delete context.cookies;

        await use(request);
    }
;