import {ClientEventHandler} from "./ClientEventHandler.mjs";
import {
    EVENT_USER_LOGIN,
    EVENT_USER_LOGOUT
} from "../application/services/eventKeys.mjs";
import {getUserDAO} from "velor-dbuser/application/services/services.mjs";
import {getLogger} from "velor-services/application/services/services.mjs";

export class LoginHandler extends ClientEventHandler {
    async handleEvent(eventName, user) {

        try {
            switch (eventName) {
                case EVENT_USER_LOGIN:
                    await getUserDAO(this).saveLoginEvent(user);
                    break;

                case EVENT_USER_LOGOUT:
                    await getUserDAO(this).saveLogoutEvent(user);
                    break;
            }
        } catch (e) {
            getLogger(this).error('Unable to save login event ' + e.message);
        }
    }
}