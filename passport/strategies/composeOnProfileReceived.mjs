import {
    getAuthDAO,
    getEmitter,
    getUserDAO,
} from "../../application/services/serverServices.mjs";
import {EVENT_USER_LOGIN} from "../../application/services/serverEventKeys.mjs";
import {conformProfile} from "../../models/conform/conformProfile.mjs";
import {getLogger} from "velor-services/injection/services.mjs";

export const composeOnProfileReceived = (provider) => {
    return async (req, tok1, tok2, profile, done) => {
        const emitter = getEmitter(req);
        const userDAO = getUserDAO(req);
        const authDAO = getAuthDAO(req);
        const logger = getLogger(req);

        try {
            let auth = conformProfile(profile, provider);
            auth = await authDAO.saveOne(auth);
            const user = await userDAO.saveOne(auth);
            emitter.emit(EVENT_USER_LOGIN, user);
            done(null, user);
        } catch (err) {
            logger.error('Unable to save auth to user for profile [' +
                profile.id + '] provider [' + provider + ']');
            done(err);
        }
    }
};
