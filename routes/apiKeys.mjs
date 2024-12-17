import {getUserDAO} from "velor-dbuser/application/services/services.mjs";
import {getResourceBuilder} from "../application/services/services.mjs";
import {URL_API_KEYS} from "velor-contrib/contrib/urls.mjs";
import {
    guard,
    isLoggedIn
} from "../guards/guardMiddleware.mjs";
import {getUser} from "../application/services/requestServices.mjs";
import {getItemId} from "../core/ResourceBuilder.mjs";

async function isApiKeyOwner(req) {
    if (req.method === "POST") {
        // we can create a new api key
        return true;
    }

    let user = getUser(req);
    let apiKey = await getUserDAO(req).getApiKey(user, getItemId(req));
    return !!apiKey;
}

function getUserApiKeyDao(req) {
    return {
        saveOne({name}) {
            let user = getUser(req);
            return getUserDAO(req).createApiKey(user, name);
        },
        loadOne(query) {
            let user = getUser(req);
            return getUserDAO(req).getApiKey(user, query);
        },
        loadMany() {
            let user = getUser(req);
            return getUserDAO(req).getApiKeys(user);
        },
        delete(query) {
            let user = getUser(req);
            return getUserDAO(req).loseApiKey(user, query);
        }
    };
}

export function composeApiKeys(services) {
    const configuration = {
        name: URL_API_KEYS,
        daoProvider: getUserApiKeyDao,
        itemResponseMapper: (apiKey) => {
            return {
                value: apiKey.value,
                creation: apiKey.creation,
                id: apiKey.publicId,
                lastUsed: apiKey.lastUsed,
                name: apiKey.name,
            };
        },
        itemQueryMapper: (req, apiKeyId) => {
            return {
                publicId: apiKeyId
            };
        },
        guard: [
            isLoggedIn,
            // guard(isApiKeyOwner, 404)
        ]
    };

    return getResourceBuilder(services, configuration)
        .all().done();

}

