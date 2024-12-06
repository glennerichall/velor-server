import {ClientIndex} from "../../backend/distribution/ClientIndex.mjs";
import {getKeyStore} from "../../backend/application/services/backendServices.mjs";
import {getServiceBinder} from "velor/utils/injection/ServicesContext.mjs";

const WS_CLIENT_INDEX = "websockets.clients";
const WS_PRINTER_INDEX = "websockets.printers";

export class WsIndex {

    #clients;
    #printers;

    initialize() {
        let keyStore = getKeyStore(this);
        this.#clients = getServiceBinder(this).createInstance(ClientIndex, WS_CLIENT_INDEX, keyStore);
        this.#printers = getServiceBinder(this).createInstance(ClientIndex, WS_PRINTER_INDEX, keyStore);
    }

    addClient(transport) {
        return this.#clients.add(transport);
    }

    removeClient(...transports) {
        return this.#clients.remove(...transports);
    }

    addPrinter(transport) {
        return this.#printers.add(transport);
    }

    removePrinter(...transports) {
        return this.#printers.remove(...transports);
    }

    getClients() {
        return this.#clients.getAll();
    }

    getPrinters() {
        return this.#printers.getAll();
    }
}