import {EVENT_USER_LOGIN} from "../../application/services/eventKeys.mjs";
import {URL_LOGIN_SUCCESS} from "velor-contrib/contrib/urls.mjs";
import {getEmitter} from "velor-services/application/services/services.mjs";
import {getFullHostUrls} from "../../application/services/constants.js";


export async function login(req, res) {
    getEmitter(req).emit(EVENT_USER_LOGIN, req);
    const url = getFullHostUrls(req)[URL_LOGIN_SUCCESS];
    res.redirect(url);
}