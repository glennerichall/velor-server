import {AUTH_MAGIC_LINK} from "velor-contrib/contrib/authProviders.mjs";
import {requestLoginFromXhrIfNeeded} from "./requestLoginFromXhrIfNeeded.mjs";
import {validateMagicLink} from "./validateMagicLink.mjs";
import {chainHandlers} from "../../../core/chainHandlers.mjs";

export function composeMagicLinkAuthenticator(passport) {
    const authenticate = passport.authenticate(AUTH_MAGIC_LINK,
        {
            action: 'acceptToken',
            userPrimaryKey: 'loginAuth'
        });

    return chainHandlers(
        validateMagicLink,
        requestLoginFromXhrIfNeeded,
        authenticate,
    );
}