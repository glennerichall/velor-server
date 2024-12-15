import {
    isProduction,
    isStaging
} from "velor-services/application/services/baseServices.mjs";
import {getRouterBuilder} from "../../application/services/services.mjs";
import {URL_WS_ID} from "velor-contrib/contrib/urls.mjs";

export function composeGetWsId(services, options = {}) {
    const {
        cookieName = '__Host-psifi.x-ws-id'
    } = options;

    const getWsId = (req, res, next) => {
        req.wsId = req.signedCookies[cookieName];
        next();
    }

    const setWsIdCookie = res => {
        const wsId = crypto.randomUUID();
        res.cookie(cookieName, wsId, {
                signed: true,
                httpOnly: true,
                secure: isProduction(services) || isStaging(services),
            }
        );
    }

    const getWsIdCookie = (req, res) => {
        setWsIdCookie(res);
        res.send();
    }

    const wsConfigs = [
        {
            name: URL_WS_ID,
            path: '/ws-id',
            get: getWsIdCookie,
        }
    ]

    let createWsIdCookie = getRouterBuilder(services).configure(wsConfigs).done();

    return {
        setWsIdCookie,
        getWsId,
        createWsIdCookie
    }
}