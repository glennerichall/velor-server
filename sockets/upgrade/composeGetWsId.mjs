import {
    isProduction,
    isStaging
} from "velor-services/injection/baseServices.mjs";

export function composeGetWsId(services, options = {}) {
    const {
        cookieName = '__Host-psifi.ws-id'
    } = options;

    const getWsId = (req, res, next) => {
        req.wsId = req.signedCookies[cookieName];
        next();
    }

    const createWsIdCookie = (req, res) => {
        const wsId = crypto.randomUUID();
        res.cookie(cookieName, wsId, {
                signed: true,
                httpOnly: true,
                secure: isProduction(services) || isStaging(services),
            }
        );
        res.send();
    }

    return {
        getWsId,
        createWsIdCookie
    }
}