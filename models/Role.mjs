import {getDataRoles} from "../application/services/dataServices.mjs";
import {conformRole} from "./conform/conformRole.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {RuleDAO} from "./RuleDAO.mjs";

export class Role {
    #data;

    #aclRules;

    constructor(data) {
        this.#data = {...data};
    }

    get #isLoaded() {
        return this.id &&
            this.name;
    }

    get id() {
        return this.#data.id;
    }

    get name() {
        return this.#data.name;
    }

    get description() {
        return this.#data.description;
    }

    async loadName() {
        if (!this.name) {
            await this.load();
        }
    }

    async load() {
        if (!this.#isLoaded) {
            let role;
            if (this.id) {
                role = await getDataRoles(this).getRoleById(this.id);
            } else if (this.name) {
                role = await getDataRoles(this).getRoleByName(this.name);
            }
            if (role) {
                this.#data = conformRole(role);
            }
        }
    }

    async getAclRules(...categories) {
        await this.loadName();
        if (!this.#aclRules) {
            let rules = await getDataRoles(this).getRoleAclRulesByName(this.name, ...categories);
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
            this.#data = conformRole(await getDataRoles(this).createRole(this.name, this.description));
            return true;
        }
        return false;
    }
}