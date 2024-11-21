import {getDataAuths} from "../application/services/dataServices.mjs";
import {conformAuth} from "./conform/conformAuth.mjs";
import {saveInitialState} from "velor-utils/utils/objects.mjs";

const authSym = Symbol("auth");

export function isAuth(auth) {
    return auth && auth[authSym];
}

function makeAuth(auth) {
    auth[authSym] = true;
    return saveInitialState(auth);
}

export class AuthDAO {

    async load(query) {
        if (isAuth(query)) {
            return query;
        }

        let auth;
        if (query.id) {
            auth = await getDataAuths(this).getAuthById(query.id);
        } else if (query.profileId && query.provider) {
            auth = await getDataAuths(this).getAuthByProvider(
                query.profileId,
                query.provider);
        }
        if (auth) {
            auth = conformAuth(auth);
            auth = makeAuth(auth);
        }

        return auth;
    }

    async markAsConfirmed(auth) {
        auth = await this.load(auth);
        if (!isAuth(auth)) return false;
        await getDataAuths(this).setUserVerifiedEmail(auth.id);
        auth.verified = true;
        return auth;
    }

    async canSave(profile) {
        let auth = await this.load(profile);
        return !isAuth(auth);
    }

    async save(profile) {
        let auth = profile;
        if (await this.canSave(auth)) {
            auth = await getDataAuths(this).insertAuth(auth);
            auth = conformAuth(auth);
            auth = makeAuth(auth);
        }
        return auth;
    }
}