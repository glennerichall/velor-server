import {
    getLogger
} from "velor-services/application/services/services.mjs";
import {
    getAuthDAO,
    getUserDAO
} from "velor-dbuser/application/services/services.mjs";
import {conformProfile} from "velor-dbuser/models/conform/conformProfile.mjs";

export const composeOnProfileReceived = (provider) => {
    return async (req, tok1, tok2, profile, done) => {
        const userDAO = getUserDAO(req);
        const authDAO = getAuthDAO(req);
        const logger = getLogger(req);

        try {
            let auth = conformProfile(profile, provider);
            auth = await authDAO.loadOrSave(auth);
            const user = await userDAO.loadOrSave(auth);
            done(null, user);
        } catch (err) {
            logger.error('Unable to save auth to user for profile [' +
                profile.id + '] provider [' + provider + ']');
            done(err);
        }
    }
};
