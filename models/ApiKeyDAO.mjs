import {
    getDataApiKeys,
    getDataUsers
} from "../application/services/dataServices.mjs";
import {conformApiKey} from "./conform/conformApiKey.mjs";
import {DAOPolicy} from "./BaseDAO.mjs";
import {
    getApiKeyDAO,
    getRuleDAO,
    getUserDAO
} from "../application/services/serverServices.mjs";
import {services} from "../tests/fixtures/services.mjs";
import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";

const apiKeySymbol = Symbol("ApiKey");

export class ApiKeyDAO extends DAOPolicy({
    symbol: apiKeySymbol,
    conformVO: conformApiKey
}) {

    async selectOne(query) {
        let apiKey;
        if (query.publicId) {
            apiKey = await getDataApiKeys(this).getApiKeyByPublicId(query.publicId);

        } else if (query.value) {
            apiKey = await getDataApiKeys(this).getApiKeyByValue(query.value);

        } else if (query.id) {
            apiKey = await getDataApiKeys(this).getApiKeyById(query.id);
        }
        return apiKey;
    }

    async selectMany(query) {
        let apiKeys;
        if (query.publicId || query.value || query.id) {
            let apiKey = await this.selectOne(query);
            if (apiKey) {
                apiKeys = [apiKey];
            } else {
                apiKeys = [];
            }

        } else if (query.user) {
            let id = await getUserDAO(this).loadId(query.user);
            apiKeys = await getDataUsers(this).getUserApiKeysByUserId(id);

        } else {
            apiKeys = await getApiKeyDAO(services).getAllApiKeys();
        }

        return apiKeys;
    }

    async addAclRule(apiKey, rule) {
        apiKey = await this.loadOne(apiKey);
        let ruleName = await getRuleDAO(this).getRuleName(rule);
        await getDataApiKeys(this).addAclRuleToApiKey(apiKey.id, ruleName);
    }

    async getAclRules(apiKey, ...categories) {
        apiKey = await this.loadOne(apiKey);
        return getRuleDAO(this).loadMany({
            apiKey,
            categories
        });
    }

    async insertOne(data) {
        return getDataApiKeys(this).createApiKey(data.name);
    }

    async deleteOne(query) {
        let result;

        if (query.publicId) {
            result = await getDataApiKeys(this).deleteApiKeyByPublicId(query.publicId);

        } else if (query.value) {
            throw new NotImplementedError();

        } else if (query.id) {
            throw new NotImplementedError();
        }

        return result;
    }
}