import {getTableNames} from "../installation/defaultTableNames.mjs";

export function getAuthsSql(schema, tableNames = {}) {
    const {
        auths
    } = getTableNames(tableNames);

    const getAuthByIdSql = `
        select auth_id     as profile_id,
               provider,
               email,
               verified,
               displayname as display_name,
               lastname    as last_name,
               firstname   as first_name,
               avatar,
               id
        from ${schema}.${auths}
        where id = $1
    `;

    const getAuthByProviderSql = `
        select auth_id     as profile_id,
               provider,
               email,
               verified,
               displayname as display_name,
               lastname    as last_name,
               firstname   as first_name,
               avatar,
               id
        from ${schema}.${auths}
        where auth_id = $1
          and provider = $2
    `;

    const insertAuthSql = `
        insert into ${schema}.${auths}
        (auth_id, provider, email, verified,
         displayName, lastName, firstName, avatar)
        values ($1, $2, $3, $4, $5, $6, $7, $8) returning *
    `;

    const setUserVerifiedEmailSql = `
        update ${schema}.${auths}
        set verified = true
        where id = $1
    `;

    const getAllAuthsSql = `
        select *
        from ${schema}.${auths}
    `;

    return {
        getAuthByIdSql,
        getAuthByProviderSql,
        insertAuthSql,
        setUserVerifiedEmailSql,
        getAllAuthsSql
    };
}

export function composeAuthsDataAccess(schema, tableNames = {}) {
    
    const {
        getAuthByIdSql,
        getAuthByProviderSql,
        insertAuthSql,
        setUserVerifiedEmailSql,
        getAllAuthsSql
    } = getAuthsSql(schema, tableNames);

    async function getAuthById(client, authId) {
        const res = await client.query(getAuthByIdSql, [authId]);
        return res.rows.length === 1 ? res.rows[0] : null;
    }

    async function getAuthByProvider(client, providerAuthId, provider) {
        const res = await client.query(getAuthByProviderSql, [providerAuthId, provider]);
        return res.rows.length === 1 ? res.rows[0] : null;
    }

    async function insertAuth(client, {
        profileId,
        provider,
        email,
        verified,
        displayName,
        lastName,
        firstName,
        avatar
    }) {
        const res = await client.query(insertAuthSql, [
            profileId,
            provider,
            email,
            verified,
            displayName,
            lastName,
            firstName,
            avatar
        ]);
        return res.rows[0];
    }

    async function setUserVerifiedEmail(client, authId) {
        const res = await client.query(setUserVerifiedEmailSql, [authId]);
        return res.rows.length === 1 ? res.rows[0] : null;
    }

    async function getAllAuths(client) {
        const res = await client.query(getAllAuthsSql);
        return res.rows;
    }

    return {
        getAuthById,
        getAuthByProvider,
        insertAuth,
        setUserVerifiedEmail,
        getAllAuths
    };
}