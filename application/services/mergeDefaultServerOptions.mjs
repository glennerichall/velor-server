import {mergeDefaultDatabaseOptions} from "velor-database/application/services/mergeDefaultDatabaseOptions.mjs";
import {serverFactories} from "./serverFactories.mjs";


export function mergeDefaultServerOptions(options) {
    let {
        factories = {}
    } = options;
    return mergeDefaultDatabaseOptions(
        {
            ...options,
            factories: {
                ...factories,
                ...serverFactories
            },
        })
}