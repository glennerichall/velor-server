import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {broadcast} from "velor-utils/utils/functional.mjs";
import {ClientEventHandler} from "./ClientEventHandler.mjs";
import {LoginHandler} from "./LoginHandler.mjs";

export class EventHandler {

    #handlers;
    #broadcastToHandlers;

    initialize() {
        let clientEventHandler = getServiceBinder(this)
            .createInstance(ClientEventHandler);

        let loginHandler = getServiceBinder(this)
            .createInstance(LoginHandler);

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