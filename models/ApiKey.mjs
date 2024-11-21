import {getDataApiKeys} from "../application/services/dataServices.mjs";
import {conformApiKey} from "./conform/conformApiKey.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {RuleDAO} from "./RuleDAO.mjs";

export class ApiKey {
    #data;
    #query;

    #aclRules;

    constructor(query) {
        this.#query = query;
        this.#data = {};
    }

    get #isLoaded() {
        return this.id && this.value && this.publicId;
    }

    get id() {
        return this.#data.id;
    }

    get value() {
        return this.#data.value;
    }

    get creation() {
        return this.#data.creation;
    }

    get name() {
        return this.#data.name;
    }

    get publicId() {
        return this.#data.publicId;
    }

    get lastUsed() {
        return this.#data.lastUsed;
    }

    get privateId() {
        return this.#data.privateId;
    }

    async load() {
        if (!this.#isLoaded) {
                let query = this.#query;
            let apiKey;
            if (query.publicId) {
                apiKey = await getDataApiKeys(this).getApiKeyByPublicId(query.publicId);

            } else if (query.value) {
                apiKey = await getDataApiKeys(this).getApiKeyByValue(query.value);

            } else if (query.id) {
                apiKey = await getDataApiKeys(this).getApiKeyById(query.id);
            }

            if (apiKey) {
                this.#data = conformApiKey(apiKey);
            }
        }
    }

    async getAclRules(...categories) {
        await this.load();
        if (!this.#aclRules) {
            let rules = await getDataApiKeys(this).getApiKeyAclRulesById(this.id, ...categories);
            this.#aclRules = [];
            for (let rule of rules) {
                this.#aclRules.push(
                    getServiceBinder(this).createInstance(RuleDAO, rule)
                );
            }
        }
        return this.#aclRules;
    }

    async save() {
        await this.load();
        if (!this.id) {
            this.#data = conformApiKey(await getDataApiKeys(this).createApiKey(this.name));
            return true;
        }
        return false;
    }
}