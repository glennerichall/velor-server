import {getDataUsers} from "../application/services/dataServices.mjs";
import {DAOPolicy} from "./BaseDAO.mjs";
import {
    getApiKeyDAO,
    getAuthDAO,
    getRoleDAO,
    getRuleDAO
} from "../application/services/serverServices.mjs";
import {conformUser} from "./conform/conformUser.mjs";

const userSym = Symbol("user");

export class UserDAO extends DAOPolicy({
    symbol: userSym,
    conformVO: conformUser
}) {

    async selectOne(query) {
        let auth;

        if (getAuthDAO(this).isVO(query)) {
            query = {
                authId: query.id
            }
        }

        if (query.id) {
            auth = await getDataUsers(this).getPrimaryAuthByUserId(query.id);

        } else if (query.authId) {
            auth = await getDataUsers(this).getPrimaryAuthByAuthId(query.authId);

        } else if (query.profileId && query.provider) {
            auth = await getDataUsers(this).getPrimaryAuthByProfile(
                query.profileId,
                query.provider);

        }
        return auth;
    }

    async grantRole(user, role) {
        let userId = await this.loadId(user);
        let roleName = await getRoleDAO(this).getRoleName(role);
        await getDataUsers(this).grantUserRoleByUserId(userId, roleName);
    }

    async revokeRole(user, role) {
        let userId = await this.loadId(user);
        let roleName = await getRoleDAO(this).getRoleName(role);
        await getDataUsers(this).revokeUserRoleByUserId(userId, roleName);
    }

    async insertOne(data) {
        if (data.authId) {
            data.id = data.authId;
        }
        let authId = await getAuthDAO(this).loadId(data);
        let user = await getDataUsers(this).insertUser(authId);
        user = await this.loadOne(user);
        await this.grantRole(user, {name: "normal"});
        return user;
    }

    async getApiKeys(user) {
        return await getApiKeyDAO(this).loadMany({user});
    }

    async getAclRules(user, ...categories) {
        return await getRuleDAO(this).loadMany({user, categories});
    }

    async getRoles(user) {
        return getRoleDAO(this).loadMany({user});
    }
}