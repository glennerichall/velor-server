import {getTableNames} from "../installation/defaultTableNames.mjs";

export function getPreferencesSql(schema, tableNames = {}) {
    const {
        preferences
    } = getTableNames(tableNames);

    const deletePreferenceByNameSql = `
        delete
        from ${schema}.${preferences}
        where user_id = $1
          and name = $2
    `;

    const getPreferenceByNameSql = `
        select *
        from ${schema}.${preferences}
        where user_id = $1
          and name = $2
    `;

    const getPreferencesByUserIdSql = `
        select *
        from ${schema}.${preferences}
        where user_id = $1
    `;

    const getPreferenceByIdSql = `
        select *
        from ${schema}.${preferences}
        where id = $1
    `;

    const upsertPreferenceSql = `
        insert
        into ${schema}.${preferences} (name, user_id, value)
        values ($1, $2, $3) on conflict ("name", "user_id") do
        update
            set value = $3
            returning *
    `;


    return {
        deletePreferenceByNameSql,
        getPreferenceByNameSql,
        getPreferencesByUserIdSql,
        getPreferenceByIdSql,
        upsertPreferenceSql
    };

}

export function composePreferencesDataAccess(schema, tableNames = {}) {

    const {
        deletePreferenceByNameSql,
        getPreferenceByNameSql,
        getPreferencesByUserIdSql,
        getPreferenceByIdSql,
        upsertPreferenceSql
    } = getPreferencesSql(schema, tableNames);

    async function deletePreferenceByName(client, name, userId) {
        const res = await client.query(deletePreferenceByNameSql, [userId, name]);
        return res.rowCount;
    }

    async function getPreferenceByName(client, name, userId) {
        const res = await client.query(getPreferenceByNameSql, [userId, name]);
        return res.rows.length === 1 ? res.rows[0] : null;
    }

    async function getPreferencesByUserId(client, userId) {
        const res = await client.query(getPreferencesByUserIdSql, [userId]);
        return res.rows;
    }

    async function getPreferenceById(client, prefId) {
        const res = await client.query(getPreferenceByIdSql, [prefId]);
        return res.rows.length === 1 ? res.rows[0] : null;
    }

    async function upsertPreference(client, name, userId, value) {
        const res = await client.query(upsertPreferenceSql, [name, userId, value]);
        return res.rows.length === 1 ? res.rows[0] : null;
    }


    return {
        deletePreferenceByName,
        getPreferenceByName,
        getPreferencesByUserId,
        getPreferenceById,
        upsertPreference
    };
}