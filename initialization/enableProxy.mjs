import {
    isProduction,
    isStaging,
} from "velor-services/application/services/baseServices.mjs";
import {getExpressApp} from "../application/services/services.mjs";

export function enableProxy(services) {
    let expressApp = getExpressApp(services);

    if (isProduction(services) ||
        isStaging(services)) {
        expressApp.enable('trust proxy');
    }
}