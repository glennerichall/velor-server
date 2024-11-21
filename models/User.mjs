import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {getDataUsers} from "../application/services/dataServices.mjs";
import {Auth} from "./Auth.mjs";
import {Rule} from "./Rule.mjs";
import {Role} from "./Role.mjs";
import {ApiKey} from "./ApiKey.mjs";
import {conformAuth} from "./conform/conformAuth.mjs";

export class User {
    #query;

    #id;
    #aclRules;
    #roles;
    #apiKeys;
    #primaryAuth;

    constructor(query) {
        this.#query = query;
    }

    get id() {
        return this.#id;
    }

    async loadPrimaryAuth() {
        let auth;
        let query = this.#query;
        let dataUsers = getDataUsers(this);

        if (query.id) {
            auth = await dataUsers.getPrimaryAuthByUserId(query.id);

        } else if (query.authId) {
            auth = await dataUsers.getPrimaryAuthByAuthId(query.authId);

        } else if (query.profileId && query.provider) {
            auth = await dataUsers.getPrimaryAuthByProfile(
                query.profileId,
                query.provider);

        } else if (query.auth instanceof Auth) {
            this.#primaryAuth = query.auth;
        }

        if (auth) {
            auth = conformAuth(auth);
            this.#primaryAuth = getServiceBinder(this).createInstance(Auth, auth);
            return auth.userId;
        }

        return undefined;
    }

    async loadUserId() {
        if (!this.#id) {
            if (this.#query.id) {
                this.#id = this.#query.id;

            } else if (this.#query.authId || this.#query.profileId && this.#query.provider) {
                this.#id = await this.loadPrimaryAuth();

            } else if (this.#query.apiKey) {
                this.#id = await getDataUsers(this).getUserIdByApiKey(this.#query.apiKey);
            }
        }
    }

    async loadAll() {
        await this.getPrimaryAuth(); // preload userId needed for other requests
        await Promise.all([
            this.getAclRules(),
            this.getRoles(),
            this.getApiKeys()
        ]);
    }

    async grantRole(role) {
        await this.loadUserId();
        await getDataUsers(this).grantUserRoleByUserId(this.#id, role);
        this.#roles = null;
    }

    async revokeRole(role) {
        await this.loadUserId();
        await getDataUsers(this).revokeUserRoleByUserId(this.#id, role);
        this.#roles = null;
    }

    async save() {
        await this.loadUserId();
        if (!this.#id) {
            await this.loadPrimaryAuth();
            if (this.#primaryAuth) {
                const user = await getDataUsers(this).insertUser(this.#primaryAuth.id);
                this.#id = user.id;
                await this.grantRole("normal");
                return true;
            }
        }
        return false;
    }

    async getApiKeys() {
        await this.loadUserId();

        if (!this.#apiKeys) {
            let apiKeys = await getDataUsers(this).getUserApiKeysByUserId(this.#id);
            this.#apiKeys = [];
            for (let apiKey of apiKeys) {
                this.#apiKeys.push(
                    getServiceBinder(this).createInstance(ApiKey, apiKey)
                );
            }
        }
        return this.#apiKeys;
    }

    async getAclRules(...categories) {
        await this.loadUserId();

        if (!this.#aclRules) {
            let rules = await getDataUsers(this).getUserAclRulesByUserId(this.#id, ...categories);
            this.#aclRules = [];
            for (let rule of rules) {
                this.#aclRules.push(
                    getServiceBinder(this).createInstance(Rule, rule)
                );
            }
        }
        return this.#aclRules;
    }

    async getRoles() {
        await this.loadUserId();

        if (!this.#roles) {
            await this.loadUserId();
            let roles = await getDataUsers(this).getUserRolesByUserId(this.#id);
            this.#roles = [];
            for (let role of roles) {
                this.#roles.push(
                    getServiceBinder(this).createInstance(Role, role)
                );
            }
        }
        return this.#roles;
    }

    async getPrimaryAuth() {
        // first we try to find the user id
        // when finding the id we have these possibilities in query
        // 1 - id is provided
        // 2 - primary auth is provided
        // 3 - api key is provided

        // if the primary auth is provided, the #primaryAuth will be populated
        // if id or api key is provided, id will be available but not #primaryAuth
        await this.loadUserId();

        if (!this.#primaryAuth) {
            // id is available,
            this.#query.id = this.#id;
            await this.loadPrimaryAuth();
        }
        return this.#primaryAuth;
    }
}