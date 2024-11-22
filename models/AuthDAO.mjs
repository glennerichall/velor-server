import {getDataAuths} from "../application/services/dataServices.mjs";
import {conformAuth} from "./conform/conformAuth.mjs";
import {DAOPolicy} from "./BaseDAO.mjs";

const authSym = Symbol("auth");

export class AuthDAO extends DAOPolicy({
    symbol: authSym,
    conformVO: conformAuth
}) {

    async selectOne(query) {
        let auth;
        if (query.id) {
            auth = await getDataAuths(this).getAuthById(query.id);
        } else if (query.profileId && query.provider) {
            auth = await getDataAuths(this).getAuthByProvider(
                query.profileId,
                query.provider);
        }
        return auth;
    }

    async markAsConfirmed(auth) {
        auth = await this.loadOne(auth);
        if (!this.isVO(auth)) return false;
        await getDataAuths(this).setUserVerifiedEmail(auth.id);
        auth = {
            ...auth,
            verified: true,
        };
        return this.makeVO(auth);
    }

    async insertOne(profile) {
        return getDataAuths(this).insertAuth(profile);
    }
}