import {FileManager} from "../../files/FileManager.mjs";
import {getFileStore} from "../services/services.mjs";

export function createFileManagerInstance(services) {

    const fileStore = getFileStore(services);
    const fileEntries = getFileStore(services);

    return new FileManager(services);
}