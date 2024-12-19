import {getRouterBuilder} from "../application/services/services.mjs";
import {identOp} from "velor-utils/utils/functional.mjs";
import {
    getItemUrlName,
    ITEM_PARAM
} from "velor-api/api/api/ResourceApi.mjs";
import {proceed} from "../guards/guardMiddleware.mjs";
import {composeGetOne} from "./resources/composeGetOne.mjs";
import {composeGetMany} from "./resources/composeGetMany.mjs";
import {composeDeleteOne} from "./resources/composeDeleteOne.mjs";
import {composeCreate} from "./resources/composeCreate.mjs";

export class ResourceBuilder {

    #routerBuilder;
    #urlName;
    #getDao;
    #getItemData;
    #itemQueryMapper;
    #itemResponseMapper;
    #guard;

    constructor(configuration) {

        const {
            daoProvider,
            urlName,
            getItemData = identOp,
            itemQueryMapper = identOp,
            itemResponseMapper = identOp,
            guard = proceed,
        } = configuration;

        this.#getDao = daoProvider;
        this.#urlName = urlName;
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
            .name(getItemUrlName(this.#urlName))
            .get(`/:${ITEM_PARAM}`, this.#guard, getOne);

        return this;
    }

    getMany(options = {}) {
        let getMany = composeGetMany(this.#getDao,
            this.#itemQueryMapper, this.#itemResponseMapper);

        this.#routerBuilder
            .name(this.#urlName)
            .get('/', this.#guard, getMany);

        return this;
    }

    delete(options = {}) {
        let deleteOne = composeDeleteOne(this.#getDao,
            this.#itemQueryMapper, this.#itemResponseMapper);

        this.#routerBuilder
            .name(getItemUrlName(this.#urlName))
            .delete(`/:${ITEM_PARAM}`, this.#guard, deleteOne);

        return this;
    }

    create(options = {}) {
        let create = composeCreate(this.#getDao,
            this.#getItemData, this.#itemResponseMapper);

        this.#routerBuilder
            .name(this.#urlName)
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