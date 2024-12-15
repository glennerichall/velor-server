import {monitorServer} from "./monitorClient.mjs";
import {fromWsData} from "./fromWsData.mjs";
import {Emitter} from "velor-utils/utils/Emitter.mjs";
import {getLogger} from "velor-services/application/services/services.mjs";
import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";
import {getMessageBuilder} from "velor-distribution/application/services/services.mjs";
import {WsConnection} from "./WsConnection.mjs";
import {WebSocketServer} from "ws";

export function WsManagerPolicy(policy = {}) {

    const {
        createWsServer = () => new WebSocketServer(),
        createWsClient = (...args) => new WsConnection(...args),
        acceptMessage = async () => true,
        verifyClient = () => true
    } = policy;

    return class extends Emitter {
        #server;
        #clients;

        constructor() {
            super();
            this.#server = null;
            this.#clients = new Map();
        }

        get isOpened() {
            return this.#server !== null;
        }

        get clients() {
            return [...this.#clients.values()];
        }

        handleUpgrade(request, wsSocket, head) {
            if (this.#server) {
                // Set a cookie in the upgrade response
                const setCookieHeader = `Set-Cookie: myCookie=myValue; Path=/; HttpOnly`;

                wsSocket.write(
                    `HTTP/1.1 101 WebSocket Protocol Handshake\r\n` +
                    `Upgrade: websocket\r\n` +
                    `Connection: Upgrade\r\n` +
                    `${setCookieHeader}\r\n` +
                    `\r\n`
                );

                this.#server.handleUpgrade(request, wsSocket, head,
                    (wsClient) => {
                        this.#server.emit('connection', wsClient, request);
                    });
            }
        }

        getClient(id) {
            return this.#clients.get(id);
        }

        onClientConnected(ws, req, client) {
            super.emit('connection', client);
        }

        async awaitMessage(type) {
            return this.awaitOn('message',
                (client, message) => message.cmd === type);
        }

        verifyClient(request, wsSocket, head) {
            return this.#server !== null && verifyClient(this, request, wsSocket, head);
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
            return this.#clients.size;
        }

        appendClient(wsClient) {
            let {ws} = wsClient;

            ws.on('message', async (...args) => {
                await this.onClientData(wsClient, ...args);
                super.emit('message', wsClient, ...args);
            });

            ws.on('error', (err) => getLogger(this).error(err.message));

            ws.on('close', () => {
                this.#clients.delete(wsClient.id);
                super.emit('disconnection', wsClient);
            });
            this.#clients.set(wsClient.id, wsClient);
        }

        open() {
            if (this.#server) return;

            this.#server = createWsServer();

            this.#server.on('connection', (ws, req) => {
                ws.on('close', () => ws.terminate());

                let client = createWsClient(ws, req);
                this.appendClient(client);
                this.onClientConnected(ws, req, client);
            });

            this.#server.on('error', (...args) => getLogger(this).error(args));

            monitorServer(this.#server);
        }

        async close() {
            if (!this.isOpened) return;

            for (let [_, client] of this.#clients) {
                client.close();
            }

            this.#clients.clear();
            this.#server.close();
            this.#server = null;
        }
    };
}