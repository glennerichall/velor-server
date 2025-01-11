import {ClientIndex} from "../../backend/distribution/ClientIndex.mjs";
import {getKeyStore} from "../../backend/application/services/backendServices.mjs";
import {getServiceBinder} from "velor/utils/injection/ServicesContext.mjs";

const WS_CLIENT_INDEX = "websockets.clients";
const WS_PRINTER_INDEX = "websockets.printers";

const kp_clients = Symbol();
const kp_printers = Symbol();

export class WsIndex {



    initialize() {
        let keyStore = getKeyStore(this);
        this[kp_clients] = getServiceBinder(this).createInstance(ClientIndex, WS_CLIENT_INDEX, keyStore);
        this[kp_printers] = getServiceBinder(this).createInstance(ClientIndex, WS_PRINTER_INDEX, keyStore);
    }

    addClient(transport) {
        return this[kp_clients].add(transport);
    }

    removeClient(...transports) {
        return this[kp_clients].remove(...transports);
    }

    addPrinter(transport) {
        return this[kp_printers].add(transport);
    }

    removePrinter(...transports) {
        return this[kp_printers].remove(...transports);
    }

    getClients() {
        return this[kp_clients].getAll();
    }

    getPrinters() {
        return this[kp_printers].getAll();
    }
}