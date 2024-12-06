import passport from "passport";
import {
    NOT_FOUND,
    NOT_IMPLEMENTED,
    UNAUTHORIZED
} from "./wsErrors.mjs";
import {decryptText} from "velor/utils/encryption.mjs";


export async function verifyWsConnectionOnSession(req, options = {}) {
    let {
        origins = ['*'],
        sessionParser
    } = options;

    const {url} = req;

    if (url !== '/api') {
        return NOT_FOUND;
    }

    if (origins === true) {
        origins = [req.fullHostUrl];
        // the previous instruction does not work
        return NOT_IMPLEMENTED;
    }

    return new Promise((resolve, reject) => {
        sessionParser(req, {}, () => {
                let hasSession;
                try {
                    hasSession = !!req.session;
                } catch (err) {
                    hasSession = false;
                }
                if (!hasSession) {
                    resolve(UNAUTHORIZED);
                } else {
                    const dx = req.session.dx;
                    req.requestDetails = dx && JSON.parse(decryptText(req.session.dx));
                    if (!req.requestDetails) {
                        resolve(UNAUTHORIZED);
                    } else {
                        const initialize = passport.initialize();
                        const session = passport.session();
                        initialize(req, {}, () => {
                            session(req, {}, () => {
                                // https://christian-schneider.net/CrossSiteWebSocketHijacking.html
                                if (origins.includes(req.headers.origin) || origins.includes('*')) {
                                    resolve(true);
                                } else {
                                    resolve(UNAUTHORIZED);
                                }
                            })
                        });
                    }
                }
            }
        )
    });


}