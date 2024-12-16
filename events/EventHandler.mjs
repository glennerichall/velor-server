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
import {getMessageFactory} from "../application/services/services.mjs";
import {getLogger} from "velor-services/application/services/services.mjs";
import {getClientProvider} from "velor-distribution/application/services/services.mjs";
import {getChannelForUserId} from "../distribution/channels.mjs";


export class EventHandler {

    #getClientForUserId(userId) {
        return getClientProvider(this).getClient(
            getChannelForUserId(userId)
        );
    }

    #handlePreference(preference) {
        let factory = getMessageFactory(this);
        let {
            userId,
            name
        } = preference;
        let message = factory.preferencesChanged(name);
        let client = this.#getClientForUserId(userId);
        return {
            client,
            message
        };
    }

    #handleApiKey(eventName, apiKey) {
        let factory = getMessageFactory(this);
        let client, message;
        let {
            userId,
        } = apiKey;
        if (eventName === ELEMENT_CREATED) {
            message = factory.apiKeyCreated({});
        } else {
            message = factory.apiKeyDeleted({});
        }
        client = this.#getClientForUserId(userId);
        return {
            client,
            message
        };
    }

    #handleDatabaseEvent(eventName, dao, element) {
        let client, message;
        if (dao === PREFERENCE) {
            ({client, message} = this.#handlePreference(element));
        } else if (dao === API_KEY) {
            ({client, message} = this.#handleApiKey(eventName, element));
        }
        return {
            client,
            message
        };
    }

    #handleLoginEvent(eventName, user) {
        let factory = getMessageFactory(this);
        let message, client;

        switch (eventName) {
            case EVENT_USER_LOGIN:
                message = factory.loggedIn();
                client = this.#getClientForUserId(user.id);
                break;

            case EVENT_USER_LOGOUT:
                message = factory.loggedOut();
                client = this.#getClientForUserId(user.id);
                break;
        }
        return {
            client,
            message
        };
    }

    async handleEvent(eventName, ...args) {
        let client;
        let message;

        switch (eventName) {
            case ELEMENT_CREATED:
            case ELEMENT_DELETED:
                ({client, message} = this.#handleDatabaseEvent(eventName, ...args));
                break;

            case EVENT_USER_LOGIN:
            case EVENT_USER_LOGOUT:
                ({client, message} = this.#handleLoginEvent(eventName, ...args));
                break;
        }

        if (message && client) {
            try {
                await client.send(message);
            } catch (e) {
                getLogger(this).error('Failed to send message to client ' + e.message);
            }
        }
    }
}