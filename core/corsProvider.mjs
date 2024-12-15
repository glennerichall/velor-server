import corsMiddleware from "cors";
import {getEnvValue} from "velor-services/application/services/baseServices.mjs";
import {ALLOW_CORS} from "../application/services/envKeys.mjs";

export const corsProvider = services => {
    return corsMiddleware(
        {
            origin: getEnvValue(ALLOW_CORS).split(';'),
            credentials: true
        }
    );
};