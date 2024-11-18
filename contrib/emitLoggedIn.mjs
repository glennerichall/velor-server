import {getClientsBySession} from "../application/services/requestServices.mjs";
import {getMessageFactory} from "../application/services/serverServices.mjs";


export async function emitLoggedIn(req) {
    const clients = await getClientsBySession(req);
    let message = getMessageFactory(req).loggedIn();
    await clients.send(message);
}