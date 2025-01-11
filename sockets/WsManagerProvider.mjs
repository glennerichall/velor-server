const kp_managers = Symbol();

export class WsManagerProvider {


    constructor(managers) {
        this[kp_managers] = new Map();
    }

    add(path, manager) {
        this[kp_managers].set(path, manager);
        return this;
    }

    getFromRequest(request) {
        let path = new URL(request.originalUrl).pathname;
        return this.getFromPath(path);
    }

    getFromPath(path) {
        return this[kp_managers].get(path);
    }
}