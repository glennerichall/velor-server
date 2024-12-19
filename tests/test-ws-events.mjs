import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {URL_PREFERENCES} from "velor-contrib/contrib/urls.mjs";
import {getEventHandler} from "../application/services/services.mjs";
import {getInstanceBinder} from "velor-services/injection/ServicesContext.mjs";
import {s_clientProvider} from "velor-distribution/application/services/serviceKeys.mjs";
import sinon from "sinon";
import {
    EVENT_APIKEY_CREATED,
    EVENT_APIKEY_DELETED,
    EVENT_LOGGED_IN,
    EVENT_LOGGED_OUT,
    EVENT_PREFERENCES_CHANGED
} from "velor-contrib/contrib/events.mjs";
import {getDataFromResponse} from "velor-api/api/ops/getDataFromResponse.mjs";

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();

describe('Websocket events', () => {
    let mockClient;

    beforeEach(async ({services}) => {
        mockClient = {
            send: sinon.stub().resolves()
        };

        let eventHandler = getEventHandler(services);

        getInstanceBinder(eventHandler)
            .setInstance(s_clientProvider, {
                getClient: () => mockClient
            });
    })

    it('should receive login event', async ({api, services}) => {
        await api.loginWithToken();
        let [[message]] = mockClient.send.args;

        expect(message).to.be.an('object');
        expect(message.isEvent).to.be.true;
        expect(message.event).to.eq(EVENT_LOGGED_IN);
    })

    it('should receive logout event', async ({api, services}) => {
        let {context} = await api.loginWithToken();
        mockClient.send.reset();

        await api.logout(context);

        let [[message]] = mockClient.send.args;

        expect(message).to.be.an('object');

        expect(message.isEvent).to.be.true;
        expect(message.event).to.eq(EVENT_LOGGED_OUT);
    })

    it('should receive preference created', async ({api, services}) => {
        let {context} = await api.loginWithToken();

        mockClient.send.reset();

        await api.resources(context).for(URL_PREFERENCES)
            .create().send({
                name: 'preference-name',
                value: 'preference-value'
            });

        let [[message]] = mockClient.send.args;

        expect(message).to.be.an('object');
        expect(message.isEvent).to.be.true;
        expect(message.event).to.eq(EVENT_PREFERENCES_CHANGED);
        expect(message.isJson).to.be.true;
        expect(message.json()).to.deep.eq({
            name: 'preference-name',
        });
    })

    it('should receive preference deleted', async ({api, services}) => {
        let {context} = await api.loginWithToken();

        await api.resources(context).for(URL_PREFERENCES)
            .create().send({
                name: 'preference-name',
                value: 'preference-value'
            });

        mockClient.send.reset();

        await api.resources(context).for(URL_PREFERENCES)
            .delete('preference-name').send();

        let [[message]] = mockClient.send.args;

        expect(message).to.be.an('object');
        expect(message.isEvent).to.be.true;
        expect(message.event).to.eq(EVENT_PREFERENCES_CHANGED);
        expect(message.isJson).to.be.true;
        expect(message.json()).to.deep.eq({
            name: 'preference-name',
        });
    })

    it('should receive api key created', async ({api, services}) => {
        let {context} = await api.loginWithToken();

        mockClient.send.reset();

        await api.apiKeys(context).create({name: 'tototo key'});

        let [[message]] = mockClient.send.args;

        expect(message).to.be.an('object');
        expect(message.isEvent).to.be.true;
        expect(message.isJson).to.be.true;
        expect(message.event).to.eq(EVENT_APIKEY_CREATED);
        expect(message.json()).to.deep.eq({
            name: 'tototo key',
        });

    })

    it('should receive api key deleted', async ({api, services}) => {
        let {context} = await api.loginWithToken();

        let apiKey = await getDataFromResponse(
            api.apiKeys(context).create({name: 'tototo key'})
        );

        mockClient.send.reset();

        await api.apiKeys(context).delete(apiKey.id);

        let [[message]] = mockClient.send.args;

        expect(message).to.be.an('object');
        expect(message.isEvent).to.be.true;
        expect(message.isJson).to.be.true;
        expect(message.event).to.eq(EVENT_APIKEY_DELETED);
        expect(message.json()).to.deep.eq({
            name: 'tototo key',
        });

    })
})