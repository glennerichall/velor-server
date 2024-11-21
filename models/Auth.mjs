import {getDataAuths} from "../application/services/dataServices.mjs";
import {conformAuth} from "./conform/conformAuth.mjs";

export class Auth {
    #data;

    constructor(data) {
        this.#data = {...data};
    }

    get id() {
        return this.#data.id;
    }

    get profileId() {
        return this.#data.profileId;
    }

    get provider() {
        return this.#data.provider;
    }

    get email() {
        return this.#data.email;
    }

    get verified() {
        return this.#data.verified;
    }

    get displayName() {
        return this.#data.displayName;
    }

    get lastName() {
        return this.#data.lastName;
    }

    get firstName() {
        return this.#data.firstName;
    }

    get avatar() {
        return this.#data.avatar;
    }

    async load() {
        let query = this.#data;
        let auth;
        if (query.id) {
            auth = await getDataAuths(this).getAuthById(query.id);
        } else {
            auth = await getDataAuths(this).getAuthByProvider(
                query.profileId,
                query.provider);
        }
        if (auth) {
            this.#data = conformAuth(auth);
        }
    }

    async markAsConfirmed() {
        await this.load();
        await getDataAuths(this).setUserVerifiedEmail(this.id);
        this.#data.verified = true;
    }

    async save() {
        await this.load();
        if (!this.#data.id) {
            this.#data.id = await getDataAuths(this).insertAuth(this.#data);
            return true;
        }
        return false;
    }
}