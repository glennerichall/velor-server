import express from "express";
import {tryCatchAsyncHandler as defaultTryCatchAsyncHandler} from "./tryCatchAsyncHandler.mjs";

const kp_router = Symbol();
const kp_name = Symbol();

export const routerBuilderPolicy = ({
                                        tryCatchAsyncHandler = defaultTryCatchAsyncHandler,
                                        newRouter = express.Router
                                    }) => {

    // use and options must be declared first
    let methods = ['use', 'options', 'get', 'post', 'put', 'delete'];

    return class RouterBuilder {

        constructor(router) {
            if (!router) router = newRouter();
            this[kp_router] = {router};
            this[kp_name] = null;
        }

        use(path, ...handlers) {
            if (typeof path === 'function') {
                this[kp_router].router.use(tryCatchAsyncHandler(path), ...tryCatchAsyncHandler(handlers, this[kp_name]));
            } else {
                this[kp_router].router.use(path, ...tryCatchAsyncHandler(handlers, this[kp_name]));
            }
            this[kp_name] = null;
            return this;
        }

        all(path, ...handlers) {
            this[kp_router].router.all(path, ...tryCatchAsyncHandler(handlers, this[kp_name]));
            this[kp_name] = null;
            return this;
        }

        get(path, ...handlers) {
            this[kp_router].router.get(path, ...tryCatchAsyncHandler(handlers, this[kp_name]));
            this[kp_name] = null;
            return this;
        }

        post(path, ...handlers) {
            this[kp_router].router.post(path, ...tryCatchAsyncHandler(handlers, this[kp_name]));
            this[kp_name] = null;
            return this;
        }

        put(path, ...handlers) {
            this[kp_router].router.put(path, ...tryCatchAsyncHandler(handlers, this[kp_name]));
            this[kp_name] = null;
            return this;
        }

        delete(path, ...handlers) {
            this[kp_router].router.delete(path, ...tryCatchAsyncHandler(handlers, this[kp_name]));
            this[kp_name] = null;
            return this;
        }

        options(path, ...handlers) {
            this[kp_router].router.options(path, ...tryCatchAsyncHandler(handlers));
            this[kp_name] = null;
            return this;
        }

        name(name) {
            this[kp_name] = name;
            return this;
        }

        configure(configuration = []) {
            for (let route of configuration) {

                if (typeof route === 'function') {
                    this.use(route);
                    continue;
                }

                for (let method of methods) {
                    if (route[method]) {
                        let handlers = route[method];
                        if (!Array.isArray(handlers)) {
                            handlers = [handlers];
                        }
                        if (route.name) {
                            this.name(route.name);
                        }
                        if (route.path) {
                            this[method](route.path, ...handlers);
                        } else {
                            this[method](...handlers);
                        }
                    }
                }

                if (route.router) {
                    const subRouter = new this.constructor()
                        .configure(route.router)
                        .done();

                    if (route.path) {
                        this.use(route.path, subRouter);
                    } else {
                        this.use(subRouter);
                    }
                }
            }

            return this;
        }

        done() {
            return this[kp_router].router;
        }
    }
}

export function createRouterBuilder(args = {}) {
    const RouterBuilder = routerBuilderPolicy(args);
    return new RouterBuilder();
}