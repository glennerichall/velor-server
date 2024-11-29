import {getMessageFactory} from "../../../application/services/serverServices.mjs";
import {getClientProvider} from "velor-distribution/application/services/distributionServices.mjs";
import {getChannelForSession} from "../../../distribution/channels.mjs";
import {ErrorCode} from "../../../core/ErrorCode.mjs";
import {
    E_INTERNAL_ERROR,
    E_SESSION_EXPIRED
} from "velor-contrib/contrib/errors.mjs";

export function composeLoginFromXHR(services) {

    const clientProvider = getClientProvider(services);

    return async sessionId => {

        const channel = getChannelForSession(sessionId);

        let count = await clientProvider.getSubscriptionCount(channel);

        if (count >= 1) {
            const client = await clientProvider.getClient(channel);
            let message = getMessageFactory(services).requireLogin();
            let response = await client.submit(message);

            if (response.isJson) {
                return response.json();
            } else {
                throw new ErrorCode("Internal server error, please report bug at zupfe@velor.ca",
                    E_INTERNAL_ERROR);
            }

        } else {
            throw new ErrorCode("The browser session who initiated the login request was closed",
                E_SESSION_EXPIRED);
        }
    }
}