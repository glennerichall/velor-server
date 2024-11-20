import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {Auth} from "./Auth.mjs";
import {
    getDataUsers
} from "../application/services/dataServices.mjs";

class User {
    #id;
    #query;

    #aclRules;
    #roles;
    #apiKeys;
    #primaryAuth;
    #auths;

    constructor(userIdOrProfile) {
        if (typeof userIdOrProfile === "object") {
            this.#query = {
                profileId: userIdOrProfile.profileId,
                provider: userIdOrProfile.provider,
                authId: userIdOrProfile.authId,
            };
        } else if (typeof userIdOrProfile === "number") {
            this.#id = userIdOrProfile;
        } else {
            throw new Error('Provide the user id or the profileId and profile provider');
        }
    }

    async loadAll() {
        await Promise.all([
            this.loadPrimaryAuth(),
            this.getAclRules()
        ]);
    }

    async save() {

    }

    get id() {
        return this.#id;
    }

    async getAclRules(...categories) {
        if (!this.#aclRules) {

        }
        return this.#aclRules;
    }

    get primaryAuth() {
        if (!this.#primaryAuth) {
            this.#primaryAuth = getServiceBinder(this).createInstance(Auth);
        }

    }

    async loadPrimaryAuth() {
        if (!this.#primaryAuth) {
            this.#primaryAuth = getServiceBinder(this).createInstance(Auth);
            let auth;
            let data = getDataUsers(this);
            if (this.#id) {
                auth = await data.getPrimaryAuthByUserId(this.#id);
            } else {
                if (this.#query.authId) {
                    auth = data.getPrimaryAuthByAuthId(this.#query.authId);
                } else {
                    auth = await data.getPrimaryAuthByProfile(
                        this.#query.profileId,
                        this.#query.provider);
                }
                this.#id = auth.userId;
            }
            this.#primaryAuth.copy(auth);
        }
        return this.#primaryAuth;
    }

    get roles() {
        return this.#roles;
    }
}