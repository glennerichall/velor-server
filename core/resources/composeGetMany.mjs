export const composeGetMany = (getDao, getQuery, mapper) => async (req, res) => {
    let query = getQuery(req);
    let items = await getDao(req).loadMany(query);
    items = items.map(item => mapper(item, query, req));
    res.send(items);
};