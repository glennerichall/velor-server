import {AUTH_MAGIC_LINK} from "velor-contrib/contrib/authProviders.mjs";
import {chainHandlers} from "../../../core/chainHandlers.mjs";

export function composeMagicLinkInitiator(passport) {
    const initiate = passport.authenticate(AUTH_MAGIC_LINK,
        {
            action: 'requestToken',
            passReqToCallback: true,
        });

    const replyRequestId = (req, res) => {
        const requestId = req.requestId;
        res.status(201).json({requestId});
    };

    return chainHandlers(
        initiate,
        replyRequestId
    );
}