import {composeInsertAuth} from "../profile/composeInsertAuth.mjs";
import {getDatabase} from "../application/services/backendServices.mjs";
import {composeInsertUser} from "../profile/composeInsertUser.mjs";

export class UserManager {
    #getOrInsertAuth;
    #getOrUpdateUser;

    initialize() {
        const {
            auths: {
                queryByAuthIdProvider,
                insertAuth
            },
            users: {
                insertUser,
                grantUserRole
            },
            userAuths: {
                queryForUserByAuthId,
                queryForAuthsByUserId,
                insertOrNothing
            }
        } = getDatabase(this).auths;


        this.#getOrInsertAuth = composeInsertAuth(
            queryByAuthIdProvider,
            insertAuth
        );

        this.#getOrUpdateUser = composeInsertUser(
            queryForUserByAuthId, queryForAuthsByUserId,
            insertUser, grantUserRole, insertOrNothing
        );
    }

    async updateUserFromAuthLogin(user, provider, profileOrAuthId) {
        let profile;
        if (typeof profileOrAuthId === 'string') {
            profile = {
                id: profileOrAuthId
            };
        } else {
            profile = profileOrAuthId;
        }
        let auth = await this.#getOrInsertAuth(provider, profile);
        return await this.#getOrUpdateUser(auth);
    }

    async getLoginAuth(user) {
        let loginAuth = user.loginAuth;
        if (!loginAuth) {
            loginAuth = await getDatabase(this).auths
                .queryAuthById(user.primary_auth_id);
        }
        return loginAuth;
    }

    async grantUserRole(user, role) {
        const auth = await this.getLoginAuth(user);
        return getDatabase(this).users.grantUserRoleByAuth(auth.auth_id, auth.provider, role);
    }

}