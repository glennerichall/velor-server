import {mailEmitter} from "./mailerTransport.mjs";
import {EventQueue} from "../../core/EventQueue.mjs";
import {Emitter} from "velor-utils/utils/Emitter.mjs";
import {composeLoginWithToken} from "../contrib/api/composeLoginWithToken.mjs";
import {composeGetCsrfToken} from "../contrib/api/composeGetCsrfToken.mjs";
import {composeLogout} from "../contrib/api/composeLogout.mjs";
import {composeInitiateLoginWithOpenId} from "../contrib/api/composeInitiateLoginWithOpenId.mjs";

export const api =
    async ({services, request, rest}, use) => {

        // // simulate a connection to websocket
        // let websocket = new Emitter({async: true});
        // websocket.send = async function (data) {
        //     this.emit('message', data);
        // };
        //
        // const mailerEventQueue = new EventQueue(mailEmitter);
        // const webSocketEventQueue = new EventQueue(websocket);
        //
        // mailerEventQueue.initialize();
        // webSocketEventQueue.initialize();

        await use({
            loginWithToken: composeLoginWithToken(services, request),
            initiateLoginWithOpenId: composeInitiateLoginWithOpenId(services, request, rest),
            getCsrfToken: composeGetCsrfToken(services, request),
            logout: composeLogout(services, request),
        });
    }