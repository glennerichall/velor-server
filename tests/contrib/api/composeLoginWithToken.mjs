import {getEnvValue} from "velor-services/application/services/baseServices.mjs";
import {AUTH_TOKEN_SECRET} from "../../../application/services/envKeys.mjs";
import {getTokenLoginUrl} from "velor-contrib/contrib/getUrl.mjs";
import {composeGetCsrfToken} from "./composeGetCsrfToken.mjs";
import {getFullHostUrls} from "../../../application/services/constants.js";

export function composeLoginWithToken(services, request) {
    const getCsrfToken = composeGetCsrfToken(services, request);

    return ({token, context} = {}) => {
        let urls = getFullHostUrls(services);
        token = token ?? getEnvValue(services, AUTH_TOKEN_SECRET);

        if (!context) {
            context = getCsrfToken().then(response => response.context);
        }

        return request(context)
            .get(getTokenLoginUrl(urls))
            .set('Authorization', token);
    }
}