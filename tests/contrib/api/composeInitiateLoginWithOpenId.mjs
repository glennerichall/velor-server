import {getFullHostUrls} from "../../../application/services/requestServices.mjs";
import {getOpenIdLoginUrl} from "velor-contrib/contrib/getUrl.mjs";
import {composeGetCsrfToken} from "./composeGetCsrfToken.mjs";
import {getServiceBuilder} from "velor-services/injection/ServicesContext.mjs";
import {
    BACKEND_URL,
    FULL_HOST_URLS
} from "../../../application/services/serverEnvKeys.mjs";

export function composeInitiateLoginWithOpenId(services, request, rest) {
    const getCsrfToken = composeGetCsrfToken(services, request);

    return (context) => {
        let urls = getFullHostUrls(services);

        if (!context) {
            context = getCsrfToken().then(response => response.context);
        }

        getServiceBuilder(services)
            .addEnv(BACKEND_URL, 'https://localhost:3000')
            .addEnv(FULL_HOST_URLS, true)
            .done();

        // this is mandatory to mock up the supertest request.
        rest.beforeAll(
            (req, res, next) => {
                Object.defineProperty(req, 'headers', {
                    value: {...req.headers, host: 'localhost'},
                });
                Object.defineProperty(req, 'socket', {
                    value: {...req.socket, localPort: 3000},
                });
                Object.defineProperty(req, 'protocol', {
                    value: 'https',
                });
                next();
            }
        )

        return request(context)
            .get(getOpenIdLoginUrl(urls));
    }
}