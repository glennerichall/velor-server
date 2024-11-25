import {MapArray} from "velor-utils/utils/map.mjs";

export class EventQueue {
    #emitter;
    #events = new MapArray();

    constructor(emitter) {
        this.#emitter = emitter;
    }

    initialize() {
        this.#emitter.onAny((event, ...data) => {
            this.#events.push(event, data);
        });
    }

    clear(event) {
        if (event) {
            this.#events.delete(event);
        } else {
            this.#events.clear();
        }
    }

    dequeue(event) {
        return this.#events.pop(event, 0);
    }

    async waitDequeue(event) {
        let data = this.dequeue(event);
        if (data === undefined) {
            return this.#emitter.waitOn(event);
        }
        return data;
    }
}