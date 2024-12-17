import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {URL_PREFERENCES} from "velor-contrib/contrib/urls.mjs";
import {getDataFromResponse} from "velor-api/api/ops/getDataFromResponse.mjs";

import {AUTH_TOKEN} from "velor-contrib/contrib/authProviders.mjs";
import {
    getPreferenceDAO,
    getUserDAO
} from "velor-dbuser/application/services/services.mjs";
import {doNotThrowOnStatusRule} from "velor-api/api/ops/rules.mjs";
import {userTest} from "./contrib/userTest.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


// testing preferences also tests ResourceBuilder

describe('Preferences', () => {

    it('should create preference as string', async ({api, services}) => {
        let {context} = await api.loginWithToken();

        let response = await api.resources(context)
            .for(URL_PREFERENCES).create().send({
                name: 'preference-name',
                value: 'preference-value'
            });

        expect(response).to.be.an('object');
        expect(response.status).to.eq(201);

        let preference = await getDataFromResponse(response);
        expect(preference).to.have.property('name', 'preference-name');
        expect(preference).to.have.property('value', 'preference-value');

        expect(Object.keys(preference)).to.have.length(2);

        let user = await getUserDAO(services).loadOne(userTest);
        let loaded = await getPreferenceDAO(services).loadOne({user, name: 'preference-name'});

        expect(loaded).to.have.property('name', 'preference-name');
        expect(loaded).to.have.property('value', 'preference-value');
    })

    it('should get preference as string', async ({api, services}) => {
        let {context} = await api.loginWithToken();

        await api.resources(context)
            .for(URL_PREFERENCES).create().send({
                name: 'preference-name',
                value: 'preference-value'
            });

        let response = await api.resources(context)
            .for(URL_PREFERENCES).getOne('preference-name').send();

        expect(response).to.be.an('object');
        expect(response.status).to.eq(200);

        let preference = await getDataFromResponse(response);
        expect(preference).to.have.property('name', 'preference-name');
        expect(preference).to.have.property('value', 'preference-value');

        expect(Object.keys(preference)).to.have.length(2);
    })

    it('should not get unknown preference', async ({api, services}) => {
        let {context} = await api.loginWithToken();

        let response = await api.resources(context)
            .for(URL_PREFERENCES)
            .withRule(doNotThrowOnStatusRule(404))
            .getOne('preference-name').send();

        expect(response.status).to.eq(404);
    })

    it('should not delete unknown preference', async ({api, services}) => {
        let {context} = await api.loginWithToken();

        let response = await api.resources(context)
            .for(URL_PREFERENCES)
            .withRule(doNotThrowOnStatusRule(404))
            .delete('preference-name').send();

        expect(response.status).to.eq(404);
    })

    it('should not delete preference if not logged in', async ({api, services}) => {
        let {context} = await api.getCsrfToken();
        let response = await api.resources(context)
            .for(URL_PREFERENCES)
            .withRule(doNotThrowOnStatusRule(401))
            .delete('preference-name').send();
        expect(response.status).to.eq(401);
    })

    it('should not save preference if not logged in', async ({api, services}) => {
        let {context} = await api.getCsrfToken();
        let response = await api.resources(context)
            .for(URL_PREFERENCES)
            .withRule(doNotThrowOnStatusRule(401))
            .create().send({
                name: 'preference-name',
                value: 'preference-value'
            });
        expect(response.status).to.eq(401);
    })

    it('should not get preference if not logged in', async ({api, services}) => {
        let {context} = await api.getCsrfToken();
        let response = await api.resources(context)
            .for(URL_PREFERENCES)
            .withRule(doNotThrowOnStatusRule(401))
            .getOne('preference-name').send();
        expect(response.status).to.eq(401);
    })

    it('should get default preferences', async({api, services}) => {
        let {context} = await api.loginWithToken();

        let response = await api.resources(context)
            .for(URL_PREFERENCES)
            .withRule(doNotThrowOnStatusRule(404))
            .delete('preference-name').send();

    })
})