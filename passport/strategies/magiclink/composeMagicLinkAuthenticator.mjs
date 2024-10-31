import {MAGIC_LINK} from "../../../auth/authProviders.mjs";
import {composeRequestLoginFromXhrIfNeeded} from "./composeRequestLoginFromXhrIfNeeded.mjs";
import {composeMagicLinkValidateQuery} from "./validateQuery.mjs";
import {chainHandlers} from "../../../core/chainHandlers.mjs";

export function composeMagicLinkAuthenticator(passport, options) {

    const {
        loginSuccessURL,
        loginFailureURL,
        loginFromXHR
    } = options;

    const authenticate = passport.authenticate(MAGIC_LINK,
        {
            action: 'acceptToken',
            userPrimaryKey: 'loginAuth'
        });

    const requestLoginFromXhrIfNeeded = composeRequestLoginFromXhrIfNeeded(loginSuccessURL, loginFailureURL, loginFromXHR);
    const validateQuery = composeMagicLinkValidateQuery(loginFailureURL);

    return chainHandlers(
        validateQuery,
        requestLoginFromXhrIfNeeded,
        authenticate,
    );
}