import {mergeDefaultDatabaseOptions} from "velor-database/application/services/mergeDefaultDatabaseOptions.mjs";
import {serverFactories} from "./serverFactories.mjs";


export function mergeDefaultServerOptions(options) {
    return mergeDefaultDatabaseOptions(
        {
            factories: serverFactories,
            ...options
        })
}