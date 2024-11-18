import {URL_PASSPORT_CALLBACK} from "velor-contrib/contrib/urls.mjs";
import {getFullHostUrls} from "../../application/services/requestServices.mjs";

export function initiateAuth(req, res, next) {
    let strategy = req.authStrategy;
    let urls = getFullHostUrls(req);
    if (!strategy.initialized) {
        strategy.initialize(urls[URL_PASSPORT_CALLBACK]);
    }
    return strategy.initiate(req, res, next);
}