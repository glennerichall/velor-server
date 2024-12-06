export class WsManagerProvider {
    #managers = new Map();

    constructor(managers) {
    }

    add(path, manager) {
        this.#managers.set(path, manager);
        return this;
    }

    getFromRequest(request) {
        let path = new URL(request.url, 'http://example.com').pathname;
        return this.getFromPath(path);
    }

    getFromPath(path) {
        return this.#managers.get(path);
    }
}