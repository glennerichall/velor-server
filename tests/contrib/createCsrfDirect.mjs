import {composeCsrfProtection} from "../../guards/composeCsrfProtection.mjs";
import {getInstanceBinder} from "velor-services/injection/ServicesContext.mjs";

export function createCsrfDirect(services, req) {
    let {generateToken} = composeCsrfProtection(services);

    let res = {
        _cookies: {},
        cookie(name, content) {
            this._cookies[name] = content;
        }
    }

    // clone to not set any services reference to original req
    // because it must be done in the upgrade handling
    let _req = {
        ...req
    };

    getInstanceBinder(_req).setInstance("request", _req);
    let csrf = generateToken(_req, res, true);
    req.headers['x-csrf-token'] = csrf;
    req.cookies = {
        ...req.cookies,
        ...res._cookies
    };
}