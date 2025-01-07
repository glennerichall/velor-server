import {EVENT_USER_LOGIN} from "../../application/services/eventKeys.mjs";
import {URL_LOGIN_SUCCESS} from "velor-contrib/contrib/urls.mjs";
import {getEmitter} from "velor-services/application/services/services.mjs";
import {getFullHostUrls} from "../../application/services/constants.mjs";
import {getUser} from "../../application/services/requestServices.mjs";


export async function login(req, res) {
    let user = getUser(req);
    getEmitter(req).emit(EVENT_USER_LOGIN, user, req);
    const url = getFullHostUrls(req)[URL_LOGIN_SUCCESS];
    res.redirect(url);
}