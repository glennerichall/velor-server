import {getExpressApp} from "../application/services/serverServices.mjs";
import {getAppEndpoints} from "../core/getAppEndpoints.mjs";
import {getConstants} from "velor-services/injection/baseServices.mjs";

export function createConstants(services) {
    let expressApp = getExpressApp(services);

    // determine the endpoints urls indexed by their names
    // must be after installRoutesAndMiddlewares
    let endpoints = getAppEndpoints(expressApp._router)
        .reduce((prev, cur) => {
            prev[cur.name] = cur.path;
            return prev;
        }, {});

    getConstants(services).endpoints = endpoints;
}