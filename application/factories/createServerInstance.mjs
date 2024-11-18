import http from "http";
import {getExpressApp} from "../services/serverServices.mjs";

export function createServerInstance(services) {
    const expressApp = getExpressApp(services);
    return http.createServer(expressApp);
}