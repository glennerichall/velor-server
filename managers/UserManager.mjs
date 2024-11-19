import {composeInsertAuth} from "../profile/composeInsertAuth.mjs";
import {composeInsertUser} from "../profile/composeInsertUser.mjs";
import {
    getDataAuths,
    getDataUsers
} from "../application/services/dataServices.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {
    DATA_AUTHS,
    DATA_USER_AUTHS,
    DATA_USERS
} from "../application/services/serverDataKeys.mjs";

export class UserManager {
    #getOrInsertAuth;
    #getOrUpdateUser;

    initialize() {
        const {
            [DATA_AUTHS]: {
                queryByAuthIdProvider,
                insertAuth
            },
            [DATA_USERS]: {
                insertUser,
                grantUserRole
            },
            [DATA_USER_AUTHS]: {
                queryForUserByAuthId,
                queryForAuthsByUserId,
                insertOrNothing
            }
        } = getDatabase(this);

        this.#getOrInsertAuth = composeInsertAuth(
            queryByAuthIdProvider,
            insertAuth
        );

        this.#getOrUpdateUser = composeInsertUser(
            queryForUserByAuthId, queryForAuthsByUserId,
            insertUser, grantUserRole, insertOrNothing
        );
    }

    async updateUserFromAuthLogin(provider, profileOrAuthId) {
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
            loginAuth = await getDataAuths(this)
                .queryAuthById(user.primary_auth_id);
        }
        return loginAuth;
    }

    async grantUserRole(user, role) {
        const auth = await this.getLoginAuth(user);
        return getDataUsers(this).grantUserRoleByAuth(auth.auth_id, auth.provider, role);
    }

}