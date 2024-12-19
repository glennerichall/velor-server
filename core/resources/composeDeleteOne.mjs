import {getItemId} from "./getItemId.mjs";

export const composeDeleteOne = (getDao, getQuery, mapper) => async (req, res) => {
    let query = getQuery(req, getItemId(req));
    let item = await getDao(req).delete(query);
    if (!item) {
        return res.sendStatus(404);
    }
    res.send(mapper(item, query, req));
};