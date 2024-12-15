import {getEventQueue} from "velor-services/application/services/services.mjs";
import {
    EVENT_SERVER_CLOSED,
    EVENT_USER_LOGIN,
    EVENT_USER_LOGOUT
} from "../application/services/eventKeys.mjs";

export function setupEvents(services) {
    getEventQueue(services)
        .listen(EVENT_USER_LOGIN)
        .listen(EVENT_USER_LOGOUT)
        .listen(EVENT_SERVER_CLOSED)
}