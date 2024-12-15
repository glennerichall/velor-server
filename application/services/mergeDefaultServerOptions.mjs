import {factories as defaultFactories} from "./factories.mjs";
import {chain} from "velor-utils/utils/functional.mjs";
import {mergeDefaultDistributionOptions} from "velor-distribution/application/services/mergeDefaultDistributionOptions.mjs";
import {mergeDefaultDbUserOptions} from "velor-dbuser/application/services/mergeDefaultDbUserOptions.mjs";
import {mergeDefaultServicesOptions} from "velor-services/application/services/mergeDefaultServicesOptions.mjs";


export function mergeDefaultServerOptions(options = {}) {
    let {
        factories = {}
    } = options;
    return chain(
        mergeDefaultDbUserOptions,
        mergeDefaultDistributionOptions,
        mergeDefaultServicesOptions)(
        {
            ...options,
            factories: {
                ...defaultFactories,
                ...factories,
            },
        });
}