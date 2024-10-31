import {MAGIC_LINK} from "../../../auth/authProviders.mjs";
import {chainHandlers} from "../../../core/chainHandlers.mjs";

export function composeMagicLinkInitiator(passport) {
    const initiate = passport.authenticate(MAGIC_LINK,
        {
            action: 'requestToken',
            passReqToCallback: true,
        });

    const replyRequestId = (req, res) => {
        const requestId = req.requestId;
        res.status(200).json({requestId});
    };

    return chainHandlers(
        initiate,
        replyRequestId
    );
}