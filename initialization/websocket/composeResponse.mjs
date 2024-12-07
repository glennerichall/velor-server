import {getLogger} from "velor-services/injection/services.mjs";

export function composeResponse(services) {
    return wsSocket => {
        return {
            status(code) {
                this.code = code;
                return this;
            },

            send(message) {
                // manually respond a http message
                getLogger(services).debug(`WSS connection refused with status[${this.code}] message: ${this.message}`);
                wsSocket.write(`HTTP/1.1 ${this.code} ${message}\r\n\r\n`);
                wsSocket.destroy();
            }
        }
    };
}