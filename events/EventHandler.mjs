import {broadcast} from "velor-utils/utils/functional.mjs";
import {getProvider} from "velor-services/application/services/baseServices.mjs";
import {
    s_clientEventHandler,
    s_loginEventHandler
} from "../application/services/serviceKeys.mjs";

const kp_handlers = Symbol();
const kp_broadcastToHandlers = Symbol();

export class EventHandler {
    initialize() {
        let clientEventHandler = getProvider(this)[s_clientEventHandler]();
        let loginHandler = getProvider(this)[s_loginEventHandler]();

        this[kp_handlers] = [
            clientEventHandler,
            loginHandler,
        ]

        this[kp_broadcastToHandlers] = broadcast(
            ...this[kp_handlers].map(
                handler => (...args) => handler.handleEvent(...args)
            )
        );
    }

    async handleEvent(eventName, ...args) {
        await Promise.all(
            this[kp_broadcastToHandlers](eventName, ...args)
        );
    }
}