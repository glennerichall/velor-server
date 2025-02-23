import {composeGetWsId} from "../../sockets/upgrade/composeGetWsId.mjs";

export function createWsIdDirect(services, req) {
    let res = {
        _cookies: {},
        cookie(name, content, options) {
            this._cookies[name] = content;
        },
        send() {
        }
    }

    composeGetWsId(services).setWsIdCookie(res);
    req.cookies = {
        ...req.cookies,
        ...res._cookies
    };

    req.signedCookies = {
        ...req.cookies,
    };
}