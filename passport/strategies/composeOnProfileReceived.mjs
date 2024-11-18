import {getUserManager} from "../../application/services/serverServices.mjs";
import {getUser} from "../../application/services/requestServices.mjs";

export const composeOnProfileReceived = (services, provider) => {
    const userManager = getUserManager(services);

    return async (req, tok1, tok2, profile, done) => {
        try {
            const user = await userManager.updateUserFromAuthLogin(getUser(req), provider, profile);
            done(null, user);
        } catch (err) {
            done(err);
        }
    }
};
