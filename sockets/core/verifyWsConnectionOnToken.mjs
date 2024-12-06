import {UNAUTHORIZED} from "./wsErrors.mjs";
import {getDatabase} from "../../../backend/application/services/backendServices.mjs";

export async function verifyWsConnectionOnToken(req) {
    const tokenValue = new URL(req.url, 'http://example.com').searchParams.get('token');
    const database = getDatabase(req);

    if (!tokenValue) {
        return UNAUTHORIZED;
    }

    const token = await database.tokens.useToken(tokenValue);

    if (!token || token.expired || token.limit_reached) {
        return UNAUTHORIZED;
    }

    return true;
}