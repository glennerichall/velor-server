import {getFullHostUrls} from "../../../application/services/requestServices.mjs";
import {URL_LOGIN_FAILURE} from "velor-contrib/contrib/urls.mjs";
import {E_BAD_LOGIN_TOKEN} from "velor-contrib/contrib/errors.mjs";
import {getMagicLinkEncryption} from "../../../application/services/serverServices.mjs";

export function validateMagicLink(req, res, next) {
    const loginFailureUrl = getFullHostUrls(req)[URL_LOGIN_FAILURE];
    const encryption = getMagicLinkEncryption(req);

    if (!req.query.token) {
        req.flash('error', E_BAD_LOGIN_TOKEN);
        res.redirect(loginFailureUrl);

    } else {
        try {
            req.targetUserSession = encryption.decryptObject(req.query.token);
            if (!req.targetUserSession.ws) {
                req.flash('error', E_BAD_LOGIN_TOKEN);
                res.redirect(loginFailureUrl);
            } else {
                next();
            }

        } catch (e) {
            req.flash('error', E_BAD_LOGIN_TOKEN);
            res.redirect(loginFailureUrl);
        }
    }
}