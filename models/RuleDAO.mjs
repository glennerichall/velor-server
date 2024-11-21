import {getDataAcl} from "../application/services/dataServices.mjs";
import {conformRule} from "./conform/conformRule.mjs";
import {
    isPristine,
    saveInitialState
} from "velor-utils/utils/objects.mjs";

const ruleSym = Symbol("rule");

export function isRule(rule) {
    return rule && rule[ruleSym];
}

function makeRule(rule) {
    rule[ruleSym] = true;
    Object.defineProperty(rule, 'id', {
        configurable: false,
        writable: false,
    });

    rule = saveInitialState(rule);
    return rule;
}


export class RuleDAO {
    async load(query) {
        if (isRule(query)) return query;

        let rule;
        if (query.id) {
            rule = await getDataAcl(this).getAclRuleById(query.id);
        } else if (query.name) {
            rule = await getDataAcl(this).getAclRuleByName(query.name);
        }
        if (rule) {
            rule = conformRule(rule);
            rule = makeRule(rule);
        }

        return rule;
    }

    async canSave(data) {
        let rule = await this.load(data);
        return !isRule(rule) || !isPristine(rule);
    }

    async save(data) {
        let rule = data;
        if (await this.canSave(rule)) {
            rule = await getDataAcl(this).insertAclRule(rule);
            rule = conformRule(rule);
            rule = makeRule(rule);
        }
        return rule;
    }
}