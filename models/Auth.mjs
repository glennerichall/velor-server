import {getDataAuths} from "../application/services/dataServices.mjs";

export function conformAuth(auth) {
    return {
        id: auth.id,
        provider: auth.provider,
        verified: auth.verified,
        firstName: auth.firstname ?? auth.first_name ?? auth.firstName,
        lastName: auth.lastname ?? auth.last_name ?? auth.lastName,
        avatar: auth.avatar,
        profileId: auth.profileId ?? auth.auth_id,
        email: auth.email,
        displayName: auth.displayName ?? auth.display_name ?? auth.displayname
    }
}

export class Auth {
    #id;
    #profileId;
    #provider;
    #email;
    #verified;
    #displayName;
    #avatar;
    #firstName;
    #lastName;

    copy(auth) {
        auth = conformAuth(auth);
        this.#id = auth.id;
        this.#provider = auth.provider;
        this.#verified = auth.verified;
        this.#firstName = auth.firstName;
        this.#lastName = auth.lastName;
        this.#avatar = auth.avatar;
        this.#profileId = auth.profileId;
        this.#email = auth.email;
        this.#displayName = auth.displayName;
    }

    get id() {
        return this.#id;
    }

    get profileId() {
        return this.#profileId;
    }

    get provider() {
        return this.#provider;
    }

    get email() {
        return this.#email;
    }

    get verified() {
        return this.#verified;
    }

    get displayName() {
        return this.#displayName;
    }

    get avatar() {
        return this.#avatar;
    }

    get firstName() {
        return this.#firstName;
    }

    get lastName() {
        return this.#lastName;
    }

    async load(query) {
        if (!query) {
            query = this;
        }
        let auth;
        if (query.id) {
            auth = await getDataAuths(this).getAuthById(query.id);
        } else {
            auth = await getDataAuths(this).getAuthByProvider(
                query.profileId,
                query.provider);
        }
        if (auth) {
            this.copy(auth);
        }
    }

    async confirmEmail() {
        await getDataAuths(this).setUserVerifiedEmail(this.#id);
        this.#verified = true;
    }

    async save() {
        await this.load();
        if (!this.#id) {
            this.#id = await getDataAuths(this).insertAuth(this);
            return true;
        }
        return false;
    }
}