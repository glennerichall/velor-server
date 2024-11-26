import {createAuthConfiguration} from "../routes/auth.mjs";
import {createRouterBuilder} from "../core/createRouterBuilder.mjs";

export function composeAuth(services, providers) {
    const authConfigs = createAuthConfiguration(services, providers);
    return createRouterBuilder().configure(authConfigs).done();
}