import {getFullHostUrls} from "../../../application/services/requestServices.mjs";
import {URL_CSRF} from "velor-contrib/contrib/urls.mjs";

export function composeGetCsrfToken(services, request) {

    return (context) => {
        let urls = getFullHostUrls(services);
        return request(context).get(urls[URL_CSRF]);
    }

}