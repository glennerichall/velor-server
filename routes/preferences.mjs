import {getPreferenceDAO} from "../application/services/serverServices.mjs";
import {getUser} from "../application/services/requestServices.mjs";


export function composePreferences(services) {
    return getResourceBuilder(services)
        .for(getPreferenceDAO, URL_PREFERENCES)
        .guard(isLoggedIn)
        .before(req => {
            let user = getUser(req);

        })
        .create()
        .delete()
        .getMany()
        .getOne()
        .done()
}