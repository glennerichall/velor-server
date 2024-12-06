import crypto from "crypto";

export class WsConnection {
    constructor(ws, ipAddress) {
        this._ws = ws;
        this._id = crypto.randomUUID();
        this._ipAddress = ipAddress;
        this._connectionTime = new Date();
    }

    get ws() {
        return this._ws;
    }

    get id() {
        return this._id;
    }

    get ipAddress() {
        return this._ipAddress;
    }

    get connectionTime() {
        return this._connectionTime;
    }

    close() {
        this._ws.close();
    }

    getInfo() {
        return {
            id: this.id,
            ipAddress: this.ipAddress,
            connectionTime: this.connectionTime,
            serverId: process.env.HEROKU_DYNO_ID
        }
    }

    send(messageOrArrayBuffer) {
        if (messageOrArrayBuffer.buffer instanceof ArrayBuffer) {
            messageOrArrayBuffer = messageOrArrayBuffer.buffer;
        }
        if (!(messageOrArrayBuffer instanceof ArrayBuffer)) {
            throw new Error("message must be an ArrayBuffer or an object containing a property named buffer that is an ArrayBuffer");
        }
        return this._ws.send(messageOrArrayBuffer);
    }
}