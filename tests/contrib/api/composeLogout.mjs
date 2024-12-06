import {getFullHostUrls} from "../../../application/services/requestServices.mjs";
import {URL_LOGIN} from "velor-contrib/contrib/urls.mjs";

export function composeLogout(services, request) {
    return async (context) => {
        const urls = getFullHostUrls(services);
        return request(context).delete(urls[URL_LOGIN]);
    }
}