import {
    getEmitter,
    getUserManager
} from "../../application/services/serverServices.mjs";
import {EVENT_USER_LOGIN} from "../../application/services/serverEventKeys.mjs";

export const composeOnProfileReceived = (services, provider) => {
    const userManager = getUserManager(services);
    const emitter = getEmitter(services);

    return async (req, tok1, tok2, profile, done) => {
        try {
            const user = await userManager.updateUserFromAuthLogin(provider, profile);
            emitter.emit(EVENT_USER_LOGIN, user);
            done(null, user);
        } catch (err) {
            done(err);
        }
    }
};
