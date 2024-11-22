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

    selectOne(query) {
        super.selectOne(query);
    }

    selectMany(query) {
        super.selectMany(query);
    }

    insertMany(list) {
        super.insertMany(list);
    }
}