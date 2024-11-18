import {
    isProduction,
    isStaging,
} from "velor-services/injection/baseServices.mjs";
import {getExpressApp} from "../application/services/serverServices.mjs";

export function enableProxy(services) {
    let expressApp = getExpressApp(services);

    if (isProduction(services) ||
        isStaging(services)) {
        expressApp.enable('trust proxy');
    }
}