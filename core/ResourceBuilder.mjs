import {getRouterBuilder} from "../application/services/services.mjs";
import {identOp} from "velor-utils/utils/functional.mjs";
import {
    getItemUrlName,
    ITEM_PARAM
} from "velor-api/api/api/ResourceApi.mjs";
import {proceed} from "../guards/guardMiddleware.mjs";

export const composeGetOne = (getDao, getQuery, mapper) => async (req, res) => {
    let query = getQuery(req, getItemId(req));
    let item = await getDao(req).loadOne(query);
    if (!item) {
        return res.sendStatus(404);
    }
    res.send(mapper(item, query, req));
};

export const composeGetMany = (getDao, getQuery, mapper) => async (req, res) => {
    let query = getQuery(req);
    let items = await getDao(req).loadMany(query);
    items = items.map(item => mapper(item, query, req));
    res.send(items);
};

export const composeDeleteOne = (getDao, getQuery, mapper) => async (req, res) => {
    let query = getQuery(req, getItemId(req));
    let item = await getDao(req).delete(query);
    if (!item) {
        return res.sendStatus(404);
    }
    res.send(mapper(item, query, req));
};


export const composeCreate = (getDao, getData, mapper) => async (req, res) => {
    const data = getData(req.body, req);
    let item = await getDao(req).saveOne(data);
    res.status(201).send(mapper(item, data, req));
};

export function getItemId(req) {
    return req.params[ITEM_PARAM];
}

export class ResourceBuilder {

    #routerBuilder;
    #name;
    #getDao;
    #getItemData;
    #itemQueryMapper;
    #itemResponseMapper;
    #guard;

    constructor(configuration) {

        const {
            daoProvider,
            name,
            getItemData = identOp,
            itemQueryMapper = identOp,
            itemResponseMapper = identOp,
            guard = proceed
        } = configuration;

        this.#getDao = daoProvider;
        this.#name = name;
        this.#itemQueryMapper = itemQueryMapper;
        this.#itemResponseMapper = itemResponseMapper;
        this.#getItemData = getItemData;
        this.#guard = guard;
    }

    initialize() {
        this.#routerBuilder = getRouterBuilder(this);
    }

    use(middleware) {
        this.#routerBuilder.use(middleware);
        return this;
    }

    getOne(options = {}) {
        let getOne = composeGetOne(this.#getDao,
            this.#itemQueryMapper, this.#itemResponseMapper);

        this.#routerBuilder
            .name(getItemUrlName(this.#name))
            .get(`/:${ITEM_PARAM}`, this.#guard, getOne);

        return this;
    }

    getMany(options = {}) {
        let getMany = composeGetMany(this.#getDao,
            this.#itemQueryMapper, this.#itemResponseMapper);

        this.#routerBuilder
            .name(this.#name)
            .get('/', this.#guard, getMany);

        return this;
    }

    delete(options = {}) {
        let deleteOne = composeDeleteOne(this.#getDao,
            this.#itemQueryMapper, this.#itemResponseMapper);

        this.#routerBuilder
            .name(getItemUrlName(this.#name))
            .delete(`/:${ITEM_PARAM}`, this.#guard, deleteOne);

        return this;
    }

    create(options = {}) {
        let create = composeCreate(this.#getDao,
            this.#getItemData, this.#itemResponseMapper);

        this.#routerBuilder
            .name(this.#name)
            .post('/', this.#guard, create);

        return this;
    }

    all() {
        return this.create()
            .delete()
            .getMany()
            .getOne();
    }

    done() {
        return this.#routerBuilder.done();
    }

}