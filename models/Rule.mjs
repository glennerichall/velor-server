import {getDataAcl} from "../application/services/dataServices.mjs";
import {conformRule} from "./conform/conformRule.mjs";

export class Rule {
    #data;

    constructor(data) {
        this.#data = data;
    }

    get #isLoaded() {
        return this.id &&
            this.permission &&
            this.name &&
            this.method;
    }

    get id() {
        return this.#data.id;
    }

    get name() {
        return this.#data.name;
    }

    get resource() {
        return this.#data.resource;
    }

    get permission() {
        return this.#data.permission;
    }

    get method() {
        return this.#data.method;
    }

    get category() {
        return this.#data.category;
    }

    get description() {
        return this.#data.description;
    }

    async load() {
        if (!this.#isLoaded) {
            let rule;
            if (this.id) {
                rule = await getDataAcl(this).getAclRuleById(this.id);
            } else if (this.name) {
                rule = await getDataAcl(this).getAclRuleByName(this.name);
            }
            if (rule) {
                this.#data = conformRule(rule);
            }
        }
    }

    async save() {
        await this.load();
        if (!this.id) {
            this.#data = conformRule(await getDataAcl(this).insertAclRule(this));
            return true;
        }
        return false;
    }
}