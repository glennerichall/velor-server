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
        let {
            user,
            name,
            value
        } = data;
        const userId = await getUserDAO(this).loadId(user);
        if (typeof value !== "object") {
            value = {value};
        }
        return await getDataPreferences(this).upsertPreference(userId, name, value);
    }

    async selectOne(query) {
        let pref;
        if (query.id) {
            pref = await getDataPreferences(this).getPreferenceById(query.id);

        } else if (query.name && query.user) {
            let userId = await getUserDAO(this).loadId(query.user);
            pref = await getDataPreferences(this).getPreferenceByName(userId, query.name);
        }
        return pref;
    }

    async selectMany(query) {
        let prefs;
        if (query.user) {
            let userId = await getUserDAO(this).loadId(query.user);
            prefs = await getDataPreferences(this).getPreferencesByUserId(userId);
        }
        return prefs;
    }

    async delete(query) {
        let pref;
        if (query.id) {
            pref = await getDataPreferences(this).deletePreferenceById(query.id);
        } else if (query.user && query.name) {
            let userId = await getUserDAO(this).loadId(query.user);
            pref = await getDataPreferences(this).deletePreferenceByName(userId, query.name);
        }

        return pref;
    }
}