import {
    getFullHostUrls,
    getUrls
} from "../application/services/requestServices.mjs";
import {getEnvValue} from "velor-services/application/services/baseServices.mjs";
import {stripUrls} from "../contrib/stripUrls.mjs";
import {
    DEPLOY_DATE,
    VERSION
} from "../application/services/envKeys.mjs";

export const getApiUrls = version => async (req, res) => {
    let hostOff = req.query.host === 'off';

    let urls = getUrls(req);

    if (!hostOff) {
        urls = getFullHostUrls(req);
    }

    urls = await stripUrls(req, urls);

    res.json({
        version: getEnvValue(req, VERSION),
        date: getEnvValue(req, DEPLOY_DATE),
        api: {
            version,
            urls,
        }
    });
};