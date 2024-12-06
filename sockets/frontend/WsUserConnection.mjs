import {WsConnection} from "../core/WsConnection.mjs";
import {getLogger} from "velor-services/injection/services.mjs";

export class WsUserConnection extends WsConnection {
    #sessionId;
    #userId;

    constructor(sessionId, userId, ...args) {
        super(...args);
        this.#sessionId = sessionId;
        this.#userId = userId;
    }

    get isLoggedIn() {
        return !!this.userId;
    }

    get sessionId() {
        return this.#sessionId;
    }

    get userId() {
        return this.#userId;
    }

    setUserId(userId) {
        getLogger(this).debug(`Setting user's id in session[${this.sessionId}] to --> ` + userId)
        this.#userId = userId;
    }

    getInfo() {
        return {
            ...super.getInfo(),
            sessionId: this.sessionId,
            userId: this.userId,
            fingerprint: this.fingerprint,
        }
    }
}