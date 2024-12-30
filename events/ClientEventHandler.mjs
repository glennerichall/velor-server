import {getClientProvider} from "velor-distribution/application/services/services.mjs";
import {getChannelForUserId} from "../distribution/channels.mjs";
import {getMessageFactory} from "../application/services/services.mjs";
import {
    ELEMENT_CREATED,
    ELEMENT_DELETED
} from "velor-dbuser/models/events.mjs";
import {
    API_KEY,
    PREFERENCE
} from "velor-dbuser/models/names.mjs";
import {
    EVENT_USER_LOGIN,
    EVENT_USER_LOGOUT
} from "../application/services/eventKeys.mjs";
import {getLogger} from "velor-services/application/services/services.mjs";

export class ClientEventHandler {
    #getClientForUserId(userId) {
        return getClientProvider(this).getClient(
            getChannelForUserId(userId)
        );
    }

    #handlePreference(preference) {
        let factory = getMessageFactory(this);
        let {
            userId,
        } = preference;
        let message = factory.preferencesChanged(preference);
        return {
            userId,
            message
        };
    }

    #handleApiKey(eventName, apiKey) {
        let factory = getMessageFactory(this);
        let message;
        let {
            userId,
        } = apiKey;
        if (eventName === ELEMENT_CREATED) {
            message = factory.apiKeyCreated(apiKey);
        } else {
            message = factory.apiKeyDeleted(apiKey);
        }
        return {
            userId,
            message
        };
    }

    #handleDatabaseEvent(eventName, dao, element) {
        let userId, message;
        if (dao === PREFERENCE) {
            ({userId, message} = this.#handlePreference(element));
        } else if (dao === API_KEY) {
            ({userId, message} = this.#handleApiKey(eventName, element));
        }
        return {
            userId,
            message
        };
    }

    #handleLoginEvent(eventName, user) {
        let factory = getMessageFactory(this);
        let message, userId;

        userId = user.id;

        switch (eventName) {
            case EVENT_USER_LOGIN:
                message = factory.loggedIn();
                break;

            case EVENT_USER_LOGOUT:
                message = factory.loggedOut();
                break;
        }
        return {
            userId,
            message
        };
    }

    async handleEvent(eventName, ...args) {
        let userId;
        let message;

        switch (eventName) {
            case ELEMENT_CREATED:
            case ELEMENT_DELETED:
                ({userId, message} = this.#handleDatabaseEvent(eventName, ...args));
                break;

            case EVENT_USER_LOGIN:
            case EVENT_USER_LOGOUT:
                ({userId, message} = this.#handleLoginEvent(eventName, ...args));
                break;
        }

        let client = this.#getClientForUserId(userId);
        if (message && client) {
            try {
                await client.send(message);
            } catch (e) {
                getLogger(this).error('Failed to send message to client ' + e.message);
            }
        }
    }
}