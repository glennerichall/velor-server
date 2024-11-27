import {getExpressApp} from "../../application/services/serverServices.mjs";
import supertest from "supertest";


export const request =
    async ({services, rest}, use) => {

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

        function parseResponse(response, context) {
            let cookies, csrf;
            if (response) {
                cookies = {
                    ...context?.cookies,
                    ...parseCookies(response)
                };
                csrf = parseCsrf(response) ?? context?.csrf;
            }
            response.context = {
                cookies,
                csrf
            };
            return response;
        }

        function applyContext(req, context = {}) {

            const setContext = (req, ctx) => {
                let {
                    cookies,
                    csrf
                } = ctx;

                setCookies(req, cookies);
                setCsrfToken(req, csrf);
            };

            if (context instanceof Promise) {
                // the context is still not received from a previous request
                // just wait until it is received. When its received, since we
                // have hijacked the current request promise resolving, we set
                // the received context to the current request headers and then
                // we resolve the request promise using the original then method.
                let originalThen = req.then.bind(req);
                req.then = async (resolve, reject) => {
                    let ctx = await context;
                    setContext(req, ctx);
                    originalThen(response => {
                        parseResponse(response, ctx);
                        resolve(response);
                    }, reject);
                }
            } else {
                // If context is not a promise, directly set it into the req
                setContext(req, context);

                // capture the request response by hijacking the end
                // method of the stream
                const originalEnd = req.end.bind(req);
                req.end = callback =>
                    originalEnd((err, response) => {
                        response = parseResponse(response, context);
                        callback(err, response);
                    });
            }


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

        await use(request);
    }
;