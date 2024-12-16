import {getEmitter} from "velor-services/application/services/services.mjs";
import {
    ELEMENT_CREATED,
    ELEMENT_DELETED
} from "velor-dbuser/models/events.mjs";
import {
    EVENT_SERVER_CLOSED,
    EVENT_USER_LOGIN,
    EVENT_USER_LOGOUT
} from "../application/services/eventKeys.mjs";
import {getEventHandler} from "../application/services/services.mjs";

export function setupEvents(services) {
    let emitter = getEmitter(services);
    let handler = getEventHandler(services);

    const listen = (...eventNames) => eventNames.map(eventName =>
        emitter.on(eventName, (...args) => handler.handleEvent(eventName, ...args)));

    let off = listen(
        ELEMENT_CREATED,
        ELEMENT_DELETED,
        EVENT_USER_LOGOUT,
        EVENT_USER_LOGIN,
    );

    emitter.on(EVENT_SERVER_CLOSED, off);

}