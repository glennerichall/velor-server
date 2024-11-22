import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {getDataAcl} from "../application/services/dataServices.mjs";
import {conformRule} from "../models/conform/conformRule.mjs";
import {getRuleDAO} from "../application/services/serverServices.mjs";
import {composeClearDataAccess} from "./fixtures/database-clear.mjs";

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
    };

    let rule;

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        const {clearAcl} = composeClearDataAccess(database.schema);
        await clearAcl(database);
        rule = getRuleDAO(services);
    })

    async function readAclData() {
        let rule = await getDataAcl(services).getAclRuleByName(data.name);
        rule = conformRule(rule);
        return rule;
    }

    it('should not load unsaved rule', async ({services}) => {
        let loaded = await rule.loadOne({
            name: data.name
        });
        expect(loaded).to.be.null;
    })

    it('should save rule', async () => {
        let saved = await rule.saveOne(data);
        let r = await readAclData();

        expect(saved.id).to.eq(r.id);
        expect(saved.name).to.equal(data.name);
        expect(saved.category).to.equal(data.category);
        expect(saved.permission).to.equal(data.permission);
        expect(saved.description).to.equal(data.description);
        expect(saved.method).to.equal(data.method);
        expect(saved.resource).to.equal(data.resource);

        expect(r.name).to.equal(data.name);
        expect(r.category).to.equal(data.category);
        expect(r.permission).to.equal(data.permission);
        expect(r.description).to.equal(data.description);
        expect(r.method).to.equal(data.method);
        expect(r.resource).to.equal(data.resource);
    })

    it('should load rule from id', async () => {
        let saved = await rule.saveOne(data);
        let id = saved.id;

        let loaded = await rule.loadOne({id});

        expect(loaded.id).to.eq(id);
        expect(loaded.name).to.equal(data.name);
        expect(loaded.category).to.equal(data.category);
        expect(loaded.permission).to.equal(data.permission);
        expect(loaded.description).to.equal(data.description);
        expect(loaded.method).to.equal(data.method);
        expect(loaded.resource).to.equal(data.resource);

    })

    it('should load rule from name', async () => {
        let saved = await rule.saveOne(data);
        let id = saved.id;
        let loaded = await rule.loadOne({name: data.name});

        expect(loaded.name).to.equal(data.name);
        expect(loaded.category).to.equal(data.category);
        expect(loaded.id).to.eq(id);
        expect(loaded.permission).to.equal(data.permission);
        expect(loaded.description).to.equal(data.description);
        expect(loaded.method).to.equal(data.method);
        expect(loaded.resource).to.equal(data.resource);

    })

    it('should not save twice', async () => {
        let saved = await rule.saveOne(data);
        let id = saved.id;

        saved = await rule.saveOne(saved);
        saved = await rule.saveOne(data);

        let rules = await getDataAcl(services).getAllAclRules();
        expect(rules).to.have.length(1);

        expect(saved.name).to.equal(data.name);
        expect(saved.category).to.equal(data.category);
        expect(saved.id).to.eq(id);
        expect(saved.permission).to.equal(data.permission);
        expect(saved.description).to.equal(data.description);
        expect(saved.method).to.equal(data.method);
        expect(saved.resource).to.equal(data.resource);
    })

    it('should freeze rule', async () => {
        let saved = await rule.saveOne(data);
        expect(() => saved.id = 10).to.throw();
        expect(() => saved.category = 10).to.throw();
        expect(() => saved.name = "test").to.throw();
        expect(() => saved.permission = "ALLOW").to.throw();
        expect(() => saved.description = "test description").to.throw();
        expect(() => saved.method = "GET").to.throw();
        expect(() => saved.resource = "/testpath").to.throw();
        expect(() => saved.newProp = 10).to.throw();
    })

})