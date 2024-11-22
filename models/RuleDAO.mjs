import {
    getDataAcl,
    getDataApiKeys,
    getDataRoles,
    getDataUsers
} from "../application/services/dataServices.mjs";
import {conformRule} from "./conform/conformRule.mjs";
import {DAOPolicy,} from "./BaseDAO.mjs";
import {
    getApiKeyDAO,
    getRoleDAO,
    getUserDAO
} from "../application/services/serverServices.mjs";

const ruleSym = Symbol("rule");

export class RuleDAO extends DAOPolicy({
    conformVO: conformRule,
    symbol: ruleSym
}) {

    async selectOne(query) {
        let rule;
        if (query.id) {
            rule = await getDataAcl(this).getAclRuleById(query.id);
        } else if (query.name) {
            rule = await getDataAcl(this).getAclRuleByName(query.name);
        }
        return rule;
    }

    async getRuleName(rule) {
        if (rule?.name) {
            return rule.name;
        }
        rule = await this.loadOne(rule);
        return rule.name;
    }

    async selectMany(query) {
        let rules;
        if (query.id || query.name) {
            let rule = await this.selectOne(query);
            if (rule) {
                rules = [];
            } else {
                rules = [rule];
            }

        } else if (query.role) {
            let name = await getRoleDAO(this).getRoleName(query.role);
            let categories = query.categories;
            rules = await getDataRoles(this).getRoleAclRulesByName(name, ...categories);

        } else if (query.apiKey) {
            let apiKeyId = await getApiKeyDAO(this).loadId(query.apiKey);
            let categories = query.categories;
            rules = await getDataApiKeys(this).getApiKeyAclRulesById(apiKeyId, ...categories);

        } else if (query.user) {
            let userId = await getUserDAO(this).loadId(query.user);
            let categories = query.categories;
            rules = await getDataUsers(this).getUserAclRulesByUserId(userId, ...categories);

        } else {
            rules = await getDataAcl(this).getAllAclRules();
        }
        return rules;
    }

    async insertOne(data) {
        return await getDataAcl(this).insertAclRule(data);
    }
}