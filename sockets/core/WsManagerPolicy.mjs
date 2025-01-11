import {monitorServer} from "./monitorClient.mjs";
import {fromWsData} from "./fromWsData.mjs";
import {Emitter} from "velor-utils/utils/Emitter.mjs";
import {getLogger} from "velor-services/application/services/services.mjs";
import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";
import {getMessageBuilder} from "velor-distribution/application/services/services.mjs";
import {WsConnection} from "./WsConnection.mjs";
import {WebSocketServer} from "ws";

const kp_server = Symbol();
const kp_clients = Symbol();

export function WsManagerPolicy(policy = {}) {

    const {
        createWsServer = () => new WebSocketServer(),
        createWsClient = (...args) => new WsConnection(...args),
        acceptMessage = async () => true,
        verifyClient = () => true
    } = policy;

    return class extends Emitter {

        constructor() {
            super();
            this[kp_server] = null;
            this[kp_clients] = new Map();
        }

        get isOpened() {
            return this[kp_server] !== null;
        }

        get clients() {
            return [...this[kp_clients].values()];
        }

        handleUpgrade(request, wsSocket, head) {
            if (this[kp_server]) {
                // Set a cookie in the upgrade response
                const setCookieHeader = `Set-Cookie: myCookie=myValue; Path=/; HttpOnly`;

                wsSocket.write(
                    `HTTP/1.1 101 WebSocket Protocol Handshake\r\n` +
                    `Upgrade: websocket\r\n` +
                    `Connection: Upgrade\r\n` +
                    `${setCookieHeader}\r\n` +
                    `\r\n`
                );

                this[kp_server].handleUpgrade(request, wsSocket, head,
                    (wsClient) => {
                        this[kp_server].emit('connection', wsClient, request);
                    });
            }
        }

        getClient(id) {
            return this[kp_clients].get(id);
        }

        onClientConnected(ws, req, client) {
            super.emit('connection', client);
        }

        async awaitMessage(type) {
            return this.awaitOn('message',
                (client, message) => message.cmd === type);
        }

        verifyClient(request, wsSocket, head) {
            return this[kp_server] !== null && verifyClient(this, request, wsSocket, head);
        }

        unpackMessage(wsClient, data) {
            try {
                data = fromWsData(data);
                return getMessageBuilder(this).unpack(data);
            } catch (e) {
                getLogger(this).error(e.message);
            }
        }

        async onClientData(wsClient, data) {
            try {
                let message = this.unpackMessage(wsClient, data);
                let accepted = await acceptMessage(wsClient, message);
                if (accepted) {
                    await this.onClientMessage(wsClient, message);
                } else {
                    let info = message?.toString() ?? "unknown message";
                    info = ("message was discarded \n" + info);
                    info = info.replaceAll('\n', '\n\t');
                    getLogger(this).debug(info);
                }
            } catch (e) {
                getLogger(this).error(e.message);
            }

        }

        getDispatcher() {
            throw new NotImplementedError();
        }

        async onClientMessage(wsClient, message) {
            return this.getDispatcher()
                .getReceiver(wsClient)
                .onMessage(message);
        }

        count() {
            return this[kp_clients].size;
        }

        appendClient(wsClient) {
            let {ws} = wsClient;

            ws.on('message', async (...args) => {
                await this.onClientData(wsClient, ...args);
                super.emit('message', wsClient, ...args);
            });

            ws.on('error', (err) => getLogger(this).error(err.message));

            ws.on('close', () => {
                this[kp_clients].delete(wsClient.id);
                super.emit('disconnection', wsClient);
            });
            this[kp_clients].set(wsClient.id, wsClient);
        }

        open() {
            if (this[kp_server]) return;

            this[kp_server] = createWsServer();

            this[kp_server].on('connection', (ws, req) => {
                ws.on('close', () => ws.terminate());

                let client = createWsClient(ws, req);
                this.appendClient(client);
                this.onClientConnected(ws, req, client);
            });

            this[kp_server].on('error', (...args) => getLogger(this).error(args));

            monitorServer(this[kp_server]);
        }

        async close() {
            if (!this.isOpened) return;

            for (let [_, client] of this[kp_clients]) {
                client.close();
            }

            this[kp_clients].clear();
            this[kp_server].close();
            this[kp_server] = null;
        }
    };
}