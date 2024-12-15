import http from "http";
import {getExpressApp} from "../services/services.mjs";

export function createServerInstance(services) {
    const expressApp = getExpressApp(services);
    return http.createServer(expressApp);
}