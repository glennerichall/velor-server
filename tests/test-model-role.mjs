import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {getDatabase} from "velor-database/application/services/databaseServices.mjs";
import {
    clearRoles
} from "./fixtures/database-clear.mjs";
import {getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {Role} from "../models/Role.mjs";
import {getDataRoles} from "../application/services/dataServices.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('Role', () => {
    let services;

    beforeEach(async ({services: s}) => {
        services = s;
        const database = getDatabase(services);
        await clearRoles(database);
    })

    it('should map properties from data', async ({services}) => {
        let role = getServiceBinder(services).createInstance(Role, {
            name: "role1",
            description: "description 1",
        });
        expect(role.id).to.be.undefined;
        expect(role.name).to.eq('role1');
        expect(role.description).to.eq('description 1');
    })

    it('should save role', async ({services}) => {
        let role = getServiceBinder(services).createInstance(Role, {
            name: "role1",
            description: "description 1",
        });
        expect(role.id).to.be.undefined;
        let saved = await role.save();
        expect(saved).to.be.true;

        let data = await getDataRoles(services).getRoleByName('role1');
        expect(data).to.have.property('id');
        expect(data).to.have.property('name', 'role1');
        expect(data).to.have.property('description', 'description 1');

        expect(role.id).to.eq(data.id);
        expect(role.name).to.eq('role1');
        expect(role.description).to.eq('description 1');
    })

    it('should load role from role id', async ({services}) => {
        let role = getServiceBinder(services).createInstance(Role, {
            name: "role1",
            description: "description 1",
        });
        await role.save();
        let id = role.id;

        role = getServiceBinder(services).createInstance(Role, {
            id
        });

        expect(role.id).to.eq(id);
        expect(role.name).to.be.undefined;
        expect(role.description).to.be.undefined;

        await role.load();

        expect(role.id).to.eq(id);
        expect(role.name).to.eq('role1');
        expect(role.description).to.eq('description 1');
    })


    it('should load role from role name', async ({services}) => {
        let role = getServiceBinder(services).createInstance(Role, {
            name: "role1",
            description: "description 1",
        });
        await role.save();
        let id = role.id;

        role = getServiceBinder(services).createInstance(Role, {
            name: 'role1'
        });

        expect(role.id).to.be.undefined
        expect(role.name).to.eq('role1');
        expect(role.description).to.be.undefined;

        await role.load();

        expect(role.id).to.eq(id);
        expect(role.name).to.eq('role1');
        expect(role.description).to.eq('description 1');
    })

    it('should not save if already saved', async ({services}) => {
        let role = getServiceBinder(services).createInstance(Role, {
            name: "role1",
            description: "description 1",
        });
        await role.save();

        role = getServiceBinder(services).createInstance(Role, {
            name: 'role1'
        });

        let saved = await role.save();
        expect(saved).to.be.false;

        expect(role.name).to.eq('role1');
        expect(role.description).to.eq('description 1');
    })

    it('should load rules', async () => {

    })

})