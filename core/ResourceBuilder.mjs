import {getRouterBuilder} from "../application/services/serverServices.mjs";
import {identOp} from "velor-utils/utils/functional.mjs";
import {
    getItemUrlName,
    ITEM_PARAM
} from "velor-api/api/api/ResourceApi.mjs";
import {proceed} from "../guards/guardMiddleware.mjs";

export const composeGetOne = (getDao, getQuery, mapper) => async (req, res) => {
    let query = getQuery(req, req.params.item);
    let item = await getDao(req).loadOne(query);
    res.send(mapper(item, query, req));
};

export const composeGetMany = (getDao, getQuery, mapper) => async (req, res) => {
    let query = getQuery(req);
    let items = await getDao(req).loadMany(query);
    items = items.map(item => mapper(item, query, req));
    res.send(items);
};

export const composeDeleteOne = (getDao, getQuery, mapper) => async (req, res) => {
    let query = getQuery(req, req.params.item);
    let item = await getDao(req).deleteOne(query);
    res.send(mapper(item, query, req));
};


export const composeCreate = (getDao, getData, mapper) => async (req, res) => {
    const data = getData(req.body, req);
    let item = await getDao(req).saveOne(data);
    res.status(201).send(mapper(item, data, req));
};


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
        this.use(this.#guard);
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
            .get(`/:${ITEM_PARAM}`, getOne);

        return this;
    }

    getMany(options = {}) {
        let getMany = composeGetMany(this.#getDao,
            this.#itemQueryMapper, this.#itemResponseMapper);

        this.#routerBuilder
            .name(this.#name)
            .get('/', getMany);

        return this;
    }

    delete(options = {}) {
        let deleteOne = composeDeleteOne(this.#getDao,
            this.#itemQueryMapper, this.#itemResponseMapper);

        this.#routerBuilder
            .name(getItemUrlName(this.#name))
            .delete('/:item', deleteOne);

        return this;
    }

    create(options = {}) {
        let create = composeCreate(this.#getDao,
            this.#getItemData, this.#itemResponseMapper);

        this.#routerBuilder
            .name(this.#name)
            .post('/', create);

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