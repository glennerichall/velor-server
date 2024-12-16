import {getExpressApp} from "../application/services/services.mjs";
import {getAppEndpoints} from "../core/getAppEndpoints.mjs";
import {getServiceBuilder} from "velor-services/injection/ServicesContext.mjs";
import {URLS} from "../application/services/constKeys.mjs";

export function createConstants(services) {
    let expressApp = getExpressApp(services);

    // determine the endpoints urls indexed by their names
    // must be after installRoutesAndMiddlewares
    let urls = getAppEndpoints(expressApp._router)
        .reduce((prev, cur) => {
            prev[cur.name] = cur.path;
            return prev;
        }, {});

    let constants = {
        [URLS]: urls
    };

    getServiceBuilder(services).addConstants(constants);
}