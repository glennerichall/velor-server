// export const resourceBuilderPolicy = policy => {
//
//     return class {
//         constructor() {
//         }
//
//         addResource(dao, mapper) {
//
//         }
//     };
// }
//
// export function createResourceBuilder() {
//     const ResourceBuilder = resourceBuilderPolicy();
//     return new ResourceBuilder();
// }

import {getRouterBuilder} from "../application/services/serverServices.mjs";
import {identOp} from "velor-utils/utils/functional.mjs";

export const composeGetOne = (getDao, getQuery, mapper) => async (req, res) => {
    let query = getQuery(req, req.params.item);
    let item = await getDao(req).loadOne(query);
    res.send(mapper(item));
};

export const composeGetMany = (getDao, getQuery, mapper) => async (req, res) => {
    let query = getQuery(req);
    let items = await getDao(req).loadMany(query);
    res.send(items.map(mapper));
};

export const composeDeleteOne = (getDao, getQuery, mapper) => async (req, res) => {
    let query = getQuery(req, req.params.item);
    let result = await getDao(req).deleteOne(query);
    res.send(mapper(result));
};


export const composeCreate = (getDao, getData, mapper) => async (req, res) => {
    const data = getData(req.body);
    let item = await getDao(req).create(data);
    res.status(201).send(mapper(item));
};

export class ResourceBuilder {

    #routerBuilder;
    #name;
    #getDao;

    constructor(getDao) {
        this.#getDao = getDao;
    }

    initialize() {
        this.#routerBuilder = getRouterBuilder(this);
    }

    guard(guard) {
        return this;
    }

    getOne(guard) {
        let getOne = composeGetOne(this.#getDao, getQuery, mapper);
        this.#routerBuilder
            .name(this.#name)
            .get('/:item', getOne);

        return this;
    }

    getMany(guard) {
        let getMany = composeGetMany(this.#getDao, getQuery, mapper);
        this.#routerBuilder
            .name(this.#name)
            .get('/', getMany);

        return this;
    }

    delete(guard) {
        let deleteOne = composeDeleteOne(this.#getDao, getQuery, mapper);
        this.#routerBuilder
            .name(this.#name)
            .delete('/:item', deleteOne);

        return this;
    }

    create(options = {}) {
        const {
            mapper = identOp,
            getData = identOp
        } = options;

        let create = composeCreate(this.#getDao, getData, mapper);

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