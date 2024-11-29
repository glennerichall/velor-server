import {decryptUserSession} from "../../../session/decryptUserSession.mjs";
import {getFullHostUrls} from "../../../application/services/requestServices.mjs";
import {
    URL_LOGIN_FAILURE,
    URL_LOGIN_SUCCESS
} from "velor-contrib/contrib/urls.mjs";
import {composeLoginFromXHR} from "./composeLoginFromXHR.mjs";

async function requestLogin(req, res, next) {
    const targetUserSession = req.targetUserSession;
    const urls = getFullHostUrls(req);
    const loginSuccessUrl = urls[URL_LOGIN_SUCCESS];
    const loginFailureUrl = urls[URL_LOGIN_FAILURE];
    const loginFromXHR = composeLoginFromXHR(req);

    try {
        // ask the browser to make a call using fetch. logInFromFetch should return the response the browser
        // has received.
        const response = await loginFromXHR(targetUserSession.ws);

        if (response.status === 200) {
            res.redirect(loginSuccessUrl);

        } else {
            req.flash('error', response.info);
            res.redirect(loginFailureUrl);
        }

    } catch (e) {
        req.flash('error', e.message);
        res.redirect(loginFailureUrl);
    }

}

export async function requestLoginFromXhrIfNeeded(req, res, next) {
    const targetUserSession = req.targetUserSession;

    if (decryptUserSession(req) && req.userSession?.ws === targetUserSession.ws) {
        // the url was called back with the same browser as the login email request was made
        // so reply immediately and the session cookie will be set to the correct browser context
        next();

    } else {
        // the url was called from another browser context. Ask the original browser context
        // to make the call to the callback url. The previous branch will be hit and the correct browser context will
        // receive the session cookie.
        await requestLogin(req, res, next);
    }
}