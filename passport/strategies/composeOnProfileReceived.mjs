import {EVENT_USER_LOGIN} from "../../application/services/eventKeys.mjs";
import {
    getEmitter,
    getLogger
} from "velor-services/application/services/services.mjs";
import {
    getAuthDAO,
    getUserDAO
} from "velor-dbuser/application/services/services.mjs";
import {conformProfile} from "velor-dbuser/models/conform/conformProfile.mjs";

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
