import {URL_LOGIN} from "velor-contrib/contrib/urls.mjs";
import {getFullHostUrls} from "../../../application/services/constants.js";

export function composeLogout(services, request) {
    return async (context) => {
        const urls = getFullHostUrls(services);
        return request(context).delete(urls[URL_LOGIN]);
    }
}