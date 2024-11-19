import corsMiddleware from "cors";
import {getEnvValue} from "velor-services/injection/baseServices.mjs";
import {ALLOW_CORS} from "../application/services/serverEnvKeys.mjs";

export const corsProvider = services => {
    return corsMiddleware(
        {
            origin: getEnvValue(ALLOW_CORS).split(';'),
            credentials: true
        }
    );
};