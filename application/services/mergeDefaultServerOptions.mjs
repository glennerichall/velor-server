import {mergeDefaultDatabaseOptions} from "velor-database/application/services/mergeDefaultDatabaseOptions.mjs";
import {serverFactories} from "./serverFactories.mjs";
import {chain} from "velor-utils/utils/functional.mjs";
import {mergeDefaultDistributionOptions} from "velor-distribution/application/services/mergeDefaultDistributionOptions.mjs";
import {mergeDefaultServicesOptions} from "velor-services/injection/mergeDefaultServicesOptions.mjs";


export function mergeDefaultServerOptions(options = {}) {
    let {
        factories = {}
    } = options;
    return chain(
        mergeDefaultDatabaseOptions,
        mergeDefaultDistributionOptions,
        mergeDefaultServicesOptions)(
        {
            ...options,
            factories: {
                ...serverFactories,
                ...factories,
            },
        });
}