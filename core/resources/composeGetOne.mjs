import {getItemId} from "./getItemId.mjs";

export const composeGetOne = (getDao, getQuery, mapper) => async (req, res) => {
    let query = getQuery(req, getItemId(req));
    let item = await getDao(req).loadOne(query);
    if (!item) {
        return res.sendStatus(404);
    }
    res.send(mapper(item, query, req));
};