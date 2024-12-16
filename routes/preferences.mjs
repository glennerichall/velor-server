import {
    getResourceBuilder
} from "../application/services/services.mjs";
import {getUser} from "../application/services/requestServices.mjs";
import {isLoggedIn} from "../guards/guardMiddleware.mjs";
import {URL_PREFERENCES} from "velor-contrib/contrib/urls.mjs";
import {getPreferenceDAO} from "velor-dbuser/application/services/services.mjs";


export function composePreferences(services, defaultPreferences = {}) {
    const configuration = {
        name: URL_PREFERENCES,
        daoProvider: getPreferenceDAO,

        getItemData: (body, req) => {
            let user = getUser(req);
            return {
                user,
                ...body
            };
        },

        itemQueryMapper: (req, name) => {
            let user = getUser(req);
            return {
                user,
                name
            };
        },

        itemResponseMapper: (preference, query) => {
            let defaultValues = defaultPreferences[query.name] ?? {};
            if (typeof preference.value === 'object') {
                return {
                    value: {
                        ...defaultValues,
                        ...preference.value,
                    },
                    name: preference.name,
                };
            } else {
                return {
                    value: preference.value ?? defaultValues,
                    name: preference.name,
                };
            }
        },

        guard: isLoggedIn
    };


    return getResourceBuilder(services, configuration)
        .all().done()
}