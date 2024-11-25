import {getEmitter} from "../services/serverServices.mjs";
import {EventQueue} from "../../core/EventQueue.mjs";

export function createEventQueueInstance(services) {
    const emitter = getEmitter(services);
    return new EventQueue(emitter);
}