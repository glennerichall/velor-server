import {getClientsBySession} from "../application/services/requestServices.mjs";
import {getMessageFactory} from "../application/services/serverServices.mjs";

export async function emitLoggedOut(req) {
    const clients = await getClientsBySession(req);
    let message = getMessageFactory(req).loggedOut();
    await clients.send(message);
}