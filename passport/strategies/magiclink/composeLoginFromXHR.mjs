import {getClientProvider} from "../../../application/services/backendServices.mjs";
import {forSessionId} from "../../../distribution/matchingRules.mjs";

export function composeLoginFromXHR(services) {
    const clientProvider = getClientProvider(services);

    return async ws => {

        const channel = forSessionId(ws);

        let count = await clientProvider.getSubscriptionCount(channel);

        if (count >= 1) {
            const client = await clientProvider.getClient(channel);
            let message = getMessageFactory(req).requireLogin(req.fullOriginalUrl);
            let response = await client.submit(message);

            if (response.isJson) {
                return response.json();
            } else {
                throw new Error("Internal server error, please report bug at zupfe@velor.ca");
            }

        } else {
            throw new Error("The browser session who initiated the login request was closed");
        }
    }
}