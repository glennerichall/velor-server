import {getDatabase} from "../../../../scripts/application/services/scriptServices.mjs";
import {GcodeManager} from "../../file/GcodeManager.mjs";
import {bindClientEventsOnFileManager} from "../composers/bindClientEventsOnFileManager.mjs";
import {composeAutoSendMessageFactoryProviderForUserId} from "../composers/composeAutoSendMessageFactoryProviderForUserId.mjs";
import {getGcodeFileStore} from "../services/backendServices.mjs";

export function createGcodeManagerInstance(services) {
    const database = getDatabase(services);
    const gcodeFS = getGcodeFileStore(services);

    const gcodeManager = new GcodeManager(database, gcodeFS);
    const getEmitter = composeAutoSendMessageFactoryProviderForUserId(services);

    return bindClientEventsOnFileManager(gcodeManager, getEmitter);

}