import {
    getApiKeyDAO,
    getUserDAO
} from "velor-dbuser/application/services/services.mjs";
import {getResourceBuilder} from "../application/services/services.mjs";
import {URL_API_KEYS} from "velor-contrib/contrib/urls.mjs";
import {
    guard,
    isLoggedIn
} from "../guards/guardMiddleware.mjs";
import {getUser} from "../application/services/requestServices.mjs";
import {ITEM_PARAM} from "velor-api/api/api/ResourceApi.mjs";

async function isApiKeyOwner(req) {
    if (req.method === "POST") {
        // we can create a new api key
        return true;
    }

    let user = getUser(req);
    let apiKey = await getUserDAO(req).getApiKey(user, req.param[ITEM_PARAM]);
    return !!apiKey;
}

export function composeApiKeys(services) {
    const configuration = {
        name: URL_API_KEYS,
        daoProvider: getApiKeyDAO,
        itemResponseMapper: (apiKey) => {

        },
        guard: [
            isLoggedIn,
            guard(isApiKeyOwner)
        ]
    };

    return getResourceBuilder(services, configuration)
        .all().done();

}

