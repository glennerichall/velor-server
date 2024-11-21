import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {
    clearAcl,
    clearAuths
} from "./fixtures/database-clear.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {Rule} from "../models/Rule.mjs";
import {getDataAcl} from "../application/services/dataServices.mjs";
import {getAclRuleByName} from "../database/acl.mjs";
import {conformRule} from "../models/conform/conformRule.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('Rule', () => {
    let services;

    let data = {
        name: 'foo',
        category: 'baz',
        permission: 'DENY',
        description: 'foo bar',
        method: 'POST',
        resource: '/sdfsdfsdf',
    }

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        await clearAcl(database);
    })

    async function readAclData() {
        let rule = await getDataAcl(services).getAclRuleByName(data.name);
        rule = conformRule(rule);
        return rule;
    }

    it('should map properties from data', async ({services}) => {
        let rule = getServiceBinder(services).createInstance(Rule, data);
        expect(rule.id).to.be.undefined;

        expect(rule.name).to.equal(data.name);
        expect(rule.category).to.equal(data.category);
        expect(rule.permission).to.equal(data.permission);
        expect(rule.description).to.equal(data.description);
        expect(rule.method).to.equal(data.method);
        expect(rule.resource).to.equal(data.resource);
    })

    it('should not load not saved rule', async ({services}) => {
        let rule = getServiceBinder(services).createInstance(Rule, data);
        expect(rule.id).to.be.undefined;

        await rule.load();

        expect(rule.id).to.be.undefined;
        expect(rule.name).to.equal(data.name);
        expect(rule.category).to.equal(data.category);
        expect(rule.permission).to.equal(data.permission);
        expect(rule.description).to.equal(data.description);
        expect(rule.method).to.equal(data.method);
        expect(rule.resource).to.equal(data.resource);
    })

    it('should save rule', async ({services}) => {
        let rule = getServiceBinder(services).createInstance(Rule, data);
        expect(rule.id).to.be.undefined;

        let saved = await rule.save();
        expect(saved).to.be.true;

        let r = await readAclData();

        expect(rule.id).to.eq(r.id);
        expect(rule.name).to.equal(data.name);
        expect(rule.category).to.equal(data.category);
        expect(rule.permission).to.equal(data.permission);
        expect(rule.description).to.equal(data.description);
        expect(rule.method).to.equal(data.method);
        expect(rule.resource).to.equal(data.resource);

        expect(r.name).to.equal(data.name);
        expect(r.category).to.equal(data.category);
        expect(r.permission).to.equal(data.permission);
        expect(r.description).to.equal(data.description);
        expect(r.method).to.equal(data.method);
        expect(r.resource).to.equal(data.resource);
    })

    it('should load rule from id', async () => {
        let rule = getServiceBinder(services).createInstance(Rule, data);
        await rule.save();
        let id = rule.id;

        rule = getServiceBinder(services).createInstance(Rule, {id});

        expect(rule.name).to.be.undefined;
        expect(rule.category).to.be.undefined;
        expect(rule.permission).to.be.undefined;
        expect(rule.description).to.be.undefined;
        expect(rule.method).to.be.undefined;
        expect(rule.resource).to.be.undefined;

        await rule.load();

        expect(rule.id).to.eq(id);
        expect(rule.name).to.equal(data.name);
        expect(rule.category).to.equal(data.category);
        expect(rule.permission).to.equal(data.permission);
        expect(rule.description).to.equal(data.description);
        expect(rule.method).to.equal(data.method);
        expect(rule.resource).to.equal(data.resource);

    })

    it('should load rule from name', async () => {
        let rule = getServiceBinder(services).createInstance(Rule, data);
        await rule.save();
        let id = rule.id;

        rule = getServiceBinder(services).createInstance(Rule, {name: data.name});

        expect(rule.id).to.be.undefined;
        expect(rule.category).to.be.undefined;
        expect(rule.permission).to.be.undefined;
        expect(rule.description).to.be.undefined;
        expect(rule.method).to.be.undefined;
        expect(rule.resource).to.be.undefined;

        await rule.load();

        expect(rule.name).to.equal(data.name);
        expect(rule.category).to.equal(data.category);
        expect(rule.id).to.eq(id);
        expect(rule.permission).to.equal(data.permission);
        expect(rule.description).to.equal(data.description);
        expect(rule.method).to.equal(data.method);
        expect(rule.resource).to.equal(data.resource);

    })

    it('should not save twice', async () => {
        let rule = getServiceBinder(services).createInstance(Rule, data);
        await rule.save();
        let id = rule.id;

        rule = getServiceBinder(services).createInstance(Rule, {name: data.name});
        let saved = await rule.save();
        expect(saved).to.be.false;

        expect(rule.name).to.equal(data.name);
        expect(rule.category).to.equal(data.category);
        expect(rule.id).to.eq(id);
        expect(rule.permission).to.equal(data.permission);
        expect(rule.description).to.equal(data.description);
        expect(rule.method).to.equal(data.method);
        expect(rule.resource).to.equal(data.resource);
    })

})