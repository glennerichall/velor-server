export const composeCreate = (getDao, getData, mapper) => async (req, res) => {
    const data = getData(req.body, req);
    let item = await getDao(req).saveOne(data);
    res.status(201).send(mapper(item, data, req));
};