import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {URL_PREFERENCES} from "velor-contrib/contrib/urls.mjs";
import {getDataFromResponse} from "velor-api/api/ops/getDataFromResponse.mjs";
import {
    getPreferenceDAO,
    getUserDAO
} from "../application/services/serverServices.mjs";
import {AUTH_TOKEN} from "velor-contrib/contrib/authProviders.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('Preferences', () => {

    it('should create preference', async ({api, services}) => {
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

        let user = await getUserDAO(services).loadOne({
            profileId: 'Token',
            provider: AUTH_TOKEN
        });
        let loaded = await getPreferenceDAO(services).loadOne({user, name: 'preference-name'});

        expect(loaded).to.have.property('name', 'preference-name');
        expect(loaded).to.have.property('value', 'preference-value');
    })

    it('should get preference', async ({api, services}) => {
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
})