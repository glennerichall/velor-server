import {createAuthConfiguration} from "../routes/auth.mjs";
import {getRouterBuilder} from "../application/services/serverServices.mjs";

export function composeAuth(services, providers) {
    const authConfigs = createAuthConfiguration(services, providers);
    return getRouterBuilder(services).configure(authConfigs).done();
}