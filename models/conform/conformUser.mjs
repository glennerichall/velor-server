import {conformAuth} from "./conformAuth.mjs";

export function conformUser(user) {
    if (!user) return null;
    let conformed = conformAuth(user);
    return {
        ...conformed,
        primaryAuthId: user.primaryAuthId ?? user.primary_auth_id ?? user.primaryauthid,
    };
}