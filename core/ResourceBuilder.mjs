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

const kp_routerBuilder = Symbol();
const kp_urlName = Symbol();
const kp_getDao = Symbol();
const kp_getItemData = Symbol();
const kp_itemQueryMapper = Symbol();
const kp_itemResponseMapper = Symbol();
const kp_guard = Symbol();
const km_getMapper = Symbol();

export class ResourceBuilder {

    constructor(configuration) {

        const {
            daoProvider,
            urlName,
            getItemData = identOp,
            itemQueryMapper = identOp,
            itemResponseMapper = identOp,
            guard = proceed,
        } = configuration;

        this[kp_getDao] = daoProvider;
        this[kp_urlName] = urlName;
        this[kp_itemQueryMapper] = itemQueryMapper;
        this[kp_itemResponseMapper] = itemResponseMapper;
        this[kp_getItemData] = getItemData;
        this[kp_guard] = guard;
    }

    initialize() {
        this[kp_routerBuilder] = getRouterBuilder(this);
    }

    use(middleware) {
        this[kp_routerBuilder].use(middleware);
        return this;
    }

    [km_getMapper](type) {
        let mapper = this[kp_itemResponseMapper];
        if (typeof mapper === 'object') {
            mapper = mapper[type] ?? mapper.default;
        }
        return mapper;
    }

    getOne(options = {}) {
        let getOne = composeGetOne(this[kp_getDao],
            this[kp_itemQueryMapper], this[km_getMapper]('get'));

        this[kp_routerBuilder]
            .name(getItemUrlName(this[kp_urlName]))
            .get(`/:${ITEM_PARAM}`, this[kp_guard], getOne);

        return this;
    }

    getMany(options = {}) {
        let getMany = composeGetMany(this[kp_getDao],
            this[kp_itemQueryMapper], this[km_getMapper]('get'));

        this[kp_routerBuilder]
            .name(this[kp_urlName])
            .get('/', this[kp_guard], getMany);

        return this;
    }

    delete(options = {}) {
        let deleteOne = composeDeleteOne(this[kp_getDao],
            this[kp_itemQueryMapper], this[km_getMapper]('delete'));

        this[kp_routerBuilder]
            .name(getItemUrlName(this[kp_urlName]))
            .delete(`/:${ITEM_PARAM}`, this[kp_guard], deleteOne);

        return this;
    }

    create(options = {}) {
        let create = composeCreate(this[kp_getDao],
            this[kp_getItemData], this[km_getMapper]('create'));

        this[kp_routerBuilder]
            .name(this[kp_urlName])
            .post('/', this[kp_guard], create);

        return this;
    }

    all() {
        return this.create()
            .delete()
            .getMany()
            .getOne();
    }

    done() {
        return this[kp_routerBuilder].done();
    }

}