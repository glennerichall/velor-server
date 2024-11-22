import {
    composeMutablePolicy,
    DAOPolicy
} from "./BaseDAO.mjs";
import {conformPreference} from "./conform/conformPreference.mjs";
import {getDataPreferences} from "../application/services/dataServices.mjs";
import {getUserDAO} from "../application/services/serverServices.mjs";

const symbol = Symbol("Preferences");

export class PreferenceDAO extends DAOPolicy({
    symbol,
    ...composeMutablePolicy(symbol),
    conformVO: conformPreference
}) {

    async insertOne(data) {
        const {
            user,
            name,
            value
        } = data;
        const userId = await getUserDAO(this).loadId(user);
        return await getDataPreferences(this).upsertPreference(name, userId, value);
    }

    async selectOne(query) {
        let pref;
        if (query.id) {
            pref = await getDataPreferences(this).getPreferenceById(query.id);

        } else if (query.name && query.user) {
            let userId = await getUserDAO(this).loadId(query.user);
            pref = await getDataPreferences(this).getPreferenceById(query.name, userId);
        }
        return pref;
    }

    async selectMany(query) {
        let prefs;
        if(query.user) {
            let userId = await getUserDAO(this).loadId(query.user);
            prefs = await getDataPreferences(this).getPreferencesByUserId(userId);
        }
        return prefs;
    }
}