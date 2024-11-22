export async function getAuthById(client, schema, authId) {
    const res = await client
        .query(`select auth_id     as profile_id,
                       provider,
                       email,
                       verified,
                       displayname as display_name,
                       lastname    as last_name,
                       firstname   as first_name,
                       avatar,
                       id
                from ${schema}.auths
                where id = $1`,
            [authId]);
    if (res.rows.length === 1) {
        return res.rows[0];
    }
    return null;
}

export async function getAuthByProvider(client, schema, providerAuthId, provider) {
    const res = await client
        .query(`select auth_id     as profile_id,
                       provider,
                       email,
                       verified,
                       displayname as display_name,
                       lastname    as last_name,
                       firstname   as first_name,
                       avatar,
                       id
                from ${schema}.auths
                where auth_id = $1
                  and provider = $2`,
            [providerAuthId, provider]);
    if (res.rows.length === 1) {
        return res.rows[0];
    }
    return null;
}

export async function insertAuth(client, schema, {
    profileId,
    provider,
    email,
    verified,
    displayName,
    lastName,
    firstName,
    avatar
}) {
    const res = await client
        .query(`insert into ${schema}.auths
                (auth_id, provider, email, verified,
                 displayName, lastName, firstName, avatar)
                values ($1, $2, $3, $4, $5, $6, $7, $8) returning *`,
            [
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

export async function setUserVerifiedEmail(client, schema, authId) {
    const res = await client
        .query(`update ${schema}.auths
                set verified = true
                where id = $1`, [authId]);
    if (res.rows.length === 1) {
        return res.rows[0];
    }
}

export async function getAllAuths(client, schema) {
    const res = await client
        .query(`select * from ${schema}.auths`);
    return res.rows;
}