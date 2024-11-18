import {getEmitter} from "../../application/services/serverServices.mjs";
import {EVENT_USER_LOGIN} from "../../application/services/serverEventKeys.mjs";
import {getFullHostUrls} from "../../application/services/requestServices.mjs";
import {URL_LOGIN_SUCCESS} from "velor-contrib/contrib/urls.mjs";


export async function login(req, res) {
    getEmitter(req).emit(EVENT_USER_LOGIN, req);
    const url = getFullHostUrls(req)[URL_LOGIN_SUCCESS];
    res.redirect(url);
}