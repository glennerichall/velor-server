import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {broadcast} from "velor-utils/utils/functional.mjs";
import {ClientEventHandler} from "./ClientEventHandler.mjs";
import {LoginHandler} from "./LoginHandler.mjs";
import {getProvider} from "velor-services/application/services/baseServices.mjs";
import {
    s_clientEventHandler,
    s_loginEventHandler
} from "../application/services/serviceKeys.mjs";

export class EventHandler {

    #handlers;
    #broadcastToHandlers;

    initialize() {
        let clientEventHandler = getProvider(this)[s_clientEventHandler]();
        let loginHandler = getProvider(this)[s_loginEventHandler]();

        this.#handlers = [
            clientEventHandler,
            loginHandler,
        ]

        this.#broadcastToHandlers = broadcast(
            ...this.#handlers.map(
                handler => (...args) => handler.handleEvent(...args)
            )
        );
    }


    async handleEvent(eventName, ...args) {
        await Promise.all(
            this.#broadcastToHandlers(eventName, ...args)
        );
    }
}