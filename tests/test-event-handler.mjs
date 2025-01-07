import sinon from "sinon";
import {setupTestContext} from "./fixtures/setupTestContext.mjs";
import {EventHandler} from "../events/EventHandler.mjs";
import {
    getInstanceBinder,
    getServiceBinder
} from "velor-services/injection/ServicesContext.mjs";
import {s_clientProvider} from "velor-distribution/application/services/serviceKeys.mjs";
import {s_messageFactory} from "../application/services/serviceKeys.mjs";
import {
    ELEMENT_CREATED,
    ELEMENT_DELETED
} from "velor-dbuser/models/events.mjs";
import {
    API_KEY,
    PREFERENCE
} from "velor-dbuser/models/names.mjs";
import {
    EVENT_USER_LOGIN,
    EVENT_USER_LOGOUT
} from "../application/services/eventKeys.mjs";
import {s_database} from "velor-database/application/services/serviceKeys.mjs";
import {DATA_USERS} from "velor-dbuser/application/services/dataKeys.mjs";
import {s_logger} from "velor-services/application/services/serviceKeys.mjs";
import {mockLogger} from 'velor-utils/test/mockLogger.mjs';

const {
    expect,
    test,
    describe,
    afterEach,
    beforeEach,
    it,
} = setupTestContext();


describe('EventHandler', () => {
    let eventHandler;
    let mockClient, mockFactory;


    beforeEach(({services}) => {
        mockClient = {
            send: sinon.stub().resolves()
        };

        mockFactory = {
            preferencesChanged: sinon.stub(),
            apiKeyCreated: sinon.stub(),
            apiKeyDeleted: sinon.stub(),
            loggedIn: sinon.stub(),
            loggedOut: sinon.stub()
        };

        eventHandler = getServiceBinder(services).createInstance(EventHandler);
        getInstanceBinder(services)
            .setInstance(s_clientProvider, {
                getClient: () => mockClient
            })
            .setInstance(s_messageFactory, mockFactory)
            .setInstance(s_database, {
                [DATA_USERS]: {
                    getPrimaryAuthByUserId: sinon.stub()
                }
            })
            .setInstance(s_logger, mockLogger);

    });

    afterEach(() => {
        sinon.restore();
    });

    describe('handleEvent', () => {
        it('should send a preference changed message on ELEMENT_CREATED event for PREFERENCE', async () => {
            const preference = {userId: 'user123', name: 'dark_mode'};
            mockFactory.preferencesChanged.returns('preferenceMessage');

            await eventHandler.handleEvent(ELEMENT_CREATED, PREFERENCE, preference);

            expect(mockFactory.preferencesChanged).calledWith(preference);
            expect(mockClient.send).calledWith('preferenceMessage');
        });

        it('should send an API key created message on ELEMENT_CREATED event for API_KEY', async () => {
            const apiKey = {userId: 'user456'};
            mockFactory.apiKeyCreated.returns('apiKeyCreatedMessage');

            await eventHandler.handleEvent(ELEMENT_CREATED, API_KEY, apiKey);

            expect(mockFactory.apiKeyCreated.calledOnce).to.be.true;
            expect(mockClient.send.calledWith('apiKeyCreatedMessage')).to.be.true;
        });

        it('should send an API key deleted message on ELEMENT_DELETED event for API_KEY', async () => {
            const apiKey = {userId: 'user789'};
            mockFactory.apiKeyDeleted.returns('apiKeyDeletedMessage');

            await eventHandler.handleEvent(ELEMENT_DELETED, API_KEY, apiKey);

            expect(mockFactory.apiKeyDeleted).calledOnce;

            expect(mockClient.send.calledWith('apiKeyDeletedMessage')).to.be.true;
        });

        it('should send a logged in message on EVENT_USER_LOGIN', async ({services}) => {

            const user = {id: 'user123'};
            mockFactory.loggedIn.returns('loggedInMessage');

            await eventHandler.handleEvent(EVENT_USER_LOGIN, user);

            expect(mockFactory.loggedIn.calledOnce).to.be.true;
            expect(mockClient.send.calledWith('loggedInMessage')).to.be.true;
        });

        it('should send a logged out message on EVENT_USER_LOGOUT', async ({services}) => {

            const user = {id: 'user123'};
            mockFactory.loggedOut.returns('loggedOutMessage');

            await eventHandler.handleEvent(EVENT_USER_LOGOUT, user);

            expect(mockFactory.loggedOut.calledOnce).to.be.true;
            expect(mockClient.send.calledWith('loggedOutMessage')).to.be.true;
        });

        it('should log an error if client.send fails', async () => {
            const apiKey = {userId: 'user456'};
            mockFactory.apiKeyCreated.returns('apiKeyCreatedMessage');
            mockClient.send.rejects(new Error('Network Error'));

            await eventHandler.handleEvent(ELEMENT_CREATED, API_KEY, apiKey);

            expect(mockLogger.error).calledOnce;
            expect(mockLogger.error.args[0][0]).to.include('Failed to send message to client');
        });
    });
});
