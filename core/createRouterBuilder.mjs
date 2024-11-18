import express from "express";
import {tryCatchAsyncHandler as defaultTryCatchAsyncHandler} from "./tryCatchAsyncHandler.mjs";

const names = [];
// use and options must be declared first
let methods = ['use', 'options', 'get', 'post', 'put', 'delete'];

export const routerBuilderPolicy = ({
                                        tryCatchAsyncHandler = defaultTryCatchAsyncHandler,
                                        newRouter = express.Router
                                    }) =>
    class RouterBuilder {

        #router;
        #name;

        constructor(router) {
            this.#router = router ?? newRouter();
            this.#name = null;
        }

        use(path, ...handlers) {
            if (typeof path === 'function') {
                this.#router.use(tryCatchAsyncHandler(path), ...tryCatchAsyncHandler(handlers, this.#name));
            } else {
                this.#router.use(path, ...tryCatchAsyncHandler(handlers, this.#name));
            }
            this.#name = null;
            return this;
        }

        all(path, ...handlers) {
            this.#router.all(path, ...tryCatchAsyncHandler(handlers, this.#name));
            this.#name = null;
            return this;
        }

        get(path, ...handlers) {
            this.#router.get(path, ...tryCatchAsyncHandler(handlers, this.#name));
            this.#name = null;
            return this;
        }

        post(path, ...handlers) {
            this.#router.post(path, ...tryCatchAsyncHandler(handlers, this.#name));
            this.#name = null;
            return this;
        }

        put(path, ...handlers) {
            this.#router.put(path, ...tryCatchAsyncHandler(handlers, this.#name));
            this.#name = null;
            return this;
        }

        delete(path, ...handlers) {
            this.#router.delete(path, ...tryCatchAsyncHandler(handlers, this.#name));
            this.#name = null;
            return this;
        }

        options(path, ...handlers) {
            this.#router.options(path, ...tryCatchAsyncHandler(handlers));
            this.#name = null;
            return this;
        }

        name(name) {
            this.#name = name;
            names.push(name);
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
            return this.#router;
        }
    }

export function createRouterBuilder(args = {}) {
    const RouterBuilder = routerBuilderPolicy(args);
    return new RouterBuilder();
}