import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {RoleDAO} from "../models/RoleDAO.mjs";
import {
    getDataAcl,
    getDataRoles
} from "../application/services/dataServices.mjs";
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


describe('Role', () => {
    let services, role;

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        const {
            clearRoles
        } = composeClearDataAccess(database.schema);
        await clearRoles(database);
        role = getServiceBinder(services).createInstance(RoleDAO)
    })

    it('should save role', async ({services}) => {
        let saved = await role.saveOne({
            name: "role1",
            description: "description 1",
        });

        let data = await getDataRoles(services).getRoleByName('role1');

        expect(data).to.have.property('id');
        expect(data).to.have.property('name', 'role1');
        expect(data).to.have.property('description', 'description 1');

        expect(saved.id).to.eq(data.id);
        expect(saved.name).to.eq('role1');
        expect(saved.description).to.eq('description 1');
    })

    it('should load role from role id', async ({services}) => {
        let saved = await role.saveOne({
            name: "role1",
            description: "description 1",
        });
        let id = saved.id;

        let loaded = await role.loadOne({id});

        expect(loaded.id).to.eq(id);
        expect(loaded.name).to.eq('role1');
        expect(loaded.description).to.eq('description 1');
    })


    it('should load role from role name', async ({services}) => {
        let saved = await role.saveOne({
            name: "role1",
            description: "description 1",
        });
        let id = saved.id;
        let loaded = await role.loadOne({name: 'role1'});

        expect(loaded.id).to.eq(id);
        expect(loaded.name).to.eq('role1');
        expect(loaded.description).to.eq('description 1');
    })

    it('should not save twice', async ({services}) => {
        let saved = await role.saveOne({
            name: "role1",
            description: "description 1",
        });
        let id = saved.id;

        await role.saveOne(saved);

        saved = await role.saveOne({
            name: "role1",
            description: "description 1",
        });

        expect(saved.id).to.eq(id);

        let roles = await getDataRoles(services).getAllRoles();

        expect(roles).to.have.length(1);
    })

    it('should freeze role', async () => {
        let saved = await role.saveOne({
            name: "role1",
            description: "description 1",
        });

        expect(Object.isFrozen(saved)).to.be.true;
    })

    it('should add acl rules', async () => {
        let saved = await role.saveOne({
            name: "role1",
            description: "description 1",
        });

        let rule1 = await getRuleDAO(services).saveOne({
            name: 'qux',
            category: 'baz',
            permission: 'ALLOW',
            description: 'quiz',
            method: 'POST',
            resource: '/sdfsdfsdf',
        });

        let rule2 = await getRuleDAO(services).saveOne({
            name: 'foo',
            category: 'baz',
            permission: 'DENY',
            description: 'foo bar',
            method: 'POST',
            resource: '/sdfsdfsdf',
        });

        await role.addAclRule(saved, {id: rule1.id});
        await role.addAclRule(saved, {name: rule2.name});

        let rules = await getDataRoles(services).getRoleAclRulesByName(saved.name);
        expect(rules).to.have.length(2);

        expect(rules.map(rule=>rule.id)).includes(rule1.id);
        expect(rules.map(rule=>rule.id)).includes(rule2.id);

        rules = await getDataAcl(services).getAllAclRules();
        expect(rules).to.have.length(2);
    })

    it('should get acl rules', async () => {
        let saved = await role.saveOne({
            name: "role1",
            description: "description 1",
        });

        let rule1 = await getRuleDAO(services).saveOne({
            name: 'qux',
            category: 'baz',
            permission: 'ALLOW',
            description: 'quiz',
            method: 'POST',
            resource: '/sdfsdfsdf',
        });

        let rule2 = await getRuleDAO(services).saveOne({
            name: 'foo',
            category: 'baz',
            permission: 'DENY',
            description: 'foo bar',
            method: 'POST',
            resource: '/sdfsdfsdf',
        });

        await role.addAclRule(saved, {id: rule1.id});
        await role.addAclRule(saved, {name: rule2.name});

        let rules = await role.getAclRules({id: saved.id});

        expect(rules).to.have.length(2);
        expect(rules.map(rule=>rule.id)).includes(rule1.id);
        expect(rules.map(rule=>rule.id)).includes(rule2.id);
    })



})