import {monitorServer} from "./monitorClient.mjs";
import {fromWsData} from "./fromWsData.mjs";
import {Emitter} from "velor-utils/utils/Emitter.mjs";
import {getLogger} from "velor-services/injection/services.mjs";
import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";
import {getMessageBuilder} from "velor-distribution/application/services/distributionServices.mjs";
import {WsConnection} from "./WsConnection.mjs";
import {WebSocketServer} from "ws";

export function WsManagerPolicy(policy = {}) {

    const {
        createServer = () => new WebSocketServer(),
        createClient = (...args) => new WsConnection(...args),
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

        get isOpen() {
            return this.#server !== null;
        }

        get clients() {
            return [...this.#clients.values()];
        }

        handleUpgrade(request, wss, head) {
            if (this.#server) {
                this.#server.handleUpgrade(request, wss, head, ws => {
                    this.#server.emit('connection', ws, request);
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

        verifyClient(request, wss, head) {
            return this.#server !== null && verifyClient(this, request, wss, head);
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
                    getLogger(this).debug(
                        ("message was discarded \n" +
                            message.toString())
                            .replaceAll('\n', '\n\t'));
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

            this.#server = createServer();

            this.#server.on('connection', (ws, req) => {
                ws.on('close', () => ws.terminate());

                let client = createClient(ws, req);
                this.appendClient(client);
                this.onClientConnected(ws, req, client);
            });

            this.#server.on('error', (...args) => getLogger(this).error(args));

            monitorServer(this.#server);
        }

        async close() {
            if (!this.isOpen) return;

            for (let [key, client] of this.#clients) {
                client.close();
            }

            this.#clients.clear();
            this.#server.close();
            this.#server = null;
        }
    };
}