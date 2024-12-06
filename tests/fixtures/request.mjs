import {getExpressApp} from "../../application/services/serverServices.mjs";
import supertest from "supertest";
import {setCookies} from "../contrib/request/setCookies.mjs";
import {setCsrfToken} from "../contrib/request/setCsrf.mjs";
import {applyContext} from "../contrib/request/applyContext.mjs";


export const request =
    async ({services, rest}, use) => {

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