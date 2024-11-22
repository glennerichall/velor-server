import {getTableNames} from "../sql/defaultTableNames.mjs";

export function getAuthTokensSql(schema, tableNames = {}) {
    const {
        authTokens
    } = getTableNames(tableNames);

    const createTokenSql = `
        insert into ${schema}.${authTokens} (auth_id, expiration, value)
        values ($1, $2, $3)
    `;

    const queryTokensForAuthSql = `
        select *
        from ${schema}.${authTokens}
        where auth_id = $1
    `;

    const deleteTokenSql = `
        delete
        from ${schema}.${authTokens}
        where id = $1
    `;

    const deleteTokensForUserSql = `
        delete
        from ${schema}.${authTokens}
        where auth_id = $1
    `;

    return {
        createTokenSql,
        queryTokensForAuthSql,
        deleteTokenSql,
        deleteTokensForUserSql
    };

}

export function composeAuthTokensDataAccess(schema, tableNames = {}) {
    const {
        createTokenSql,
        queryTokensForAuthSql,
        deleteTokenSql,
        deleteTokensForUserSql
    } = getAuthTokensSql(schema, tableNames);

    async function createToken(client, authId, token) {
        const res = await client.query(createTokenSql, [authId, token.expiration, token.value]);
        return res.rowCount;
    }

    async function queryTokensForAuth(client, authId) {
        const res = await client.query(queryTokensForAuthSql, [authId]);
        return res.rows;
    }

    async function deleteToken(client, tokenId) {
        const res = await client.query(deleteTokenSql, [tokenId]);
        return res.rowCount;
    }

    async function deleteTokensForUser(client, authId) {
        const res = await client.query(deleteTokensForUserSql, [authId]);
        return res.rowCount;
    }

    return {
        createToken,
        queryTokensForAuth,
        deleteToken,
        deleteTokensForUser
    };

}