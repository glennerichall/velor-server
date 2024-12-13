import sanitizeHtml from "sanitize-html";
import {getApiKeyDAO} from "../application/services/serverServices.mjs";
import {getUser} from "../application/services/requestServices.mjs";
import {ResourceBuilder} from "../core/ResourceBuilder.mjs";


export const getApiKeys = async (req, res) => {
    let query = {
        user: getUser(req).id
    };
    let apiKeys = await getApiKeyDAO(req).loadMany(query);

    res.send(
        apiKeys.map(apiKey => {
            return {
                name: apiKey.name,
                creation: apiKey.creation,
                id: apiKey.public_id
            }
        })
    );
};

export const getApiKey = async (req, res) => {
    const publicId = req.params.key;
    const apiKey = await getApiKeyDAO(req).loadOne({publicId});
    if (apiKey) {
        res.send(
            {
                name: apiKey.name,
                creation: apiKey.creation,
                id: apiKey.public_id
            });
    } else {
        res.sendStatus(404);
    }
};

export const createApiKey = async (req, res) => {
    let name = req.body.name ?? null;
    if (name !== null) {
        name = sanitizeHtml(name);
    }

    const apiKey = await getApiKeyDAO(req).insertOne({name});

    res.status(201).send({
        name: apiKey.name,
        value: apiKey.api_key,
        creation: apiKey.creation,
        id: apiKey.public_id
    });
};

export const deleteApiKey = async (req, res) => {
    const publicId = req.params.key;
    const apiKey = await getApiKeyDAO(req).deleteOne({publicId});
    if (apiKey) {
        res.send({
            creation: apiKey.creation,
            name: apiKey.name,
            id: apiKey.public_id
        });
    } else {
        res.sendStatus(404);
    }
};

export function composeApiKeys(services) {
    // const configs = [
    //     {
    //         path: '/',
    //         name: URL_API_KEYS,
    //         get: getApiKeys,
    //         post: createApiKey,
    //         delete: deleteApiKey,
    //
    //         router: {
    //             path: '/:key',
    //             get: getApiKey
    //         }
    //     }
    // ];
    //
    // return getRouterBuilder(services).configure(configs).done();

    const getDao = req => getApiKeyDAO(req);

    const createGetData = req => {
        let name = req.body.name ?? null;
        if (name !== null) {
            name = sanitizeHtml(name);
        }
        return {name};
    };

    const createMapResponse = apiKey => {
        return {
            name: apiKey.name,
            value: apiKey.api_key,
            creation: apiKey.creation,
            id: apiKey.public_id
        };
    }

    return new ResourceBuilder(getApiKeyDAO)
        .create(createGetData, {mapper: createMapResponse})
        .delete()
        .getMany()
        .getOne()
        .done()

}

// export const verifyApiKeyOwner = verify(isApiKeyOwner, 403);