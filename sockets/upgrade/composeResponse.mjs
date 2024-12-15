import {getLogger} from "velor-services/application/services/services.mjs";
import status from 'statuses';

export function composeResponse(services) {
    return (wsSocket) => {
        return {
            status(code) {
                this.code = code;
                return this;
            },

            send(message) {
                let contentType = 'text/plain';

                if (typeof message === 'object') {
                    message = JSON.stringify(message);
                    contentType = 'application/json';
                }

                // manually respond a http message
                getLogger(services).debug(`WSS connection refused with status[${this.code}] message: ${this.message}`);

                let httpMessage = `HTTP/1.1 ${this.code} ${status(this.code)}\r\n`;

                if(message) {
                    httpMessage += `Content-Type: ${contentType}\r\n` +
                        `Content-Length: ${Buffer.byteLength(message)}\r\n\r\n` +
                        message;
                } else {
                    httpMessage += "\r\n";
                }

                wsSocket.write(httpMessage);
                wsSocket.destroy();
            }
        }
    };
}