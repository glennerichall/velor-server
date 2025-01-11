import {WsConnection} from "../core/WsConnection.mjs";
import {getLogger} from "velor-services/application/services/services.mjs";

const kp_sessionId = Symbol();
const kp_userId = Symbol();

export class WsUserConnection extends WsConnection {

    constructor(sessionId, userId, ...args) {
        super(...args);
        this[kp_sessionId] = sessionId;
        this[kp_userId] = userId;
    }

    get isLoggedIn() {
        return !!this.userId;
    }

    get sessionId() {
        return this[kp_sessionId];
    }

    get userId() {
        return this[kp_userId];
    }

    setUserId(userId) {
        getLogger(this).debug(`Setting user's id in session[${this.sessionId}] to --> ` + userId)
        this[kp_userId] = userId;
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