import {getEmitter} from "../services/services.mjs";
import {EventQueue} from "velor-utils/utils/EventQueue.mjs";
import {
    EVENT_USER_LOGIN,
    EVENT_USER_LOGOUT
} from "../services/eventKeys.mjs";

export function createEventQueueInstance(services) {
    const emitter = getEmitter(services);
    return new EventQueue(emitter)
        .listen(EVENT_USER_LOGIN)
        .listen(EVENT_USER_LOGOUT);
}